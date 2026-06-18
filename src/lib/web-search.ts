const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

const LEAGUES: Record<string, string> = {
  "premier league": "eng.1",
  "epl": "eng.1",
  "english premier league": "eng.1",
  "la liga": "esp.1",
  "laliga": "esp.1",
  "serie a": "ita.1",
  "serie-a": "ita.1",
  "bundesliga": "ger.1",
  "ligue 1": "fra.1",
  "ligue-1": "fra.1",
  "champions league": "uefa.champions",
  "ucl": "uefa.champions",
  "world cup": "fifa.world",
  "fifa world cup": "fifa.world",
  "europa league": "uefa.europa",
  "europa conference league": "uefa.europaconference",
};

const COMPETITION_ALIASES: Record<string, string> = {
  "euro 2024": "uefa.european-championship",
  "european championship": "uefa.european-championship",
  "copa america": "america.copa-america",
  "african cup of nations": "africa.caf-africa-cup-of-nations",
  "afcon": "africa.caf-africa-cup-of-nations",
};

interface EspnScoreboardEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  season: { year: number };
  competitions: {
    competitors: {
      team: { name: string; abbreviation: string };
      score: string;
      homeAway: "home" | "away";
    }[];
    status: {
      type: {
        state: "pre" | "in" | "post";
        completed: boolean;
        detail: string;
        shortDetail: string;
      };
    };
  }[];
}

function detectLeagues(query: string): string[] {
  const lower = query.toLowerCase();
  const found: string[] = [];

  for (const [keyword, leagueId] of Object.entries(LEAGUES)) {
    if (lower.includes(keyword)) {
      found.push(leagueId);
    }
  }
  for (const [keyword, competitionId] of Object.entries(COMPETITION_ALIASES)) {
    if (lower.includes(keyword)) {
      found.push(competitionId);
    }
  }

  const teamIndicators = [
    "arsenal", "chelsea", "liverpool", "manchester", "man city", "mancity",
    "tottenham", "spurs", "newcastle", "aston villa", "everton",
    "barcelona", "real madrid", "atletico madrid", "atlético madrid",
    "bayern", "dortmund", "leverkusen",
    "juventus", "milan", "inter", "napoli", "roma",
    "psg", "marseille", "lyon", "monaco",
    "flamengo", "palmeiras", "santos", "corinthians",
    "river plate", "boca juniors",
    "celtic", "rangers",
    "ajax", "psv", "feyenoord",
    "sporting", "benfica", "porto",
  ];

  if (found.length === 0 && teamIndicators.some((t) => lower.includes(t))) {
    found.push("eng.1");
  }

  return found;
}

function formatScoreboardEvents(events: EspnScoreboardEvent[]): string {
  if (events.length === 0) return "";

  return events
    .map((e) => {
      const home = e.competitions[0]?.competitors?.find((c) => c.homeAway === "home");
      const away = e.competitions[0]?.competitors?.find((c) => c.homeAway === "away");
      const status = e.competitions[0]?.status?.type?.shortDetail || "";
      const date = new Date(e.date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      });

      if (e.competitions[0]?.status?.type?.state === "post") {
        return `${date}: ${home?.team?.name || "?"} ${home?.score || "?"}-${away?.score || "?"} ${away?.team?.name || "?"} (${status})`;
      }
      return `${date}: ${home?.team?.name || "?"} vs ${away?.team?.name || "?"} — ${status}`;
    })
    .join("\n");
}

async function fetchLeagueScoreboard(leagueId: string, year?: number): Promise<EspnScoreboardEvent[]> {
  try {
    let url = `${ESPN_BASE}/${leagueId}/scoreboard`;
    if (year) {
      url += `?dates=${year}`;
    }
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { events?: EspnScoreboardEvent[] };
    return data.events || [];
  } catch {
    return [];
  }
}

function extractYear(query: string): number | undefined {
  const match = query.match(/\b(20\d{2})\b/);
  return match ? parseInt(match[1], 10) : undefined;
}

function isRecentQuery(query: string): boolean {
  const lower = query.toLowerCase();
  const recentKeywords = [
    "latest", "recent", "today", "yesterday", "tonight", "last night",
    "upcoming", "current", "this week", "this season", "this year",
    "results", "scores", "standings", "fixtures", "schedule",
    "who won", "who is winning", "who played", "match report",
    "highlights", "recap",
  ];
  return recentKeywords.some((k) => lower.includes(k));
}

export interface WebSearchResult {
  context: string;
  sources: { title: string; url: string }[];
}

export async function searchRecentSoccerData(query: string): Promise<WebSearchResult> {
  const lower = query.toLowerCase();
  const detectedLeagues = detectLeagues(query);
  const year = extractYear(query) || new Date().getFullYear();
  const lookForRecent = isRecentQuery(query) || detectedLeagues.length > 0;

  if (!lookForRecent && detectedLeagues.length === 0) {
    return { context: "", sources: [] };
  }

  const leaguesToSearch = detectedLeagues.length > 0 ? detectedLeagues : ["eng.1", "esp.1", "ita.1", "ger.1", "fra.1", "uefa.champions"];
  const sources: WebSearchResult["sources"] = [];
  const contextParts: string[] = [];

  for (const leagueId of leaguesToSearch.slice(0, 3)) {
    const events = await fetchLeagueScoreboard(leagueId, year);
    if (events.length > 0) {
      const leagueName = Object.entries(LEAGUES).find(([, id]) => id === leagueId)?.[0]
        || Object.entries(COMPETITION_ALIASES).find(([, id]) => id === leagueId)?.[0]
        || leagueId;
      contextParts.push(`=== ${leagueName.toUpperCase()} ===\n${formatScoreboardEvents(events)}`);
      sources.push({
        title: `${leagueName} scores`,
        url: `https://www.espn.com/soccer/scoreboard/_/league/${leagueId}`,
      });
    }
  }

  if (contextParts.length === 0) {
    return { context: "", sources: [] };
  }

  return {
    context: `Recent soccer match data (${year}):\n\n${contextParts.join("\n\n")}`,
    sources,
  };
}
