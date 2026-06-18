"use client";

import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { SourceCitationList } from "@/components/common/SourceCitation";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { TrendingUp, Activity, Target, GitCompare } from "lucide-react";
import type { TacticalResult, AgentName } from "../../../types";

interface TacticalInsightsProps {
  result: TacticalResult;
}

const agents: AgentName[] = ["formation", "momentum"];

export function TacticalInsights({ result }: TacticalInsightsProps) {
  const impactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-card-red/20 text-card-red border-card-red/30";
      case "medium": return "bg-card-yellow/20 text-card-yellow border-card-yellow/30";
      case "low": return "bg-pitch-700/50 text-text-tertiary border-pitch-600";
      default: return "bg-pitch-700/50 text-text-tertiary border-pitch-600";
    }
  };

  return (
    <TacticalCard variant="glass">
      <TacticalCardHeader>
        <div className="flex items-center justify-between w-full">
          <TacticalCardTitle>Tactical Insights</TacticalCardTitle>
          <AgentIndicator agents={agents} />
        </div>
      </TacticalCardHeader>
      <TacticalCardContent className="space-y-6">
        <div className="rounded-lg bg-home/10 border border-home/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-home" />
            <h3 className="text-sm font-semibold text-text-primary">Tactical Summary</h3>
          </div>
          <p className="text-sm text-text-secondary">{result.tacticalSummary}</p>
        </div>

        <div className="rounded-lg bg-momentum/10 border border-momentum/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-momentum" />
            <h3 className="text-sm font-semibold text-text-primary">Momentum Analysis</h3>
          </div>
          <p className="text-sm text-text-secondary">{result.momentumAnalysis}</p>
        </div>

        {result.turningPoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-momentum" />
              <h3 className="text-sm font-semibold text-text-primary">Key Turning Points</h3>
            </div>
            <div className="space-y-2">
              {result.turningPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-pitch-700 bg-pitch-700/50 p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-xs font-bold text-text-secondary">
                    {point.minute}&apos;
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary">{point.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MatchBadge
                        className={`text-[10px] ${impactColor(point.impact)}`}
                      >
                        {point.impact} impact
                      </MatchBadge>
                      <span className="text-[10px] text-text-tertiary">
                        {point.team === "home" ? "Home" : "Away"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-pitch-700/50 border border-pitch-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitCompare className="h-4 w-4 text-home" />
            <h3 className="text-sm font-semibold text-text-primary">Formation Impact</h3>
          </div>
          <p className="text-sm text-text-secondary">{result.formationImpact}</p>
        </div>

        {result.keyAdjustments && result.keyAdjustments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Key Adjustments</h3>
            <ul className="space-y-1">
              {result.keyAdjustments.map((adj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-home" />
                  {adj}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-pitch-700 pt-4 space-y-4">
          <ConfidenceBadge score={result.confidence} />
          <SourceCitationList sources={result.sources} />
        </div>
      </TacticalCardContent>
    </TacticalCard>
  );
}
