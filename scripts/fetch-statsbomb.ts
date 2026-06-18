/**
 * StatsBomb open data ingestion script.
 *
 * Fetches matches from the StatsBomb open-data GitHub repo
 * and converts them to PitchIQ-AI SampleMatch format.
 *
 * Usage: npx tsx scripts/fetch-statsbomb.ts
 *
 * Requires: tsx (npm install -D tsx)
 */

import * as fs from "fs";
import * as path from "path";

const STATSBOMB_RAW = "https://raw.githubusercontent.com/statsbomb/open-data/master/data";
const COMPETITIONS_URL = `${STATSBOMB_RAW}/competitions.json`;
const MATCHES_DIR = `${STATSBOMB_RAW}/matches`;
const EVENTS_DIR = `${STATSBOMB_RAW}/events`;

interface SBCompetition {
  competition_id: number;
  season_id: number;
  competition_name: string;
  season_name: string;
}

interface SBMatch {
  match_id: number;
  home_team: { home_team_name: string };
  away_team: { away_team_name: string };
  competition: { competition_name: string };
  season: { season_name: string };
  home_score?: number;
  away_score?: number;
}

interface SBEvent {
  minute: number;
  type: { name: string };
  team?: { name: string };
  player?: { name: string };
  possession_team?: { name: string };
}

interface PitchIQEvent {
  minute: number;
  type: "goal" | "card" | "substitution" | "shot" | "corner" | "foul" | "missed-penalty" | "penalty";
  team: "home" | "away";
  player?: string;
  description: string;
}

interface PitchIQMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  formations: { home: string; away: string };
  events: PitchIQEvent[];
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

function mapStatsBombEvent(event: SBEvent, homeTeamName: string, awayTeamName: string): PitchIQEvent | null {
  const type = event.type?.name;
  const teamName = event.team?.name ?? "";
  const team: "home" | "away" = teamName === homeTeamName ? "home" : "away";
  const player = event.player?.name;

  switch (type) {
    case "Goal":
      return { minute: event.minute, type: "goal", team, player, description: `Goal by ${player || "unknown"}` };
    case "Shot":
      return { minute: event.minute, type: "shot", team, player, description: `Shot by ${player || "unknown"}` };
    case "Foul":
      return { minute: event.minute, type: "foul", team, player, description: `Foul by ${player || "unknown"}` };
    case "Corner":
      return { minute: event.minute, type: "corner", team, player, description: `Corner for ${teamName}` };
    case "Substitution":
      return { minute: event.minute, type: "substitution", team, player: player || undefined, description: `Substitution: ${player || "unknown"}` };
    case "Card":
      return { minute: event.minute, type: "card", team, player, description: `Card for ${player || "unknown"}` };
    case "Penalty":
      return { minute: event.minute, type: "penalty", team, player, description: `Penalty by ${player || "unknown"}` };
    case "Missed Penalty":
      return { minute: event.minute, type: "missed-penalty", team, player, description: `Penalty missed by ${player || "unknown"}` };
    default:
      return null;
  }
}

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function main() {
  console.log("Fetching StatsBomb competitions...");
  const competitions = (await fetchJSON(COMPETITIONS_URL)) as SBCompetition[];

  // Filter to major competitions with open data
  const targets = competitions.filter(
    (c) =>
      c.competition_name.includes("World Cup") ||
      c.competition_name.includes("Euro") ||
      c.competition_name.includes("Champions League") ||
      c.competition_name.includes("Premier League") ||
      c.competition_name.includes("La Liga") ||
      c.competition_name.includes("Bundesliga") ||
      c.competition_name.includes("Serie A") ||
      c.competition_name.includes("Ligue 1")
  );

  console.log(`Found ${targets.length} target competitions`);

  const allMatches: PitchIQMatch[] = [];

  for (const comp of targets.slice(0, 5)) {
    const { competition_id, season_id, competition_name, season_name } = comp;
    const matchUrl = `${MATCHES_DIR}/${competition_id}/${season_id}.json`;

    console.log(`Fetching matches for ${competition_name} ${season_name}...`);
    let matches: SBMatch[];
    try {
      matches = (await fetchJSON(matchUrl)) as SBMatch[];
    } catch {
      console.log(`  Skipping ${competition_name} ${season_name} (no data)`);
      continue;
    }

    for (const match of matches.slice(0, 5)) {
      const homeTeam = match.home_team.home_team_name;
      const awayTeam = match.away_team.away_team_name;
      const eventUrl = `${EVENTS_DIR}/${match.match_id}.json`;

      console.log(`  Fetching events for ${homeTeam} vs ${awayTeam}...`);
      let events: SBEvent[];
      try {
        events = (await fetchJSON(eventUrl)) as SBEvent[];
      } catch {
        console.log(`    Skipping (no events)`);
        continue;
      }

      const mappedEvents = events
        .map((e) => mapStatsBombEvent(e, homeTeam, awayTeam))
        .filter((e): e is PitchIQEvent => e !== null)
        .sort((a, b) => a.minute - b.minute);

      const homeGoals = mappedEvents.filter((e) => e.type === "goal" && e.team === "home").length;
      const awayGoals = mappedEvents.filter((e) => e.type === "goal" && e.team === "away").length;
      const homeShots = mappedEvents.filter((e) => (e.type === "shot" || e.type === "goal") && e.team === "home").length;
      const awayShots = mappedEvents.filter((e) => (e.type === "shot" || e.type === "goal") && e.team === "away").length;
      const homeFouls = mappedEvents.filter((e) => e.type === "foul" && e.team === "home").length;
      const awayFouls = mappedEvents.filter((e) => e.type === "foul" && e.team === "away").length;
      const homeCorners = mappedEvents.filter((e) => e.type === "corner" && e.team === "home").length;
      const awayCorners = mappedEvents.filter((e) => e.type === "corner" && e.team === "away").length;

      const id = `${competition_id}-${match.match_id}`;

      allMatches.push({
        id,
        homeTeam,
        awayTeam,
        competition: `${competition_name} ${season_name}`,
        formations: { home: "4-3-3", away: "4-3-3" },
        events: mappedEvents.slice(0, 30),
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: homeShots, away: awayShots },
          shotsOnTarget: { home: Math.round(homeShots * 0.4), away: Math.round(awayShots * 0.4) },
          passes: { home: 400, away: 350 },
          passAccuracy: { home: 80, away: 75 },
          fouls: { home: homeFouls, away: awayFouls },
          corners: { home: homeCorners, away: awayCorners },
        },
      });

      console.log(`    ${homeTeam} ${homeGoals}-${awayGoals} ${awayTeam} (${mappedEvents.length} events)`);
    }
  }

  // Save to data directory
  const outputPath = path.join(process.cwd(), "data", "sample-matches.json");

  // Merge with existing matches
  const existingPath = path.join(process.cwd(), "data", "sample-matches.json");
  let existing: PitchIQMatch[] = [];
  if (fs.existsSync(existingPath)) {
    existing = JSON.parse(fs.readFileSync(existingPath, "utf-8"));
  }

  const merged = [...existing];
  for (const m of allMatches) {
    if (!merged.find((existing) => existing.id === m.id)) {
      merged.push(m);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`\nDone! Written ${merged.length} matches to ${outputPath}`);
}

main().catch(console.error);
