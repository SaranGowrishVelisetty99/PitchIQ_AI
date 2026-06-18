"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { TacticalInsights } from "@/components/tactical/TacticalInsights";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { SummaryCard } from "@/components/match/SummaryCard";
import { MatchSetupPanel } from "@/components/match/MatchSetupPanel";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchButton } from "@/components/design-system/MatchButton";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { FormationVisual } from "@/components/football/FormationVisual";
import { MomentumWave } from "@/components/football/MomentumWave";
import { AgentAvatar } from "@/components/football/AgentAvatar";
import { StatPill } from "@/components/football/StatPill";
import { useMatch } from "@/contexts/MatchContext";
import { useMatchParams } from "@/hooks/useMatchParams";
import { useAgentStream } from "@/hooks/useAgentStream";
import { Brain, LayoutGrid, TrendingUp, Share2, Target, Activity } from "lucide-react";
import type { TacticalResult, AgentName } from "../../../types";

const agents: AgentName[] = ["formation", "momentum"];

const sampleChartData = [
  { minute: 0, homeValue: 50, awayValue: 50 },
  { minute: 23, homeValue: 78, awayValue: 22, trigger: "Goal!" },
  { minute: 45, homeValue: 65, awayValue: 35 },
  { minute: 80, homeValue: 35, awayValue: 65, trigger: "Goal!" },
  { minute: 90, homeValue: 45, awayValue: 55 },
];

function TacticalPageContent() {
  const { homeTeam, awayTeam, homeFormation, awayFormation, events, stats, selectedMatchId, selectMatch } = useMatch();
  const { shareUrl } = useMatchParams();

  useEffect(() => { if (!selectedMatchId) selectMatch("arg-fra-2022"); }, []);
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const { result, loading, error, streamText, analyze } = useAgentStream({
    cacheKey: "tactical",
    agentName: "formation",
    endpoint: "/api/tactical",
    buildBody: ({ homeTeam, awayTeam, homeFormation, awayFormation, events, stats }) => ({
      events,
      stats,
      homeTeam,
      awayTeam,
      formations: { home: homeFormation, away: awayFormation },
    }),
  });

  const data = result as TacticalResult | null;

  const handleShare = useCallback(() => {
    shareUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleAnalyze = () => {
    if (events.length === 0) return;
    analyze();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-pitch-900 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-text-primary">Tactical Analysis</h1>
          <AgentIndicator agents={agents} />
          <div className="ml-auto">
            <MatchButton variant="ghost" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Share"}
            </MatchButton>
          </div>
        </div>
        <p className="text-text-tertiary">
          Combined formation and momentum analysis for comprehensive tactical breakdown.
        </p>
        {homeTeam && (
          <MatchBadge variant="info" className="mt-2" size="md">
            {homeTeam} vs {awayTeam} &bull; {events.length} events
          </MatchBadge>
        )}
      </div>

      {/* Hero dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TacticalCard variant="default" className="overflow-hidden">
          <TacticalCardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TacticalCardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-home" />
                Tactical Setup
              </TacticalCardTitle>
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-home" /> {homeTeam}</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-white border border-away" /> {awayTeam}</span>
              </div>
            </div>
          </TacticalCardHeader>
          <TacticalCardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-text-tertiary mb-1 text-center uppercase tracking-wider">{homeFormation}</div>
                <FormationVisual formation={homeFormation} team="home" size="lg" />
              </div>
              <div>
                <div className="text-xs text-text-tertiary mb-1 text-center uppercase tracking-wider">{awayFormation}</div>
                <FormationVisual formation={awayFormation} team="away" size="lg" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <AgentAvatar name="formation" size="sm" />
              <AgentAvatar name="momentum" size="sm" />
              <MatchButton onClick={handleAnalyze} disabled={loading || events.length === 0} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white">
                <Target className="h-4 w-4" />
                {loading ? "Analyzing..." : "Analyze Tactics"}
              </MatchButton>
            </div>
          </TacticalCardContent>
        </TacticalCard>

        <TacticalCard variant="default" className="overflow-hidden">
          <TacticalCardHeader className="pb-2">
            <TacticalCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              Momentum Overview
            </TacticalCardTitle>
          </TacticalCardHeader>
          <TacticalCardContent>
            <div className="bg-pitch-800 rounded-xl p-3 mb-3">
              <MomentumWave data={sampleChartData} homeLabel={homeTeam} awayLabel={awayTeam} height={180} />
            </div>
            <div className="flex justify-center gap-4">
              <StatPill value={stats.possession.home} label="Possession" suffix="%" color="var(--color-home)" size="sm" />
              <StatPill value={stats.shots.home} label="Shots" color="var(--color-home)" size="sm" />
              <StatPill value={stats.possession.away} label="Possession" suffix="%" color="var(--color-away)" size="sm" />
              <StatPill value={stats.shots.away} label="Shots" color="var(--color-away)" size="sm" />
            </div>
          </TacticalCardContent>
        </TacticalCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:grid-rows-1">
        <div className="h-full">
          <MatchSetupPanel compactEvents title="Match Events & Stats" className="h-full" />
        </div>

        <div ref={resultRef}>
          {loading && streamText && (
            <TacticalCard variant="default">
              <TacticalCardHeader>
                <TacticalCardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-600 animate-pulse" />
                  Analyzing Tactics...
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
              icon={<Brain className="h-5 w-5 text-indigo-600" />}
              title="Tactical Analysis"
              summary="Formation and Momentum agents are analyzing the match..."
              loading
            />
          )}

          {data && !loading && (
            <SummaryCard
              icon={<Brain className="h-5 w-5 text-indigo-600" />}
              title="Tactical Verdict"
              summary={data.tacticalSummary || data.summary}
              confidence={data.confidence}
              expandLabel="Show full analysis"
              collapseLabel="Hide analysis"
              defaultOpen={true}
              fixedHeight
            >
              <TacticalInsights result={data} />
            </SummaryCard>
          )}

          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-pitch-700 text-center p-8">
              <Brain className="h-16 w-16 text-indigo-300/40 mb-4" />
              <h3 className="text-lg font-semibold text-text-secondary mb-2">No Analysis Yet</h3>
              <p className="text-sm text-text-tertiary max-w-sm mb-6">
                Set up match events and formations on the left, then analyze. Both Formation and Momentum agents collaborate for a complete tactical breakdown.
              </p>
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                  Formation
                </div>
                <span className="text-text-tertiary">+</span>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                  Momentum
                </div>
              </div>
              {events.length > 0 && (
                <MatchButton onClick={handleAnalyze} className="mt-6 bg-indigo-600 hover:bg-indigo-500">
                  <Target className="h-4 w-4" />
                  Analyze Now
                </MatchButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TacticalPage() {
  return (
    <Suspense fallback={null}>
      <TacticalPageContent />
    </Suspense>
  );
}
