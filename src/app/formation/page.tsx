"use client";

import { useState, useCallback, Suspense, useRef, useEffect } from "react";
import { MatchButton } from "@/components/design-system/MatchButton";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { LayoutGrid, Shield, Swords, GitFork, Share2, Sparkles } from "lucide-react";
import { FormationVisual, formations } from "@/components/football/FormationVisual";
import { HeatmapPitch } from "@/components/football/HeatmapPitch";
import { AgentAvatar } from "@/components/football/AgentAvatar";
import { useMatch } from "@/contexts/MatchContext";
import { useMatchParams } from "@/hooks/useMatchParams";
import { MatchSetupPanel } from "@/components/match/MatchSetupPanel";
import { SummaryCard } from "@/components/match/SummaryCard";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { useAgentStream } from "@/hooks/useAgentStream";
import type { AgentName } from "../../../types";

const FORMATION_PRESETS = Object.keys(formations);

const labelMap: Record<string, string> = {
  "4-4-2": "Classic", "4-3-3": "Attacking", "3-5-2": "Wing Play",
  "3-4-3": "Fluid", "5-3-2": "Defensive", "4-2-3-1": "Balanced",
};

function FormationPageContent() {
  const { homeTeam, setHomeTeam, awayTeam, setAwayTeam, homeFormation, setHomeFormation, awayFormation, setAwayFormation, events, selectedMatchId, selectMatch } = useMatch();

  useEffect(() => { if (!selectedMatchId) selectMatch("arg-fra-2022"); }, []);
  const { shareUrl } = useMatchParams();
  const { result, loading, error, streamText, analyze } = useAgentStream({
    cacheKey: "formation",
    agentName: "formation",
    endpoint: "/api/agents/formation",
    buildBody: ({ homeTeam, awayTeam, homeFormation, awayFormation, events, stats }) => ({
      message: `Analyze formations for ${homeTeam} vs ${awayTeam}`,
      matchData: { events, homeTeam, awayTeam, formations: { home: homeFormation, away: awayFormation }, stats },
    }),
  });
  const [copied, setCopied] = useState(false);
  const agents: AgentName[] = ["formation"];
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(() => {
    shareUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleAnalyze = () => {
    analyze();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const data = result as Record<string, unknown> | null;
  const timeline = Array.isArray(data?.formationTimeline) ? data!.formationTimeline as Array<{ period: { start: number; end: number }; homeFormation: string; awayFormation: string; description: string }> : undefined;
  const pressing = typeof data?.pressingStructure === "string" ? data.pressingStructure : undefined;
  const defensive = typeof data?.defensiveBlock === "string" ? data.defensiveBlock : undefined;
  const attacking = typeof data?.attackingPattern === "string" ? data.attackingPattern : undefined;
  const insights = Array.isArray(data?.tacticalInsights) ? data!.tacticalInsights.filter((i): i is string => typeof i === "string") : undefined;
  const summary = typeof data?.summary === "string" ? data.summary : `${homeTeam} vs ${awayTeam} — formation analysis with ${events.length} events.`;
  const reasoning = typeof data?.reasoning === "string" ? data.reasoning : undefined;

  const hasDetails = timeline || pressing || defensive || attacking || (Array.isArray(insights) && insights.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 bg-pitch-900 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid className="h-6 w-6 text-home" />
          <h1 className="text-2xl font-bold text-text-primary">Formation Analysis</h1>
          <AgentIndicator agents={agents} />
          <div className="ml-auto">
            <MatchButton variant="ghost" size="sm" className="text-xs gap-1.5" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Share"}
            </MatchButton>
          </div>
        </div>
        <p className="text-text-tertiary">Detect formation changes, pressing structures, defensive blocks, and attacking patterns.</p>
      </div>

      {/* Top row: Tactical Board + Formation Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <TacticalCard className="lg:col-span-3 border-pitch-700 bg-pitch-800 shadow-sm overflow-hidden border-gold-500/10 flex flex-col" variant="default">
          <TacticalCardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <TacticalCardTitle className="text-base text-text-primary">Tactical Board</TacticalCardTitle>
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-home" /> <span className="text-home">{homeTeam}</span></span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-white border border-red-500" /> <span className="text-away">{awayTeam}</span></span>
              </div>
            </div>
          </TacticalCardHeader>
          <TacticalCardContent className="flex-1 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div>
                <div className="text-xs text-text-tertiary mb-2 text-center uppercase tracking-wider font-semibold">{homeTeam} — {homeFormation}</div>
                <FormationVisual formation={homeFormation} team="home" size="lg" />
              </div>
              <div>
                <div className="text-xs text-text-tertiary mb-2 text-center uppercase tracking-wider font-semibold">{awayTeam} — {awayFormation}</div>
                <FormationVisual formation={awayFormation} team="away" size="lg" />
              </div>
            </div>
          </TacticalCardContent>
        </TacticalCard>

        <TacticalCard className="lg:col-span-2 border-pitch-700 bg-pitch-800 shadow-sm border-gold-500/10 flex flex-col" variant="default">
          <TacticalCardHeader className="pb-2 shrink-0">
            <TacticalCardTitle className="text-base text-text-primary">Formation Presets</TacticalCardTitle>
          </TacticalCardHeader>
          <TacticalCardContent className="flex-1 flex flex-col">
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] text-text-tertiary mb-2 block font-semibold uppercase tracking-wider">{homeTeam}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {FORMATION_PRESETS.map((f) => (
                    <button key={f} onClick={() => setHomeFormation(f)}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border text-left ${homeFormation === f ? "bg-home text-white border-home shadow-sm" : "bg-pitch-800 text-text-secondary border-pitch-700 hover:border-home/50 hover:text-home"}`}
                    >
                      <span className="font-semibold">{f}</span>
                      <span className="ml-1 opacity-60 font-normal">{labelMap[f]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-text-tertiary mb-2 block font-semibold uppercase tracking-wider">{awayTeam}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {FORMATION_PRESETS.map((f) => (
                    <button key={f} onClick={() => setAwayFormation(f)}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border text-left ${awayFormation === f ? "bg-away text-white border-away shadow-sm" : "bg-pitch-800 text-text-secondary border-pitch-700 hover:border-away/50 hover:text-away"}`}
                    >
                      <span className="font-semibold">{f}</span>
                      <span className="ml-1 opacity-60 font-normal">{labelMap[f]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 mt-auto border-t border-gold-500/10">
              <AgentAvatar name="formation" size="sm" />
              <MatchButton onClick={handleAnalyze} disabled={loading || events.length === 0} variant="primary" className="flex-1 bg-home hover:bg-home h-9 text-sm gap-1.5" loading={loading}>
                <Sparkles className="h-3.5 w-3.5" />
                {loading ? "Analyzing..." : "Analyze Formation"}
              </MatchButton>
            </div>
          </TacticalCardContent>
        </TacticalCard>
      </div>

      {/* Bottom row: Match Events + Analysis Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:grid-rows-1">
        <div className="h-full">
          <MatchSetupPanel showStats={false} title="Match Events" className="h-full" />
        </div>

        <div ref={resultRef} className="h-full">
          {loading && streamText && (
            <TacticalCard className="border-pitch-700 border-gold-500/10 h-full" variant="glass">
              <TacticalCardHeader>
                <TacticalCardTitle className="text-base text-text-primary flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-home animate-pulse" />
                  Analyzing...
                </TacticalCardTitle>
              </TacticalCardHeader>
              <TacticalCardContent>
                <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary leading-relaxed max-h-96 overflow-y-auto scrollbar-none">{streamText}</pre>
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
              icon={<LayoutGrid className="h-5 w-5 text-home" />}
              title="Formation Insights"
              summary={summary}
              defaultOpen={true}
              fixedHeight
            >
              {timeline?.map((entry, i) => (
                <div key={i} className="rounded-lg bg-home/10 border border-home/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-home" />
                    <span className="text-sm font-semibold text-text-primary">{entry.homeFormation} vs {entry.awayFormation}</span>
                    <span className="text-[10px] text-text-tertiary font-scoreboard tabular-nums">{entry.period.start}&apos;-{entry.period.end}&apos;</span>
                  </div>
                  <p className="text-sm text-text-secondary">{entry.description}</p>
                </div>
              ))}
              {pressing && (
                <div className="rounded-lg bg-gold-500/10 border border-gold-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="h-4 w-4 text-gold-500" />
                    <h3 className="text-sm font-semibold text-text-primary">Pressing Structure</h3>
                  </div>
                  <p className="text-sm text-text-secondary">{pressing}</p>
                  <div className="mt-3 rounded-lg overflow-hidden border border-gold-500/20">
                    <HeatmapPitch
                      zones={
                        pressing.toLowerCase().includes("high")
                          ? [{ x: 400, y: 100, intensity: 1, label: "High Press" }, { x: 350, y: 180, intensity: 0.7 }, { x: 450, y: 150, intensity: 0.5 }]
                          : pressing.toLowerCase().includes("mid")
                          ? [{ x: 250, y: 80, intensity: 0.8 }, { x: 250, y: 200, intensity: 0.7, label: "Mid Block" }]
                          : [{ x: 80, y: 120, intensity: 0.9, label: "Low Block" }, { x: 60, y: 220, intensity: 0.8 }]
                      }
                      width={200}
                      height={140}
                    />
                  </div>
                </div>
              )}
              {defensive && (
                <div className="rounded-lg bg-away/10 border border-away/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-away" />
                    <h3 className="text-sm font-semibold text-text-primary">Defensive Block</h3>
                  </div>
                  <p className="text-sm text-text-secondary">{defensive}</p>
                </div>
              )}
              {attacking && (
                <div className="rounded-lg bg-momentum/10 border border-momentum/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitFork className="h-4 w-4 text-momentum" />
                    <h3 className="text-sm font-semibold text-text-primary">Attacking Pattern</h3>
                  </div>
                  <p className="text-sm text-text-secondary">{attacking}</p>
                </div>
              )}
              {Array.isArray(insights) && insights.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary">Tactical Insights</h3>
                  <ul className="space-y-1">
                    {insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-home" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {reasoning && !hasDetails && (
                <div className="rounded-lg bg-gold-500/10 border border-gold-500/20 p-3">
                  <p className="text-xs text-gold-500 mb-2">{reasoning}</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary leading-relaxed max-h-96 overflow-y-auto">{summary}</pre>
                </div>
              )}
            </SummaryCard>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-lg border border-dashed border-pitch-700 text-center p-8">
              <LayoutGrid className="h-12 w-12 text-home/30 mb-4" />
              <p className="text-text-tertiary text-sm">Select a match and click &quot;Analyze Formation&quot; to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FormationPage() {
  return (
    <Suspense fallback={null}>
      <FormationPageContent />
    </Suspense>
  );
}
