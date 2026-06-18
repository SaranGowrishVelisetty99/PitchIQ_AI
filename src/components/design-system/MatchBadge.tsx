"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const matchBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200",
  {
    variants: {
      variant: {
        live: "bg-momentum/15 text-momentum border border-momentum/30",
        ft: "bg-pitch-600 text-text-tertiary border border-pitch-500",
        ht: "bg-gold-500/15 text-gold-500 border border-gold-500/30",
        upcoming: "bg-pitch-700 text-text-secondary border border-pitch-500",
        goal: "bg-gold-500/20 text-gold-500 border border-gold-500/30",
        var: "bg-var/15 text-var border border-var/30",
        "yellow-card": "bg-card-yellow/20 text-card-yellow border border-card-yellow/30",
        "red-card": "bg-card-red/20 text-card-red border border-card-red/30",
        substitution: "bg-substitution/20 text-substitution border border-substitution/30",
        injury: "bg-injury/20 text-injury border border-injury/30",
        info: "bg-home/15 text-home border border-home/30",
        home: "bg-home/15 text-home border border-home/30",
        away: "bg-away/15 text-away border border-away/30",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[8px]",
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-2.5 py-1 text-[10px]",
        lg: "px-3 py-1 text-[11px]",
      },
      pulse: {
        true: "animate-pulse",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "sm",
    },
  }
);

interface MatchBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof matchBadgeVariants> {}

export function MatchBadge({ className, variant, size, pulse, ...props }: MatchBadgeProps) {
  return (
    <span className={cn(matchBadgeVariants({ variant, size, pulse, className }))} {...props} />
  );
}
