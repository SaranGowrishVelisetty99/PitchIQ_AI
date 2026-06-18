"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent, TacticalCardFooter } from "@/components/design-system/TacticalCard";
import { CustomScrollArea } from "@/components/common/CustomScrollArea";

interface SummaryCardProps {
  icon?: ReactNode;
  title: string;
  summary: string;
  confidence?: number;
  expandLabel?: string;
  collapseLabel?: string;
  defaultOpen?: boolean;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
  fixedHeight?: boolean;
}

export function SummaryCard({
  icon,
  title,
  summary,
  confidence,
  expandLabel = "Show details",
  collapseLabel = "Hide details",
  defaultOpen = false,
  loading = false,
  children,
  className,
  fixedHeight = false,
}: SummaryCardProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <TacticalCard
      variant="glass"
      className={cn(
        "transition-all duration-300 flex flex-col",
        fixedHeight && "h-full",
        className
      )}
    >
      <TacticalCardHeader>
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-lg">{icon}</span>}
          <div>
            <TacticalCardTitle>{title}</TacticalCardTitle>
          </div>
        </div>
        {confidence !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-text-tertiary uppercase tracking-wider">Confidence</span>
            <span className="text-sm font-bold font-scoreboard text-gold-500 tabular-nums">
              {confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100)}%
            </span>
          </div>
        )}
      </TacticalCardHeader>

      <TacticalCardContent className={cn(fixedHeight && "flex flex-col flex-1 min-h-0")}>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-pitch-700 rounded animate-shimmer" />
            <div className="h-4 bg-pitch-700 rounded w-3/4 animate-shimmer" />
            <div className="h-4 bg-pitch-700 rounded w-1/2 animate-shimmer" />
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>

            {children && (
              <>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1.5 mt-3 text-[10px] text-gold-500 font-semibold uppercase tracking-wider hover:text-gold-400 transition-colors"
                >
                  <span>{expanded ? collapseLabel : expandLabel}</span>
                  <svg
                    className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <CustomScrollArea
                  maxHeight={fixedHeight ? "320px" : "none"}
                  className={cn(
                    "mt-3 transition-all duration-300",
                    fixedHeight ? (expanded ? "flex-1 min-h-0" : "hidden") : (
                      expanded ? "opacity-100 max-h-[5000px]" : "opacity-0 max-h-0 overflow-hidden"
                    )
                  )}
                >
                  <div className={cn(
                    "space-y-3",
                    !fixedHeight && "pb-1"
                  )}>
                    {children}
                  </div>
                </CustomScrollArea>
              </>
            )}
          </>
        )}
      </TacticalCardContent>

      {loading && (
        <TacticalCardFooter>
          <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            Analyzing...
          </div>
        </TacticalCardFooter>
      )}
    </TacticalCard>
  );
}
