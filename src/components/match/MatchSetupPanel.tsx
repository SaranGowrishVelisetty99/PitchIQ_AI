"use client";

import { useMatch } from "@/contexts/MatchContext";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { cn } from "@/lib/utils";

interface MatchSetupPanelProps {
  title?: string;
  showFormations?: boolean;
  showStats?: boolean;
  compactEvents?: boolean;
  className?: string;
}

export function MatchSetupPanel({
  title = "Match Setup",
  showFormations = true,
  showStats = true,
  compactEvents = false,
  className,
}: MatchSetupPanelProps) {
  const { homeTeam, awayTeam, competition, events, stats } = useMatch();

  const goalEvents = events.filter((e) => e.type === "goal");
  const cardEvents = events.filter((e) => e.type === "card");
  const subEvents = events.filter((e) => e.type === "substitution");

  return (
    <TacticalCard variant="default" className={className}>
      <TacticalCardHeader>
        <TacticalCardTitle>{title}</TacticalCardTitle>
        <MatchBadge variant="info" size="xs">{events.length} events</MatchBadge>
      </TacticalCardHeader>
      <TacticalCardContent>
        {/* Teams */}
        <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-pitch-800/50">
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-home">{homeTeam}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-text-tertiary uppercase tracking-wider">vs</span>
            <span className="text-[10px] text-text-tertiary">{competition}</span>
          </div>
          <div className="flex-1 text-right">
            <span className="text-sm font-semibold text-away">{awayTeam}</span>
          </div>
        </div>

        {/* Events summary */}
        {compactEvents ? (
          <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-[11px] text-text-tertiary text-center py-4">No events added yet</p>
            ) : (
              events.map((event, i) => (
                <div key={i} className="flex items-center gap-2 py-1 text-[11px] text-text-secondary">
                  <span className="font-scoreboard text-text-tertiary w-8 tabular-nums">{event.minute || "?"}'</span>
                  <span className={cn(
                    event.team === "home" ? "text-home" : "text-away",
                    "font-semibold"
                  )}>
                    {event.team === "home" ? homeTeam : awayTeam}
                  </span>
                  <span>- {event.type.replace("-", " ")}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col items-center p-2 rounded-lg bg-pitch-800/50">
              <span className="text-sm font-bold font-scoreboard text-gold-500">{goalEvents.length}</span>
              <span className="text-[9px] text-text-tertiary">⚽ Goals</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-pitch-800/50">
              <span className="text-sm font-bold font-scoreboard text-card-red">{cardEvents.length}</span>
              <span className="text-[9px] text-text-tertiary">🟨 Cards</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-pitch-800/50">
              <span className="text-sm font-bold font-scoreboard text-substitution">{subEvents.length}</span>
              <span className="text-[9px] text-text-tertiary">🔄 Subs</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="space-y-2 border-t border-gold-500/10 pt-3">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-home font-semibold">{stats.possession.home}%</span>
              <span className="text-text-tertiary uppercase tracking-wider">Possession</span>
              <span className="text-away font-semibold">{stats.possession.away}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-home font-semibold">{stats.shots.home}</span>
              <span className="text-text-tertiary uppercase tracking-wider">Shots</span>
              <span className="text-away font-semibold">{stats.shots.away}</span>
            </div>
          </div>
        )}
      </TacticalCardContent>
    </TacticalCard>
  );
}
