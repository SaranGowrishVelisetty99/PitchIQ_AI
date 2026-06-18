"use client";

import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { SourceCitationList } from "@/components/common/SourceCitation";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { BookOpen, Lightbulb, Users } from "lucide-react";
import type { VARResult, AgentName } from "../../../types";

interface VARResultCardProps {
  result: VARResult;
}

const agents: AgentName[] = ["var"];

export function VARResultCard({ result }: VARResultCardProps) {
  return (
    <TacticalCard variant="glass">
      <TacticalCardHeader>
        <div className="flex items-center justify-between w-full">
          <TacticalCardTitle>Decision Analysis</TacticalCardTitle>
          <div className="flex items-center gap-2">
            <AgentIndicator agents={agents} />
            <MatchBadge variant="info">
              {result.fifaLaw}
            </MatchBadge>
          </div>
        </div>
      </TacticalCardHeader>
      <TacticalCardContent className="space-y-6">
        <div className="rounded-lg bg-home/10 border border-home/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-home" />
            <h3 className="text-sm font-semibold text-text-primary">Summary</h3>
          </div>
          <p className="text-sm text-text-secondary">{result.summary}</p>
        </div>

        <div className="rounded-lg bg-pitch-700/50 border border-pitch-600 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-home" />
            <h3 className="text-sm font-semibold text-text-primary">Reasoning</h3>
          </div>
          <p className="text-sm text-text-secondary">{result.reasoning}</p>
        </div>

        {result.evidence && result.evidence.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Evidence</h3>
            <ul className="space-y-1">
              {result.evidence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-home" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg bg-var/10 border border-var/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-var" />
            <h3 className="text-sm font-semibold text-text-primary">Fan-Friendly Explanation</h3>
          </div>
          <p className="text-sm text-text-secondary">{result.fanFriendly || result.summary}</p>
        </div>

        <div className="border-t border-pitch-700 pt-4 space-y-4">
          <ConfidenceBadge score={result.confidence} />
          <SourceCitationList sources={result.sources} />

          {result.lawSection && (
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <BookOpen className="h-3 w-3" />
              <span>Applicable Law: {result.lawSection}</span>
            </div>
          )}
        </div>
      </TacticalCardContent>
    </TacticalCard>
  );
}
