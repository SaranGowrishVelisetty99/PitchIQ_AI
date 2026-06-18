"use client";

import { cn } from "@/lib/utils";

interface StatPillProps {
  value: number | string;
  label: string;
  suffix?: string;
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  trend?: "up" | "down" | "neutral";
  className?: string;
}

const sizeMap = {
  sm: { value: "text-lg", label: "text-[10px]", icon: "text-sm", container: "px-3 py-2" },
  md: { value: "text-2xl", label: "text-xs", icon: "text-base", container: "px-4 py-3" },
  lg: { value: "text-3xl", label: "text-sm", icon: "text-lg", container: "px-5 py-4" },
};

export function StatPill({ value, label, suffix, icon, color = "#FFD700", size = "md", trend, className }: StatPillProps) {
  const dims = sizeMap[size];

  return (
    <div className={cn(
      "flex flex-col items-center rounded-xl bg-pitch-800/60 border border-gold-500/10 text-center",
      dims.container,
      className
    )}>
      {icon && <span className={cn("mb-0.5", dims.icon)}>{icon}</span>}
      <div className="flex items-center gap-1">
        <span
          className={cn("font-bold font-scoreboard tabular-nums leading-none", dims.value)}
          style={{ color }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-[10px] text-text-tertiary font-scoreboard">{suffix}</span>
        )}
        {trend && (
          <span className={cn(
            "text-xs",
            trend === "up" && "text-momentum",
            trend === "down" && "text-card-red",
            trend === "neutral" && "text-text-tertiary"
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
      <span className={cn("text-text-tertiary font-medium mt-0.5", dims.label)}>{label}</span>
    </div>
  );
}
