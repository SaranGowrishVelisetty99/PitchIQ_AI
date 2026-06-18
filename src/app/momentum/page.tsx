"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from "react";
import { MatchButton } from "@/components/design-system/MatchButton";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { TrendingUp, Zap, Activity, Share2 } from "lucide-react";
import { MomentumWave } from "@/components/football/MomentumWave";
import { XGTimeline } from "@/components/football/XGTimeline";
import { AgentAvatar } from "@/components/football/AgentAvatar";
import { StatPill } from "@/components/football/StatPill";
import { useMatch } from "@/contexts/MatchContext";
import { useMatchParams } from "@/hooks/useMatchParams";
import { MatchSetupPanel } from "@/components/match/MatchSetupPanel";
import { SummaryCard } from "@/components/match/SummaryCard";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { useAgentStream } from "@/hooks/useAgentStream";
import type { AgentName } from "../../../types";

const sampleChartData = [
  { minute: 0, homeValue: 50, awayValue: 50 },
  { minute: 15, homeValue: 62, awayValue: 38 },
  { minute: 23, homeValue: 78, awayValue: 22, trigger: "Goal!" },
  { minute: 36, homeValue: 72, awayValue: 28, trigger: "Goal!" },
  { minute: 45, homeValue: 65, awayValue: 35 },
  { minute: 60, homeValue: 55, awayValue: 45 },
  { minute: 75, homeValue: 40, awayValue: 60 },
  { minute: 80, homeValue: 35, awayValue: 65, trigger: "Goal!" },
  { minute: 81, homeValue: 30, awayValue: 70, trigger: "Goal!" },
  { minute: 90, homeValue: 45, awayValue: 55 },
];

function MomentumPageContent() {
  const { homeTeam, awayTeam, stats, events, selectedMatchId, selectMatch } = useMatch();

  useEffect(() => { if (!selectedMatchId) selectMatch("arg-fra-2022"); }, []);
  const { shareUrl } = useMatchParams();
  const { result, loading, error, streamText, analyze } = useAgentStream({
    cacheKey: "momentum",
    agentName: "momentum",
    endpoint: "/api/agents/momentum",
    buildBody: ({ homeTeam, awayTeam, events }) => ({
      message: `Analyze momentum for ${homeTeam} vs ${awayTeam}`,
      matchData: { events, homeTeam, awayTeam },
    }),
  });
  const [copied, setCopied] = useState(false);
  const agents: AgentName[] = ["momentum"];
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(() => {
    shareUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleAnalyze = useCallback(() => {
    analyze();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [analyze]);

  const data = result as Record<string, unknown> | null;
  const shifts = data?.shiftExplanations as Array<{ minute: number; explanation: string; team: string }> | undefined;
  const periods = data?.dominantPeriods as Array<{ team: string; start: number; end: number; reason: string }> | undefined;
  const summary = typeof data?.summary === "string" ? data.summary
    : shifts?.length ? `${shifts.length} momentum shifts detected across ${events.length} events.`
    : `${homeTeam} vs ${awayTeam} — momentum analysis.`;

  return (
    <div className="container mx-auto px-4 py-8 bg-pitch-900">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-text-primary">Momentum Analysis</h1>
          <AgentIndicator agents={agents} />
          <div className="ml-auto">
            <MatchButton variant="ghost" size="sm" className="gap-1.5" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Share"}
            </MatchButton>
          </div>
        </div>
        <p className="text-text-tertiary">Identify turning points, pressure phases, and dominant periods during the match.</p>
      </div>

      {/* Momentum chart hero */}
      <TacticalCard variant="default" className="mb-8 overflow-hidden">
        <TacticalCardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <TacticalCardTitle className="text-base">Momentum Wave</TacticalCardTitle>
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-home" /> {homeTeam}</span>
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-away" /> {awayTeam}</span>
            </div>
          </div>
        </TacticalCardHeader>
        <TacticalCardContent>
          <div className="bg-pitch-800 rounded-xl p-4">
            <MomentumWave
              data={sampleChartData}
              homeLabel={homeTeam}
              awayLabel={awayTeam}
              height={220}
            />
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <StatPill value={stats.possession.home} label="Possession" suffix="%" color="var(--color-home)" size="sm" />
            <StatPill value={stats.possession.away} label="Possession" suffix="%" color="var(--color-away)" size="sm" />
          </div>
        </TacticalCardContent>
      </TacticalCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:grid-rows-1">
        <div className="h-full flex flex-col">
          <MatchSetupPanel showFormations={false} compactEvents title="Match Setup" className="flex-1" />
          <div className="flex items-center gap-2 mt-3 shrink-0">
            <AgentAvatar name="momentum" size="sm" />
            <MatchButton onClick={handleAnalyze} disabled={loading || events.length === 0} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white">
              {loading ? "Analyzing Momentum..." : "Analyze Momentum"}
            </MatchButton>
          </div>
        </div>

        <div ref={resultRef}>
          {loading && streamText && (
            <TacticalCard variant="glass">
              <TacticalCardHeader>
                <TacticalCardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600 animate-pulse" />
                  Analyzing...
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

          {data && !loading && (
            <SummaryCard
              icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
              title="Momentum Insights"
              summary={summary}
              confidence={typeof data?.confidence === "number" ? data.confidence : undefined}
              expandLabel="Show all shifts"
              collapseLabel="Hide shifts"
              fixedHeight
            >
              {shifts?.map((shift, i) => (
                <div key={i} className="rounded-lg bg-amber-50/50 border border-amber-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`h-4 w-4 ${shift.team === "home" ? "text-home" : "text-away"}`} />
                    <span className="text-sm font-semibold text-text-primary">
                      {shift.team === "home" ? homeTeam : awayTeam} — {shift.minute}&apos;
                    </span>
                  </div>
                  <p className="text-sm text-text-primary">{shift.explanation}</p>
                </div>
              ))}
              {periods && periods.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-600" />
                    Dominant Periods
                  </h3>
                  {periods.map((period, i) => (
                    <div key={i} className="rounded-lg border border-pitch-700 bg-pitch-800 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <MatchBadge className={`text-[10px] ${period.team === "home" ? "border-home/30 text-home bg-home/10" : "border-away/30 text-away bg-away/10"}`}>
                          {period.team === "home" ? homeTeam : awayTeam}
                        </MatchBadge>
                        <span className="text-[10px] text-text-tertiary">{period.start}&apos; - {period.end}&apos;</span>
                      </div>
                      <p className="text-sm text-text-secondary">{period.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-text-primary mb-2">Expected Goals Timeline</h4>
                <div className="rounded-lg overflow-hidden border border-pitch-700 bg-pitch-800 p-2">
                  <XGTimeline
                    data={sampleChartData.map((d) => ({
                      minute: d.minute,
                      homeValue: d.homeValue / 100,
                      awayValue: d.awayValue / 100,
                      event: d.trigger,
                    }))}
                    homeLabel={homeTeam}
                    awayLabel={awayTeam}
                    height={150}
                  />
                </div>
              </div>
            </SummaryCard>
          )}

          {!data && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-lg border border-dashed border-pitch-700 text-center p-8">
              <TrendingUp className="h-12 w-12 text-amber-400/30 mb-4" />
              <p className="text-text-secondary">Select a match or enter events to detect momentum shifts and turning points.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MomentumPage() {
  return (
    <Suspense fallback={null}>
      <MomentumPageContent />
    </Suspense>
  );
}
