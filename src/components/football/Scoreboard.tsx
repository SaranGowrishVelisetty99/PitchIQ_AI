"use client";

import { cn } from "@/lib/utils";

interface ScoreboardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute?: number;
  injuryTime?: number;
  status?: "live" | "ht" | "ft" | "upcoming";
  competition?: string;
  homeCrest?: string;
  awayCrest?: string;
  className?: string;
  variant?: "standard" | "compact" | "hero";
}

export function Scoreboard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  injuryTime,
  status = "live",
  competition,
  homeCrest,
  awayCrest,
  className,
  variant = "standard",
}: ScoreboardProps) {
  const isLive = status === "live";
  const isHT = status === "ht";
  const isFT = status === "ft";

  const statusLabel = isFT ? "FT" : isHT ? "HT" : isLive && minute !== undefined ? `${minute}${injuryTime ? `+${injuryTime}` : ""}'` : "UPCOMING";

  if (variant === "hero") {
    return (
      <div className={cn("flex items-center justify-center gap-6 lg:gap-10", className)}>
        <div className="flex flex-col items-center gap-2">
          {homeCrest && (
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-pitch-700 flex items-center justify-center text-3xl">
              {homeCrest}
            </div>
          )}
          <span className="text-sm lg:text-base font-semibold text-text-primary text-center max-w-[120px] truncate">
            {homeTeam}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl lg:text-6xl font-bold text-home font-scoreboard tabular-nums">
              {homeScore}
            </span>
            <span className="text-2xl lg:text-3xl text-text-tertiary font-scoreboard">:</span>
            <span className="text-4xl lg:text-6xl font-bold text-away font-scoreboard tabular-nums">
              {awayScore}
            </span>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest",
            isLive && "bg-momentum/20 text-momentum",
            isHT && "bg-gold-500/20 text-gold-500",
            isFT && "bg-pitch-600 text-text-tertiary",
            !isLive && !isHT && !isFT && "bg-home/20 text-home"
          )}>
            {statusLabel}
          </div>
          {competition && (
            <span className="text-[10px] text-text-tertiary mt-1">{competition}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          {awayCrest && (
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-pitch-700 flex items-center justify-center text-3xl">
              {awayCrest}
            </div>
          )}
          <span className="text-sm lg:text-base font-semibold text-text-primary text-center max-w-[120px] truncate">
            {awayTeam}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span className="text-xs font-semibold text-home truncate max-w-[80px]">{homeTeam}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-gold-500 font-scoreboard">{homeScore}</span>
          <span className="text-[10px] text-text-tertiary">-</span>
          <span className="text-sm font-bold text-gold-500 font-scoreboard">{awayScore}</span>
        </div>
        <span className="text-xs font-semibold text-away truncate max-w-[80px]">{awayTeam}</span>
        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-momentum animate-pulse" />}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl bg-pitch-800 border border-gold-500/10",
      className
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {homeCrest && <span className="text-lg shrink-0">{homeCrest}</span>}
        <span className="text-sm font-semibold text-text-primary truncate">{homeTeam}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xl font-bold text-home font-scoreboard tabular-nums">{homeScore}</span>
        <div className={cn(
          "px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-widest",
          isLive && "bg-momentum/20 text-momentum",
          isHT && "bg-gold-500/20 text-gold-500",
          isFT && "bg-pitch-600 text-text-tertiary"
        )}>
          {statusLabel}
        </div>
        <span className="text-xl font-bold text-away font-scoreboard tabular-nums">{awayScore}</span>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-sm font-semibold text-text-primary truncate">{awayTeam}</span>
        {awayCrest && <span className="text-lg shrink-0">{awayCrest}</span>}
      </div>
    </div>
  );
}
