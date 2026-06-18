"use client";

import { cn } from "@/lib/utils";

interface MomentumBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function MomentumBar({
  value,
  maxValue = 100,
  label,
  color = "#00E676",
  size = "md",
  showLabel = true,
  animated = true,
  className,
}: MomentumBarProps) {
  const pct = Math.min((value / maxValue) * 100, 100);

  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };
  const labelSizes = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && label && (
        <div className="flex items-center justify-between">
          <span className={cn("text-text-tertiary font-medium", labelSizes[size])}>{label}</span>
          <span className={cn("font-scoreboard text-text-secondary tabular-nums", labelSizes[size])}>
            {value}{maxValue > 1 ? `/${maxValue}` : "%"}
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-pitch-700 overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            animated && "animate-pulseGlow"
          )}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            "--glow-color": `${color}44`,
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
