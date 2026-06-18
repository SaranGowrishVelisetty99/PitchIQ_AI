"use client";

import { cn } from "@/lib/utils";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { MatchButton } from "@/components/design-system/MatchButton";

interface LiveMatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute?: number;
  status: "live" | "ft" | "ht" | "upcoming";
  competition?: string;
  onClick?: () => void;
  className?: string;
}

export function LiveMatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  status,
  competition,
  onClick,
  className,
}: LiveMatchCardProps) {
  const isLive = status === "live";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-surface-card border border-gold-500/10 p-4 text-left transition-all duration-300",
        "hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10 hover:-translate-y-0.5",
        isLive && "ring-1 ring-momentum/30",
        className
      )}
    >
      {/* Background glow */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-br from-gold-500/5 via-transparent to-transparent"
      )} />

      <div className="relative z-10 space-y-3">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <MatchBadge variant={status === "live" ? "live" : status === "ft" ? "ft" : status === "ht" ? "ht" : "upcoming"} size="xs" />
          {isLive && minute !== undefined && (
            <span className="text-[10px] font-scoreboard text-momentum tabular-nums">{minute}'</span>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-3 py-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-semibold text-home truncate max-w-[80px]">{homeTeam}</span>
            <span className="text-2xl font-bold text-home font-scoreboard tabular-nums">{homeScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">vs</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-semibold text-away truncate max-w-[80px]">{awayTeam}</span>
            <span className="text-2xl font-bold text-away font-scoreboard tabular-nums">{awayScore}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gold-500/10">
          <span className="text-[10px] text-text-tertiary">{competition || "Friendly"}</span>
          <span className="text-[10px] text-gold-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Analyze →
          </span>
        </div>
      </div>
    </button>
  );
}
