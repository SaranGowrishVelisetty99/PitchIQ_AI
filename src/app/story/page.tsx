"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { MatchNarrative } from "@/components/story/MatchNarrative";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { SummaryCard } from "@/components/match/SummaryCard";
import { MatchSetupPanel } from "@/components/match/MatchSetupPanel";
import { StoryTimeline } from "@/components/football/StoryTimeline";
import { XGTimeline } from "@/components/football/XGTimeline";
import { AgentAvatar } from "@/components/football/AgentAvatar";
import { useMatch } from "@/contexts/MatchContext";
import { useMatchParams } from "@/hooks/useMatchParams";
import { useAgentStream } from "@/hooks/useAgentStream";
import { BookOpen, ChevronLeft, ChevronRight, Share2, Sparkles } from "lucide-react";
import type { StoryResult, AgentName } from "../../../types";
import { MatchButton } from "@/components/design-system/MatchButton";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";

const agents: AgentName[] = ["story"];

function StoryPageContent() {
  const { homeTeam, awayTeam, events, stats, selectedMatchId, selectMatch } = useMatch();
  const { shareUrl } = useMatchParams();

  useEffect(() => { if (!selectedMatchId) selectMatch("arg-fra-2022"); }, []);
  const [activeChapter, setActiveChapter] = useState(0);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { result, loading, error, streamText, analyze } = useAgentStream({
    cacheKey: "story",
    agentName: "story",
    endpoint: "/api/story",
    buildBody: () => ({
      events,
      stats,
      homeTeam,
      awayTeam,
    }),
  });

  const data = result as StoryResult | null;

  const handleShare = useCallback(() => {
    shareUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleGenerate = () => {
    if (events.length === 0) return;
    setActiveChapter(0);
    analyze();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const chapters = data?.sections?.map((s, i) => ({
    title: s.title || `Section ${i + 1}`,
    minuteRange: s.minuteRange,
    description: s.content.slice(0, 80) + "...",
    emotion: (
      ["drama", "heartbreak", "tension", "joy", "calm"] as const
    )[i % 5],
  })) || [];

  const summary = data?.summary || (events.length > 0
    ? `${homeTeam} vs ${awayTeam}: ${events.filter(e => e.type === "goal").length} goals in a match of ${events.length} events.`
    : "Select a match or enter events to generate a story.");

  return (
    <div className="container mx-auto px-4 py-8 bg-pitch-900 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-xg" />
          <h1 className="text-2xl font-bold text-text-primary">Match Story Generator</h1>
          <AgentIndicator agents={agents} />
          <div className="ml-auto">
            <MatchButton variant="ghost" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Share"}
            </MatchButton>
          </div>
        </div>
        <p className="text-text-tertiary">
          Story Agent converts match data into a compelling narrative with chapters and dramatic moments.
        </p>
        {homeTeam && (
          <MatchBadge className="mt-2 text-xs bg-pitch-800 text-text-secondary border-pitch-700">
            {homeTeam} vs {awayTeam} &bull; {events.length} events &bull; {events.filter(e => e.type === "goal").length} goals
          </MatchBadge>
        )}
      </div>

      {/* Story timeline (visible when result exists) */}
      {data && chapters.length > 0 && (
        <TacticalCard variant="pitch" className="mb-8" hover={false}>
          <TacticalCardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-xg" />
              <span className="text-sm font-semibold text-text-primary">Story Timeline</span>
            </div>
            <div className="flex items-center gap-1">
              <MatchButton variant="ghost" size="icon-sm" disabled={activeChapter <= 0}
                onClick={() => setActiveChapter((p) => Math.max(0, p - 1))}
              ><ChevronLeft className="h-3.5 w-3.5" /></MatchButton>
              <span className="text-xs text-text-secondary tabular-nums w-10 text-center">
                {activeChapter + 1}/{chapters.length}
              </span>
              <MatchButton variant="ghost" size="icon-sm" disabled={activeChapter >= chapters.length - 1}
                onClick={() => setActiveChapter((p) => Math.min(chapters.length - 1, p + 1))}
              ><ChevronRight className="h-3.5 w-3.5" /></MatchButton>
            </div>
          </TacticalCardHeader>
          <TacticalCardContent>
            <StoryTimeline chapters={chapters} activeIndex={activeChapter} onChapterClick={setActiveChapter} />
          </TacticalCardContent>
        </TacticalCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:grid-rows-1">
        <div className="h-full flex flex-col">
          <MatchSetupPanel showFormations={false} compactEvents title="Match Data" className="flex-1" />
          <div className="flex items-center gap-2 mt-3 shrink-0">
            <AgentAvatar name="story" size="sm" />
            <MatchButton onClick={handleGenerate} disabled={loading || events.length === 0} className="flex-1 bg-xg hover:bg-purple-600 text-white h-9 text-sm gap-1.5">
              <Sparkles className="h-4 w-4" />
              {loading ? "Crafting Story..." : "Generate Story"}
            </MatchButton>
          </div>
        </div>

        <div ref={resultRef}>
          {loading && streamText && (
            <TacticalCard variant="glass">
              <TacticalCardHeader>
                <TacticalCardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-xg animate-pulse" />
                  Crafting Story...
                </TacticalCardTitle>
              </TacticalCardHeader>
              <TacticalCardContent>
                <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary leading-relaxed max-h-96 overflow-y-auto">{streamText}</pre>
              </TacticalCardContent>
            </TacticalCard>
          )}

          {error && (
            <div className="rounded-lg border border-card-red/30 bg-card-red/20 text-card-red p-4 text-sm flex items-start justify-between gap-3">
              <span>{error}</span>
              <button onClick={() => analyze()} className="shrink-0 text-xs font-semibold uppercase tracking-wider text-card-red hover:text-card-red/80 underline underline-offset-2">
                Retry
              </button>
            </div>
          )}

          {loading && !streamText && (
            <SummaryCard
              icon={<BookOpen className="h-5 w-5 text-xg" />}
              title="Crafting Story"
              summary="The Story Agent is weaving match events into a narrative..."
              loading
            />
          )}

          {data && !loading && (
            <div className="space-y-4">
              <SummaryCard
                icon={<BookOpen className="h-5 w-5 text-xg" />}
                title="Match Story"
                summary={summary}
                confidence={data.confidence}
                expandLabel="Read full story"
                collapseLabel="Hide full story"
                defaultOpen={true}
                fixedHeight
              >
                {chapters[activeChapter] && (
                  <TacticalCard className="border-xg/20 bg-xg/10">
                    <TacticalCardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AgentAvatar name="story" size="sm" />
                        <span className="text-sm font-semibold text-text-primary">{chapters[activeChapter].title}</span>
                        <span className="text-[10px] text-xg font-mono">{chapters[activeChapter].minuteRange}</span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {data.sections?.[activeChapter]?.content || chapters[activeChapter].description}
                      </p>
                    </TacticalCardContent>
                  </TacticalCard>
                )}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-text-secondary mb-2">Expected Goals Timeline</h4>
                  <div className="rounded-lg overflow-hidden border border-pitch-700 bg-pitch-800 p-2">
                    <XGTimeline
                      data={data.keyMoments.map((km, i) => ({
                        minute: km.minute,
                        homeValue: km.team === "home" ? 0.5 + (i % 3) * 0.1 : 0.15,
                        awayValue: km.team === "away" ? 0.5 + (i % 3) * 0.1 : 0.15,
                        event: km.impact === "high" ? "⚡" : undefined,
                      }))}
                      homeLabel={homeTeam}
                      awayLabel={awayTeam}
                      height={150}
                    />
                  </div>
                </div>
                <MatchNarrative result={data} />
              </SummaryCard>
            </div>
          )}

          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-pitch-700 text-center p-8">
              <BookOpen className="h-16 w-16 text-xg/40 mb-4" />
              <h3 className="text-lg font-semibold text-text-secondary mb-2">No Story Yet</h3>
              <p className="text-sm text-text-tertiary max-w-sm mb-6">
                Pick a match and add events on the left, then tap Generate. The Story Agent will craft a compelling narrative with chapters and key moments.
              </p>
              {events.length > 0 && (
                <MatchButton onClick={handleGenerate} className="bg-xg hover:bg-purple-600 text-white gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Story Now
                </MatchButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={null}>
      <StoryPageContent />
    </Suspense>
  );
}
