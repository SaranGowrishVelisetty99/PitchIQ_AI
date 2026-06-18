interface EspnEvent {
  id: string;
  name: string;
  date: string;
  season: { year: number; type: number };
  competitions: {
    id: string;
    status: { type: { state: "pre" | "in" | "post"; completed: boolean; detail: string; shortDetail: string } };
    competitors: {
      id: string;
      homeAway: "home" | "away";
      score: string;
      team: { id: string; name: string; abbreviation: string };
      statistics: { name: string; abbreviation: string; displayValue: string }[];
    }[];
    details: {
      type: { id: string; text: string };
      clock: { value: number; displayValue: string };
      team: { id: string };
      scoringPlay: boolean;
      penaltyKick: boolean;
      ownGoal: boolean;
      shootout: boolean;
      yellowCard: boolean;
      redCard: boolean;
      athletesInvolved: { id: string; displayName: string; shortName: string }[];
    }[];
    altGameNote?: string;
  }[];
}

export interface MatchSearchResult {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  status: "pre" | "in" | "post";
  score?: string;
}

export interface MatchDetail {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  formations: { home: string; away: string };
  events: {
    minute: number;
    type: string;
    team: "home" | "away";
    player?: string;
    description: string;
  }[];
  stats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    passes: { home: number; away: number };
    passAccuracy: { home: number; away: number };
    fouls: { home: number; away: number };
    corners: { home: number; away: number };
  };
}

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

function parseMinute(displayValue: string): number {
  const match = displayValue.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function extractTeamId(homeId: string, awayId: string, teamId: string): "home" | "away" {
  return teamId === homeId ? "home" : "away";
}

function describeEvent(detail: EspnEvent["competitions"][0]["details"][0], teamName: string, opponentName: string): string {
  const player = detail.athletesInvolved?.[0]?.displayName || "Unknown";
  switch (detail.type.text) {
    case "Goal": return detail.ownGoal ? `${player} (${opponentName}) — Own goal` : `${player} scored`;
    case "Penalty - Scored": return `${player} scored from the penalty spot`;
    case "Penalty - Missed": return `${player} missed penalty`;
    case "Yellow Card": return `${player} shown a yellow card`;
    case "Red Card": return `${player} shown a red card`;
    case "Substitution": return `${detail.athletesInvolved?.find(a => !a.displayName.includes(" "))?.displayName || player} substituted on`;
    default: return `${player} — ${detail.type.text}`;
  }
}

function inferFormation(teamName: string): string {
  const common = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "3-4-3", "4-1-4-1", "4-5-1"];
  const hash = teamName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return common[hash % common.length];
}

export async function getMatchesByYear(year: number): Promise<MatchSearchResult[]> {
  try {
    const res = await fetch(`${ESPN_BASE}?dates=${year}&limit=1000`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];

    const data = await res.json() as { events: EspnEvent[] };
    if (!data.events || !Array.isArray(data.events)) return [];

    return data.events
      .filter((e) => e.competitions?.[0]?.status?.type?.state === "post")
      .map((e) => {
      const c = e.competitions?.[0];
      const home = c?.competitors?.find((t) => t.homeAway === "home");
      const away = c?.competitors?.find((t) => t.homeAway === "away");

      return {
        id: e.id,
        date: e.date,
        homeTeam: home?.team?.name || "Unknown",
        awayTeam: away?.team?.name || "Unknown",
        competition: c?.altGameNote || "FIFA World Cup",
        status: "post" as const,
        score: `${home?.score ?? "?"}-${away?.score ?? "?"}`,
      };
    });
  } catch {
    return [];
  }
}

export async function getMatchDetails(matchId: string): Promise<MatchDetail | null> {
  try {
    const res = await fetch(`${ESPN_BASE}/${matchId}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data = await res.json() as EspnEvent;
    const c = data.competitions?.[0];
    if (!c) return null;

    const home = c.competitors?.find((t) => t.homeAway === "home");
    const away = c.competitors?.find((t) => t.homeAway === "away");
    if (!home || !away) return null;

    const homeId = home.id;
    const awayId = away.id;
    const homeName = home.team.name;
    const awayName = away.team.name;

    const homeStats = home.statistics || [];
    const awayStats = away.statistics || [];

    const findStat = (stats: typeof homeStats, name: string): number => {
      const s = stats.find((st) => st.name === name);
      return s ? parseFloat(s.displayValue) || 0 : 0;
    };

    const events = (c.details || []).map((d) => {
      const team = extractTeamId(homeId, awayId, d.team?.id || "");
      const teamName = team === "home" ? homeName : awayName;
      const opponentName = team === "home" ? awayName : homeName;

      let type = "shot";
      if (d.type.text === "Goal" || d.type.text === "Own Goal") type = "goal";
      else if (d.type.text === "Penalty - Scored") type = "goal";
      else if (d.type.text === "Penalty - Missed") type = "missed-penalty";
      else if (d.yellowCard || d.redCard) type = "card";
      else if (d.type.text === "Substitution") type = "substitution";

      return {
        minute: parseMinute(d.clock?.displayValue || "0'"),
        type,
        team,
        player: d.athletesInvolved?.[0]?.displayName || undefined,
        description: describeEvent(d, teamName, opponentName),
      };
    });

    return {
      id: matchId,
      homeTeam: homeName,
      awayTeam: awayName,
      homeScore: parseInt(home.score, 10) || 0,
      awayScore: parseInt(away.score, 10) || 0,
      competition: c.altGameNote || "FIFA World Cup",
      formations: { home: inferFormation(homeName), away: inferFormation(awayName) },
      events,
      stats: {
        possession: { home: Math.round(findStat(homeStats, "possessionPct")), away: Math.round(findStat(awayStats, "possessionPct")) },
        shots: { home: Math.round(findStat(homeStats, "totalShots")), away: Math.round(findStat(awayStats, "totalShots")) },
        shotsOnTarget: { home: Math.round(findStat(homeStats, "shotsOnTarget")), away: Math.round(findStat(awayStats, "shotsOnTarget")) },
        passes: { home: 0, away: 0 },
        passAccuracy: { home: 0, away: 0 },
        fouls: { home: Math.round(findStat(homeStats, "foulsCommitted")), away: Math.round(findStat(awayStats, "foulsCommitted")) },
        corners: { home: Math.round(findStat(homeStats, "wonCorners")), away: Math.round(findStat(awayStats, "wonCorners")) },
      },
    };
  } catch {
    return null;
  }
}
