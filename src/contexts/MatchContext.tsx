"use client";

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type { MatchEvent, MatchStats, SampleMatch } from "../../types";
import sampleMatchesData from "../../data/sample-matches.json";

interface ExternalMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  formations: { home: string; away: string };
  events: MatchEvent[];
  stats: MatchStats;
}

interface AnalysisCache {
  result: unknown;
  streamText: string;
}

interface MatchState {
  homeTeam: string;
  awayTeam: string;
  competition: string;
  homeFormation: string;
  awayFormation: string;
  events: MatchEvent[];
  stats: MatchStats;
  selectedMatchId: string | null;
  fetchedHomeScore: number | null;
  fetchedAwayScore: number | null;
}

interface MatchContextValue extends MatchState {
  setHomeTeam: (team: string) => void;
  setAwayTeam: (team: string) => void;
  setHomeFormation: (f: string) => void;
  setAwayFormation: (f: string) => void;
  setEvents: (events: MatchEvent[]) => void;
  setStats: (stats: MatchStats) => void;
  resetMatch: () => void;
  loadSampleMatch: (id: string) => void;
  selectMatch: (id: string | null) => void;
  loadExternalMatch: (match: ExternalMatch) => void;
  sampleMatches: SampleMatch[];
  homeScore: number;
  awayScore: number;
  summaryLine: string;
  analysisResults: Record<string, AnalysisCache | null>;
  setAnalysisResult: (key: string, data: AnalysisCache | null) => void;
}

const defaultStats: MatchStats = {
  possession: { home: 50, away: 50 },
  shots: { home: 0, away: 0 },
  shotsOnTarget: { home: 0, away: 0 },
  passes: { home: 0, away: 0 },
  passAccuracy: { home: 0, away: 0 },
  fouls: { home: 0, away: 0 },
  corners: { home: 0, away: 0 },
};

const defaultState: MatchState = {
  homeTeam: "",
  awayTeam: "",
  competition: "",
  homeFormation: "4-4-2",
  awayFormation: "4-2-3-1",
  events: [],
  stats: defaultStats,
  selectedMatchId: null,
  fetchedHomeScore: null,
  fetchedAwayScore: null,
};

const MatchContext = createContext<MatchContextValue | null>(null);

function computeScore(events: MatchEvent[], homeTeam: string, awayTeam: string): { home: number; away: number } {
  let home = 0;
  let away = 0;
  for (const e of events) {
    if (e.type === "goal") {
      if (e.team === "home") home++;
      else away++;
    }
  }
  return { home, away };
}

export function MatchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MatchState>(defaultState);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisCache | null>>({});
  const sampleMatches = sampleMatchesData as SampleMatch[];

  const setHomeTeam = useCallback((homeTeam: string) => setState((s) => ({ ...s, homeTeam })), []);
  const setAwayTeam = useCallback((awayTeam: string) => setState((s) => ({ ...s, awayTeam })), []);
  const setHomeFormation = useCallback((homeFormation: string) => setState((s) => ({ ...s, homeFormation })), []);
  const setAwayFormation = useCallback((awayFormation: string) => setState((s) => ({ ...s, awayFormation })), []);
  const setEvents = useCallback((events: MatchEvent[]) => setState((s) => ({ ...s, events })), []);
  const setStats = useCallback((stats: MatchStats) => setState((s) => ({ ...s, stats })), []);

  const setAnalysisResult = useCallback((key: string, data: AnalysisCache | null) => {
    setAnalysisResults((prev) => ({ ...prev, [key]: data }));
  }, []);

  const clearAnalysisResults = useCallback(() => {
    setAnalysisResults({});
  }, []);

  const resetMatch = useCallback(() => {
    setState(defaultState);
    setAnalysisResults({});
  }, []);

  const selectMatch = useCallback((id: string | null) => {
    if (!id) { resetMatch(); return; }
    const match = sampleMatchesData.find((m) => m.id === id) as SampleMatch | undefined;
    if (!match) return;
    setState({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      competition: match.competition,
      homeFormation: match.formations.home,
      awayFormation: match.formations.away,
      events: match.events,
      stats: match.stats,
      selectedMatchId: match.id,
      fetchedHomeScore: null,
      fetchedAwayScore: null,
    });
    setAnalysisResults({});
  }, []);

  const loadSampleMatch = useCallback((id: string) => {
    selectMatch(id);
  }, [selectMatch]);

  const loadExternalMatch = useCallback((match: ExternalMatch) => {
    setState({
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      competition: match.competition,
      homeFormation: match.formations.home,
      awayFormation: match.formations.away,
      events: match.events,
      stats: match.stats,
      selectedMatchId: match.id,
      fetchedHomeScore: match.homeScore,
      fetchedAwayScore: match.awayScore,
    });
    setAnalysisResults({});
  }, []);

  const homeScore = useMemo(() => {
    if (state.fetchedHomeScore !== null) return state.fetchedHomeScore;
    return computeScore(state.events, state.homeTeam, state.awayTeam).home;
  }, [state.events, state.fetchedHomeScore, state.homeTeam, state.awayTeam]);
  const awayScore = useMemo(() => {
    if (state.fetchedAwayScore !== null) return state.fetchedAwayScore;
    return computeScore(state.events, state.homeTeam, state.awayTeam).away;
  }, [state.events, state.fetchedAwayScore, state.homeTeam, state.awayTeam]);

  const summaryLine = useMemo(() => {
    if (state.selectedMatchId) {
      return `${state.homeTeam} ${homeScore}-${awayScore} ${state.awayTeam} — ${state.competition}`;
    }
    return "Please select a match";
  }, [state.homeTeam, state.awayTeam, state.competition, homeScore, awayScore, state.selectedMatchId]);

  return (
    <MatchContext.Provider value={{
      ...state,
      setHomeTeam, setAwayTeam, setHomeFormation, setAwayFormation,
      setEvents, setStats, resetMatch,
      loadSampleMatch, selectMatch, loadExternalMatch,
      sampleMatches, homeScore, awayScore, summaryLine,
      analysisResults, setAnalysisResult,
    }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatch(): MatchContextValue {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error("useMatch must be used within a MatchProvider");
  return ctx;
}
