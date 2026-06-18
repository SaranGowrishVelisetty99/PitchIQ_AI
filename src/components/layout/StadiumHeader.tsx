"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMatch } from "@/contexts/MatchContext";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/": "The Tunnel",
  "/formation": "Tactical Board",
  "/momentum": "Pulse Monitor",
  "/var": "VAR Review Room",
  "/story": "Match Novel",
  "/tactical": "Briefing Room",
  "/chat": "The Dugout",
};

const pageIcons: Record<string, string> = {
  "/": "🏟️",
  "/formation": "📐",
  "/momentum": "📈",
  "/var": "🎯",
  "/story": "📖",
  "/tactical": "🧠",
  "/chat": "💬",
};

export function StadiumHeader() {
  const pathname = usePathname();
  const { homeTeam, awayTeam, homeScore, awayScore, competition } = useMatch();
  const title = pageTitles[pathname] || "PitchIQ AI";
  const icon = pageIcons[pathname] || "⚽";

  const isHome = pathname === "/";

  return (
    <header className={cn(
      "w-full transition-all duration-300",
      isHome ? "bg-transparent" : "glass-surface-light"
    )}>
      {!isHome && (
        <div className="h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      )}
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          {!isHome && (
            <Link
              href="/"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-pitch-700/50 text-text-tertiary hover:text-gold-500 hover:bg-pitch-600 transition-all focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label="Back to home"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{icon}</span>
            <div>
              <h1 className={cn(
                "font-semibold tracking-tight",
                isHome ? "text-gold-500 text-lg" : "text-text-primary text-sm"
              )}>
                {title}
              </h1>
              {!isHome && homeTeam && (
                <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
                  <span className="text-home font-semibold">{homeTeam}</span>
                  <span className="font-scoreboard text-gold-500 text-xs">{homeScore}</span>
                  <span>-</span>
                  <span className="font-scoreboard text-gold-500 text-xs">{awayScore}</span>
                  <span className="text-away font-semibold">{awayTeam}</span>
                  <span className="w-px h-2.5 bg-gold-500/20" />
                  <span>{competition}</span>
                </div>
              )}
              {!isHome && !homeTeam && (
                <span className="text-[10px] text-text-tertiary/60">No match selected</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isHome && (
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-700/50 text-text-tertiary hover:text-gold-500 hover:bg-pitch-600 transition-all text-xs focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <span>🏟️</span>
              <span>All Matches</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
