"use client";

import { useState, useRef, useCallback, useEffect, Suspense, useMemo } from "react";
import { IncidentInput } from "@/components/var/IncidentInput";
import { VARResultCard } from "@/components/var/VARResultCard";
import { AgentIndicator } from "@/components/chat/AgentIndicator";
import { SummaryCard } from "@/components/match/SummaryCard";
import { MatchButton } from "@/components/design-system/MatchButton";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { Pitch, PitchMarkings } from "@/components/football";
import { VARIncidentMarker } from "@/components/football/VARIncidentMarker";
import { AgentAvatar } from "@/components/football/AgentAvatar";
import { StatPill } from "@/components/football/StatPill";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useMatch } from "@/contexts/MatchContext";
import { useMatchParams } from "@/hooks/useMatchParams";
import {
  ShieldCheck, Search, ClipboardCheck, MessageSquare, Scale,
  Share2, Footprints, Hand, AlertTriangle, Swords, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { IncidentType, VARResult, AgentName, MatchEvent } from "../../../types";

const agents: AgentName[] = ["var"];

const decisionSteps = [
  { icon: Search, label: "Check", desc: "VAR reviews the incident" },
  { icon: ClipboardCheck, label: "Review", desc: "On-field monitor review" },
  { icon: MessageSquare, label: "Communicate", desc: "VAR to referee" },
  { icon: Scale, label: "Decision", desc: "Final call by referee" },
];

const incidentPosition: Record<IncidentType, { x: number; y: number }> = {
  offside: { x: 380, y: 130 },
  handball: { x: 250, y: 175 },
  penalty: { x: 250, y: 280 },
  "red-card": { x: 250, y: 175 },
  general: { x: 250, y: 175 },
};

const sampleIncidents: { type: IncidentType; description: string; label: string; icon: React.ReactNode }[] = [
  { type: "handball", description: "Mbappé's arm made contact with the ball inside the box while challenging for a header", label: "Mbappé Handball", icon: <Hand className="h-3.5 w-3.5" /> },
  { type: "offside", description: "Attacker was in an offside position when the through ball was played, then scored", label: "Offside Goal", icon: <Footprints className="h-3.5 w-3.5" /> },
  { type: "penalty", description: "Defender made contact with the attacker's leg inside the box during a corner kick", label: "Penalty Shout", icon: <Swords className="h-3.5 w-3.5" /> },
  { type: "red-card", description: "Last defender pulled down the attacker outside the box denying a clear goalscoring opportunity", label: "Red Card Tackle", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
];

const varRelevantTypes = new Set<MatchEvent["type"]>(["foul", "penalty", "missed-penalty", "card"]);

const incidentTypeOptions: { type: IncidentType; label: string; color: string }[] = [
  { type: "handball", label: "Handball", color: "bg-var/15 text-var border-var/30" },
  { type: "offside", label: "Offside", color: "bg-gold-500/15 text-gold-500 border-gold-500/30" },
  { type: "penalty", label: "Penalty", color: "bg-card-red/20 text-card-red border-card-red/30" },
  { type: "red-card", label: "Red Card", color: "bg-away/20 text-away border-away/30" },
  { type: "general", label: "Other", color: "bg-pitch-700 text-text-secondary border-pitch-600" },
];

const incidentColors: Record<IncidentType, string> = {
  offside: "bg-gold-500/15 text-gold-500 border-gold-500/30",
  handball: "bg-var/15 text-var border-var/30",
  penalty: "bg-card-red/20 text-card-red border-card-red/30",
  "red-card": "bg-away/20 text-away border-away/30",
  general: "bg-pitch-700 text-text-secondary border-pitch-600",
};

function VARPageContent() {
  const { homeTeam, awayTeam, events } = useMatch();
  const { shareUrl } = useMatchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [incidentType, setIncidentType] = useState<IncidentType>("general");
  const incidentRef = useRef<{ type: IncidentType; description: string; context?: string } | null>(null);

  const matchIncidents = useMemo(() => {
    return events.filter((e) => varRelevantTypes.has(e.type));
  }, [events]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const loadingRef = useRef(false);

  const { result, loading, error, streamText, analyze } = useAgentStream({
    cacheKey: "var",
    agentName: "var",
    endpoint: "/api/var",
    buildBody: useCallback(() => {
      const incident = incidentRef.current;
      return {
        type: incident?.type ?? "general",
        description: incident?.description ?? "",
        context: incident?.context,
      };
    }, []),
  });

  const data = result as VARResult | null;

  const handleShare = useCallback(() => {
    shareUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  useEffect(() => {
    loadingRef.current = loading;
    if (!loading && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [loading]);

  const handleAnalyze = useCallback((type: IncidentType, description: string, context?: string) => {
    if (loadingRef.current) return;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    incidentRef.current = { type, description, context };
    setIncidentType(type);
    setActiveStep(0);
    analyze();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step >= 4) { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; return; }
      setActiveStep(step);
    }, 800);
  }, [analyze]);

  const pos = incidentPosition[incidentType];

  return (
    <div className="min-h-screen bg-pitch-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-6 w-6 text-var" />
            <h1 className="text-2xl font-bold text-text-primary">VAR Explainer</h1>
            <AgentIndicator agents={agents} />
            <div className="ml-auto">
              <MatchButton variant="ghost" size="sm" className="gap-1.5" onClick={handleShare}>
                <Share2 className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Share"}
              </MatchButton>
            </div>
          </div>
          <p className="text-text-tertiary">
            VAR Agent analyzes referee decisions with FIFA law citations and explainable reasoning.
          </p>
          {homeTeam && (
            <div className="flex items-center gap-2 mt-2">
              <MatchBadge variant="info" size="sm">
                {homeTeam} vs {awayTeam} &bull; {events.length} events
              </MatchBadge>
            </div>
          )}
        </div>

        {/* Decision flow stepper */}
        <TacticalCard className={cn("mb-8", loading && "ring-2 ring-var/30")}>
          <TacticalCardContent className="pt-6">
            <div className="flex items-center justify-between">
              {decisionSteps.map((step, i) => (
                <div key={step.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                        i <= activeStep
                          ? "bg-var border-var text-white shadow-lg shadow-var/30"
                          : "bg-pitch-700 border-pitch-700 text-text-tertiary",
                        loading && i === activeStep && "animate-pulse"
                      )}
                    >
                      {loading && i === activeStep ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={cn("text-xs font-medium mt-1.5 transition-colors", i <= activeStep ? "text-var" : "text-text-tertiary")}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-text-tertiary">{step.desc}</span>
                  </div>
                  {i < decisionSteps.length - 1 && (
                    <div className={cn("h-0.5 flex-1 mx-2 mt-[-1.5rem] transition-colors duration-500", i < activeStep ? "bg-var" : "bg-pitch-700")} />
                  )}
                </div>
              ))}
            </div>
            {loading && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2 text-xs text-var bg-var/10 px-3 py-1.5 rounded-full">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  VAR consulting FIFA Laws...
                </div>
              </div>
            )}
          </TacticalCardContent>
        </TacticalCard>

        {/* Sample incidents + Pitch + confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <TacticalCard className="lg:col-span-2 overflow-hidden">
            <TacticalCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <TacticalCardTitle className="text-base text-text-primary">Incident View</TacticalCardTitle>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider", incidentColors[incidentType])}>
                  {incidentType}
                </span>
              </div>
            </TacticalCardHeader>
            <TacticalCardContent>
              <Pitch width={500} height={350}>
                <PitchMarkings width={500} height={350} />
                <VARIncidentMarker type={incidentType} x={pos.x} y={pos.y} size={22} label={incidentType.toUpperCase()} animated={loading} />
              </Pitch>
            </TacticalCardContent>
          </TacticalCard>

          <TacticalCard>
            <TacticalCardHeader className="pb-2">
              <TacticalCardTitle className="text-base text-text-primary">Quick Incidents</TacticalCardTitle>
            </TacticalCardHeader>
            <TacticalCardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {matchIncidents.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">Match Events</p>
                  {matchIncidents.map((inc, i) => (
                    <div key={i} className="mb-2 p-2 rounded-lg border border-pitch-700 bg-pitch-800/50">
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="shrink-0 text-[10px] font-mono text-text-tertiary mt-0.5">{inc.minute}&apos;</span>
                        <div className="flex-1 min-w-0">
                          <span className={cn("text-xs font-medium", inc.team === "home" ? "text-home" : "text-away")}>
                            {inc.team === "home" ? homeTeam : awayTeam}
                          </span>
                          {inc.player && <span className="text-xs text-text-tertiary"> &mdash; {inc.player}</span>}
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{inc.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {incidentTypeOptions.map((opt) => (
                          <button
                            key={opt.type}
                            onClick={() => handleAnalyze(opt.type, inc.description)}
                            disabled={loading}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border transition-all font-medium",
                              opt.color,
                              "hover:brightness-125 disabled:opacity-40"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">Sample Incidents</p>
                {sampleIncidents.map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => handleAnalyze(sample.type, sample.description)}
                    disabled={loading}
                    className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-lg border border-pitch-700 hover:border-var hover:bg-var/10 transition-all disabled:opacity-50 mb-1"
                  >
                    <span className={cn("p-1.5 rounded-md", incidentColors[sample.type])}>
                      {sample.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary">{sample.label}</span>
                      <p className="text-[10px] text-text-tertiary truncate">{sample.description.slice(0, 50)}...</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <AgentAvatar name="var" size="sm" />
              </div>
              {data && !loading && (
                <div className="rounded-lg bg-pitch-700 p-3 mt-2">
                  <div className="text-[10px] text-text-tertiary mb-1">Decision Confidence</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-pitch-700 overflow-hidden">
                      <div className="h-full rounded-full bg-var transition-all duration-1000" style={{ width: `${Math.min(100, data.confidence)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-var">{Math.min(100, Math.round(data.confidence))}%</span>
                  </div>
                </div>
              )}
            </TacticalCardContent>
          </TacticalCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:grid-rows-1">
          <div className="h-full">
            <IncidentInput onAnalyze={handleAnalyze} loading={loading} />
          </div>
          <div ref={resultRef}>
            {loading && streamText && (
              <TacticalCard variant="glass">
                <TacticalCardHeader>
                  <TacticalCardTitle className="text-base text-text-primary flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-var animate-pulse" />
                    VAR Reviewing...
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
                <button onClick={() => { if (incidentRef.current) handleAnalyze(incidentRef.current.type, incidentRef.current.description, incidentRef.current.context); }} className="shrink-0 text-xs font-semibold uppercase tracking-wider text-card-red hover:text-card-red/80 underline underline-offset-2">
                  Retry
                </button>
              </div>
            )}

            {loading && !streamText && (
              <SummaryCard
                icon={<ShieldCheck className="h-5 w-5 text-var" />}
                title="VAR Review"
                summary="VAR is reviewing the incident with FIFA Law citations..."
                loading
              />
            )}

            {data && !loading && (
              <SummaryCard
                icon={<ShieldCheck className="h-5 w-5 text-var" />}
                title="VAR Verdict"
                summary={data.fanFriendly || data.summary}
                confidence={data.confidence ? Math.round(data.confidence) : undefined}
                expandLabel="Show FIFA law details"
                collapseLabel="Hide law details"
                defaultOpen={true}
                fixedHeight
              >
                <VARResultCard result={data} />
              </SummaryCard>
            )}

            {!data && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border-2 border-dashed border-pitch-700 text-center p-8">
                <ShieldCheck className="h-16 w-16 text-var/40 mb-4" />
                <h3 className="text-lg font-semibold text-text-secondary mb-2">No Incident Analyzed Yet</h3>
                <p className="text-sm text-text-tertiary max-w-sm mb-6">
                  {matchIncidents.length > 0
                    ? "Select an incident type for a match event to start the VAR analysis."
                    : "Pick a sample incident above or describe your own — the VAR Agent will retrieve FIFA Laws and provide an explainable decision."}
                </p>
                {matchIncidents.length > 0 ? (
                  <div className="w-full max-w-sm space-y-2">
                    {matchIncidents.slice(0, 3).map((inc, i) => (
                      <div key={i} className="p-2 rounded-lg border border-pitch-700 bg-pitch-800/50 text-left">
                        <p className="text-[11px] text-text-secondary mb-1.5 leading-snug">
                          <span className="text-[10px] font-mono text-text-tertiary">{inc.minute}&apos;</span>
                          {" "}{inc.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {incidentTypeOptions.map((opt) => (
                            <button
                              key={opt.type}
                              onClick={() => handleAnalyze(opt.type, inc.description)}
                              className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium transition-all hover:brightness-125", opt.color)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                    {sampleIncidents.slice(0, 4).map((sample) => (
                      <button
                        key={sample.label}
                        onClick={() => handleAnalyze(sample.type, sample.description)}
                        className="flex items-center gap-1.5 p-2 rounded-lg border border-pitch-700 text-xs text-text-secondary hover:border-var hover:text-var transition-all"
                      >
                        {sample.icon}
                        {sample.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VARPage() {
  return (
    <Suspense fallback={null}>
      <VARPageContent />
    </Suspense>
  );
}
