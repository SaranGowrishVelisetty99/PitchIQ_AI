"use client";

import { cn } from "@/lib/utils";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import type { ExpertiseLevel } from "../../../types";

interface ExpertiseSelectorProps {
  value: ExpertiseLevel;
  onChange: (level: ExpertiseLevel) => void;
  className?: string;
}

const levels: { value: ExpertiseLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "Simple analogies, no jargon" },
  { value: "intermediate", label: "Intermediate", description: "Proper terminology" },
  { value: "expert", label: "Expert", description: "Deep tactical analysis" },
  { value: "child", label: "Child", description: "Fun metaphors, simple language" },
];

export function ExpertiseSelector({ value, onChange, className }: ExpertiseSelectorProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {levels.map((level) => (
        <MatchBadge
          key={level.value}
          variant={value === level.value ? "goal" : "info"}
          size="xs"
          className={cn(
            "cursor-pointer transition-all",
            value !== level.value && "bg-pitch-700 text-text-tertiary hover:text-text-primary hover:border-gold-500/30"
          )}
          onClick={() => onChange(level.value)}
          title={level.description}
        >
          {level.label}
        </MatchBadge>
      ))}
    </div>
  );
}
