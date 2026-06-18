"use client";

import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { SourceCitationList } from "@/components/common/SourceCitation";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { BookOpen, Bookmark, Clock } from "lucide-react";
import type { StoryResult, AgentName } from "../../../types";

interface MatchNarrativeProps {
  result: StoryResult;
}

const agents: AgentName[] = ["story"];

export function MatchNarrative({ result }: MatchNarrativeProps) {
  return (
    <TacticalCard variant="glass">
      <TacticalCardHeader>
        <div className="flex items-center justify-between w-full">
          <TacticalCardTitle>Match Narrative</TacticalCardTitle>
          <AgentIndicator agents={agents} />
        </div>
      </TacticalCardHeader>
      <TacticalCardContent className="space-y-6">
        <div className="rounded-lg bg-xg/10 border border-xg/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-xg" />
            <h3 className="text-sm font-semibold text-text-primary">Story</h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{result.narrative}</p>
        </div>

        {result.sections && result.sections.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-xg" />
              <h3 className="text-sm font-semibold text-text-primary">Chapters</h3>
            </div>
            {result.sections.map((section, i) => (
              <div
                key={i}
                className="rounded-lg border border-pitch-700 bg-pitch-700/50 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">{section.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    {section.minuteRange}
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {result.keyMoments && result.keyMoments.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Key Moments</h3>
            <div className="space-y-2">
              {result.keyMoments.map((moment, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-pitch-700/50 border border-pitch-700 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-xs font-bold text-text-secondary">
                    {moment.minute}&apos;
                  </div>
                  <p className="text-sm text-text-secondary">{moment.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-pitch-700/50 border border-pitch-700 p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Summary</h3>
          <p className="text-sm text-text-secondary">{result.summary}</p>
        </div>

        <div className="border-t border-pitch-700 pt-4 space-y-4">
          <ConfidenceBadge score={result.confidence} />
          <SourceCitationList sources={result.sources} />
        </div>
      </TacticalCardContent>
    </TacticalCard>
  );
}
