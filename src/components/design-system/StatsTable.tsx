"use client";

import { cn } from "@/lib/utils";

interface StatRow {
  label: string;
  home: string | number;
  away: string | number;
  highlight?: "home" | "away" | "none";
  bar?: boolean;
}

interface StatsTableProps {
  rows: StatRow[];
  homeLabel: string;
  awayLabel: string;
  className?: string;
  compact?: boolean;
}

function StatBar({ home, away, highlight }: { home: number; away: number; highlight?: string }) {
  const total = home + away;
  const homePct = total > 0 ? (home / total) * 100 : 50;
  const awayPct = total > 0 ? (away / total) * 100 : 50;

  return (
    <div className="flex items-center gap-2 w-full">
      <span className={cn(
        "text-xs font-scoreboard tabular-nums w-8 text-right",
        highlight === "home" ? "text-home font-bold" : "text-text-tertiary"
      )}>
        {home}%
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-pitch-700 overflow-hidden">
        <div className="flex h-full">
          <div
            className="h-full rounded-l-full transition-all duration-500"
            style={{
              width: `${homePct}%`,
              background: "linear-gradient(90deg, #0066FF, #0055DD)",
            }}
          />
          <div
            className="h-full rounded-r-full transition-all duration-500"
            style={{
              width: `${awayPct}%`,
              background: "linear-gradient(90deg, #DD0000, #FF2D2D)",
            }}
          />
        </div>
      </div>
      <span className={cn(
        "text-xs font-scoreboard tabular-nums w-8",
        highlight === "away" ? "text-away font-bold" : "text-text-tertiary"
      )}>
        {away}%
      </span>
    </div>
  );
}

export function StatsTable({ rows, homeLabel, awayLabel, className, compact = false }: StatsTableProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-home">{homeLabel}</span>
        <span className="text-[9px] text-text-tertiary uppercase tracking-wider">Stats</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-away">{awayLabel}</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn(
            "group",
            compact ? "py-1" : "py-1.5"
          )}
        >
          <div className={cn(
            "flex items-center justify-between px-2 py-1 rounded-lg transition-colors",
            !compact && "hover:bg-pitch-700/50"
          )}>
            <span className={cn(
              "font-scoreboard tabular-nums text-xs",
              row.highlight === "home" ? "text-home font-bold" : "text-text-secondary"
            )}>
              {row.home}
            </span>
            <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider px-2">
              {row.label}
            </span>
            <span className={cn(
              "font-scoreboard tabular-nums text-xs",
              row.highlight === "away" ? "text-away font-bold" : "text-text-secondary"
            )}>
              {row.away}
            </span>
          </div>
          {row.bar && typeof row.home === "number" && typeof row.away === "number" && (
            <div className="px-2">
              <StatBar home={row.home} away={row.away} highlight={row.highlight} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
