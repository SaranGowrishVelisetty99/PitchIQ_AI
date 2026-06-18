"use client";

import { useState, useRef, useEffect } from "react";
import { useMatch } from "@/contexts/MatchContext";
import { cn } from "@/lib/utils";
import type { MatchEvent, MatchStats } from "../../../types";

interface FetchedMatch {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  status: "pre" | "in" | "post";
  score?: string;
}

export function MatchSelector() {
  const { sampleMatches, selectedMatchId, selectMatch, summaryLine, loadExternalMatch } = useMatch();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [fetchedMatches, setFetchedMatches] = useState<FetchedMatch[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [loadingMatch, setLoadingMatch] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleYearSearch = async () => {
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2030) return;

    setFetching(true);
    setFetchError("");
    setFetchedMatches([]);
    try {
      const res = await fetch("/api/matches/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: yearNum }),
      });
      if (!res.ok) {
        const err = await res.json();
        setFetchError(err.error || "No matches found");
        return;
      }
      const data = await res.json();
      const matches: FetchedMatch[] = (data.matches || []).reverse();
      setFetchedMatches(matches);
    } catch {
      setFetchError("Failed to search. Try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleYearSearch();
    }
  };

  const handleSelectFetched = async (m: FetchedMatch) => {
    if (loadingMatch) return;

    setLoadingMatch(m.id);
    setFetchError("");
    try {
      const res = await fetch("/api/matches/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id }),
      });
      if (!res.ok) throw new Error("Failed to load match");
      const data = await res.json();
      if (data.match) {
        loadExternalMatch(data.match as { id: string; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; competition: string; formations: { home: string; away: string }; events: MatchEvent[]; stats: MatchStats });
        setOpen(false);
        setSearch("");
      }
    } catch {
      setFetchError("Failed to load match details");
    } finally {
      setLoadingMatch(null);
    }
  };

  const query = search.toLowerCase();
  const filteredSamples = sampleMatches.filter((m) => {
    if (!query) return true;
    return (
      m.homeTeam.toLowerCase().includes(query) ||
      m.awayTeam.toLowerCase().includes(query) ||
      m.competition.toLowerCase().includes(query)
    );
  });

  const filteredFetched = fetchedMatches.filter((m) => {
    if (!query) return true;
    return (
      m.homeTeam.toLowerCase().includes(query) ||
      m.awayTeam.toLowerCase().includes(query) ||
      m.competition.toLowerCase().includes(query)
    );
  });

  const showSampleSection = filteredSamples.length > 0;
  const showFetchedSection = filteredFetched.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-200",
          "bg-pitch-800 border border-gold-500/20 hover:border-gold-500/40",
          "text-text-primary"
        )}
      >
        <span className="flex items-center gap-2.5 truncate">
          <span className="text-lg">🏟️</span>
          <span className="truncate font-semibold">{summaryLine}</span>
        </span>
        <svg
          className={cn("w-4 h-4 text-text-tertiary transition-transform duration-200 shrink-0", open && "rotate-180")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl bg-surface-card border border-gold-500/20 shadow-xl shadow-black/40 max-h-96 overflow-hidden">
          {/* Search + Year row */}
          <div className="p-2.5 border-b border-gold-500/10 space-y-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams or competition..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-pitch-800 border border-gold-500/10 text-text-primary placeholder:text-text-tertiary/50 outline-none focus:border-gold-500/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1900"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onKeyDown={handleYearKeyDown}
                placeholder="Year"
                className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-pitch-800 border border-gold-500/10 text-text-primary placeholder:text-text-tertiary/50 outline-none focus:border-gold-500/30 font-scoreboard tabular-nums"
              />
              <button
                onClick={handleYearSearch}
                disabled={fetching || !year}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  fetching
                    ? "bg-pitch-700 text-text-tertiary cursor-not-allowed"
                    : "bg-gold-500/20 text-gold-500 border border-gold-500/30 hover:bg-gold-500/30"
                )}
              >
                {fetching ? "Searching..." : "Fetch Matches"}
              </button>
            </div>
            {fetchError && (
              <p className="text-[10px] text-card-red px-1">{fetchError}</p>
            )}
          </div>

          {/* Match list */}
          <div className="overflow-y-auto max-h-56">
            {!showSampleSection && !showFetchedSection && !fetching && (
              <p className="p-4 text-xs text-text-tertiary text-center">
                {fetchedMatches.length === 0 && !fetchError
                  ? "Enter a year above and press Enter to fetch matches from FIFA."
                  : "No matches match your search."}
              </p>
            )}

            {fetching && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching matches...
                </div>
              </div>
            )}

            {showFetchedSection && !fetching && (
              <>
                <div className="px-3 py-1.5 text-[9px] text-text-tertiary uppercase tracking-wider font-semibold bg-pitch-800/50">
                  {year} FIFA World Cup Matches
                </div>
                {filteredFetched.map((m) => {
                  const isLoading = loadingMatch === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectFetched(m)}
                      disabled={!!loadingMatch}
                      className={cn(
                        "w-full text-left px-3 py-3 flex items-center gap-3 transition-colors border-b border-gold-500/5 last:border-0",
                        "hover:bg-pitch-700/50 cursor-pointer",
                        isLoading && "animate-pulse"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">{m.homeTeam}</span>
                          <span className="text-[10px] text-text-tertiary">vs</span>
                          <span className="text-sm font-semibold text-text-primary">{m.awayTeam}</span>
                          <span className="text-[10px] font-scoreboard text-gold-500 ml-1">{m.score}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-tertiary">{m.competition}</span>
                          <span className="text-[10px] text-text-tertiary/60">•</span>
                          <span className="text-[10px] text-text-tertiary/60">{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">FT</span>
                        {isLoading && <span className="text-[10px] text-gold-500">Loading...</span>}
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {showSampleSection && !fetching && (
              <>
                <div className="px-3 py-1.5 text-[9px] text-text-tertiary uppercase tracking-wider font-semibold bg-pitch-800/50">
                  Sample Matches
                </div>
                {filteredSamples.map((m) => {
                  const selected = selectedMatchId === m.id;
                  const homeG = m.events.filter((e) => (e.type === "goal" || e.type === "penalty") && e.team === "home").length;
                  const awayG = m.events.filter((e) => (e.type === "goal" || e.type === "penalty") && e.team === "away").length;

                  return (
                    <button
                      key={m.id}
                      onClick={() => { selectMatch(m.id); setOpen(false); setSearch(""); }}
                      className={cn(
                        "w-full text-left px-3 py-3 flex items-center gap-3 transition-colors border-b border-gold-500/5 last:border-0",
                        "hover:bg-pitch-700/50",
                        selected && "bg-gold-500/10"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-semibold", selected ? "text-gold-500" : "text-text-primary")}>{m.homeTeam}</span>
                          <span className="text-[10px] text-text-tertiary">vs</span>
                          <span className={cn("text-sm font-semibold", selected ? "text-gold-500" : "text-text-primary")}>{m.awayTeam}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-tertiary">{m.competition}</span>
                          {(homeG > 0 || awayG > 0) && (
                            <span className="text-[10px] font-scoreboard text-gold-500">
                              {homeG}-{awayG}
                            </span>
                          )}
                        </div>
                      </div>
                      {selected && (
                        <svg className="w-4 h-4 text-gold-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
