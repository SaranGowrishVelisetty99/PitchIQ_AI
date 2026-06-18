"use client";

import { useMatch } from "@/contexts/MatchContext";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { Trophy, Goal, LayoutGrid, TrendingUp, ShieldCheck, BookOpen } from "lucide-react";

interface Props {
  onSelectContext?: (context: string) => void;
}

export function MatchContextChips({ onSelectContext }: Props) {
  const { summaryLine, homeFormation, awayFormation, homeScore, awayScore } = useMatch();

  const chips = [
    { label: summaryLine, icon: Trophy, color: "bg-gold-500/10 text-gold-500 border-gold-500/20" },
    { label: `${homeScore}-${awayScore}`, icon: Goal, color: "bg-goal/20 text-goal border-goal/30" },
    { label: `${homeFormation} vs ${awayFormation}`, icon: LayoutGrid, color: "bg-home/20 text-home border-home/30" },
  ];

  const agentChips = [
    { label: "Formation", icon: LayoutGrid, context: "formation", color: "hover:bg-home/10" },
    { label: "Momentum", icon: TrendingUp, context: "momentum", color: "hover:bg-gold-500/10" },
    { label: "VAR", icon: ShieldCheck, context: "var", color: "hover:bg-var/10" },
    { label: "Story", icon: BookOpen, context: "story", color: "hover:bg-xg/10" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <MatchBadge key={i} variant="info" size="xs" className={`gap-1 ${chip.color}`}>
            <chip.icon className="h-2.5 w-2.5" />
            {chip.label}
          </MatchBadge>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        <span className="text-[9px] text-text-tertiary mr-0.5 self-center">Ask about:</span>
        {agentChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelectContext?.(chip.context)}
            className={`text-[10px] px-1.5 py-0.5 rounded-full border border-pitch-700 text-text-tertiary transition-colors ${chip.color}`}
          >
            <chip.icon className="h-2.5 w-2.5 inline mr-0.5" />
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
