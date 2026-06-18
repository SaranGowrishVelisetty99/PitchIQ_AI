"use client";

import Link from "next/link";
import { Scoreboard } from "@/components/football/Scoreboard";

import { AgentAvatar } from "@/components/football/AgentAvatar";
import { StatPill } from "@/components/football/StatPill";
import { MatchSelector } from "@/components/match/MatchSelector";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { MatchBadge } from "@/components/design-system/MatchBadge";
import { LayoutGrid, TrendingUp, ShieldCheck, BookOpen, Brain, MessageSquare } from "lucide-react";
import { useMatch } from "@/contexts/MatchContext";

const agents = [
  { name: "formation" as const, label: "Formation", desc: "Shape & Space", color: "text-home" },
  { name: "momentum" as const, label: "Momentum", desc: "The Pulse", color: "text-gold-500" },
  { name: "var" as const, label: "VAR", desc: "Law & Order", color: "text-var" },
  { name: "story" as const, label: "Story", desc: "The Narrative", color: "text-xg" },
  { name: "explanation" as const, label: "Explain", desc: "The Teacher", color: "text-momentum" },
];

export default function HomePage() {
  const { homeTeam, awayTeam, homeScore, awayScore } = useMatch();

  return (
    <div className="flex-1">
      {/* ═══════════════════════════════════════════════════════════════
          HERO — The Tunnel Walk-Out
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[80vh] lg:min-h-[90vh] flex items-center">
        {/* Pitch background */}
        <div className="absolute inset-0 bg-gradient-to-b from-pitch-900 via-pitch-800 to-pitch-900">
          <div className="absolute inset-0 pitch-texture animate-pitchScan opacity-50" />
          <div className="absolute inset-0 stadium-dots" />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-home/5 animate-floatDrift" style={{ animationDuration: "12s" }} />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-gold-500/5 animate-floatDrift" style={{ animationDuration: "18s", animationDelay: "-6s" }} />
        </div>

        <div className="relative w-full max-w-screen-2xl mx-auto px-4 lg:px-6 pt-10 lg:pt-14 pb-20 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Brand intro */}
            <div className="space-y-8 animate-fadeInUp">
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚽</span>
                <div>
                  <span className="text-2xl lg:text-3xl font-bold text-gold-500 font-scoreboard tracking-tight">
                    PITCH<span className="text-text-primary">IQ</span> AI
                  </span>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold mt-0.5">
                    Explainable Soccer Intelligence
                  </p>
                </div>
              </div>

              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-text-primary leading-tight">
                Where Fans<br />
                <span className="text-gold-500 relative inline-block">
                  Read the Game
                  <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gold-500/30 rounded-full blur-sm" />
                </span>
              </h1>

              <p className="text-base lg:text-lg text-text-secondary max-w-lg leading-relaxed">
                Five specialized AI agents — Formation, Momentum, VAR, Story, and Explanation — working together to deliver transparent, explainable soccer insights.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link href="/chat">
                  <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gold-500 text-pitch-900 font-bold text-sm hover:bg-gold-400 transition-all duration-200 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5">
                    <span>🎙️</span>
                    <span>Start the Conversation</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {agents.map((a) => (
                    <AgentAvatar key={a.name} name={a.name} size="xs" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Match Selector */}
            <div className="animate-fadeInUp stagger-2">
              <MatchSelector />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FIVE AGENTS — The Squad
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-pitch-800/30">
        <div className="absolute inset-0 stadium-dots pointer-events-none" />
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12 animate-fadeInUp">
            <MatchBadge variant="info" size="sm" className="mb-3">The Squad</MatchBadge>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3">Five Specialized Agents</h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm">
              Each agent brings a unique capability. Together they deliver comprehensive soccer intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Formation */}
            <Link href="/formation" className="group animate-fadeInScale" style={{ animationDelay: "0ms" }}>
              <TacticalCard variant="elevated" className="h-full relative overflow-hidden" team="neutral">
                <div className="absolute inset-0 bg-gradient-to-br from-home/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TacticalCardContent className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-pitch-700 border border-gold-500/20 flex items-center justify-center text-home">
                      <LayoutGrid className="w-5 h-5" />
                    </span>
                    <div>
                      <TacticalCardTitle className="group-hover:text-home transition-colors">Formation Analyst</TacticalCardTitle>
                      <p className="text-[10px] text-text-tertiary">Shape & Space</p>
                    </div>
                  </div>
                  <div className="h-28 mb-2 flex items-center justify-center rounded-lg bg-home/5">
                    <LayoutGrid className="w-12 h-12 text-home/20" />
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Detect formation changes, pressing structures, defensive blocks, and attacking patterns.
                  </p>
                  <div className="mt-3 text-[10px] text-home font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyze Formation →
                  </div>
                </TacticalCardContent>
              </TacticalCard>
            </Link>

            {/* Momentum */}
            <Link href="/momentum" className="group animate-fadeInScale" style={{ animationDelay: "60ms" }}>
              <TacticalCard variant="elevated" className="h-full relative overflow-hidden" team="neutral">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TacticalCardContent className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-pitch-700 border border-gold-500/20 flex items-center justify-center text-gold-500">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                    <div>
                      <TacticalCardTitle className="group-hover:text-gold-500 transition-colors">Momentum Tracker</TacticalCardTitle>
                      <p className="text-[10px] text-text-tertiary">The Pulse</p>
                    </div>
                  </div>
                  <div className="h-28 mb-2 flex items-center justify-center rounded-lg bg-gold-500/5">
                    <TrendingUp className="w-12 h-12 text-gold-500/20" />
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Identify turning points, pressure phases, and dominant periods with AI-powered insights.
                  </p>
                  <div className="mt-3 text-[10px] text-gold-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Track Momentum →
                  </div>
                </TacticalCardContent>
              </TacticalCard>
            </Link>

            {/* VAR */}
            <Link href="/var" className="group animate-fadeInScale" style={{ animationDelay: "120ms" }}>
              <TacticalCard variant="elevated" className="h-full relative overflow-hidden" team="neutral">
                <div className="absolute inset-0 bg-gradient-to-br from-var/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TacticalCardContent className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-pitch-700 border border-gold-500/20 flex items-center justify-center text-var">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <TacticalCardTitle className="group-hover:text-var transition-colors">VAR Explainer</TacticalCardTitle>
                      <p className="text-[10px] text-text-tertiary">Law & Order</p>
                    </div>
                  </div>
                  <div className="h-28 mb-2 flex items-center justify-center rounded-lg bg-var/5">
                    <ShieldCheck className="w-12 h-12 text-var/20" />
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Understand referee decisions with clear FIFA law citations and step-by-step reasoning.
                  </p>
                  <div className="mt-3 text-[10px] text-var font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Review Incident →
                  </div>
                </TacticalCardContent>
              </TacticalCard>
            </Link>

            {/* Story */}
            <Link href="/story" className="group animate-fadeInScale" style={{ animationDelay: "180ms" }}>
              <TacticalCard variant="elevated" className="h-full relative overflow-hidden" team="neutral">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TacticalCardContent className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-pitch-700 border border-gold-500/20 flex items-center justify-center text-purple-400">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div>
                      <TacticalCardTitle className="group-hover:text-purple-400 transition-colors">Story Weaver</TacticalCardTitle>
                      <p className="text-[10px] text-text-tertiary">The Narrative</p>
                    </div>
                  </div>
                  <div className="h-28 mb-2 flex items-center justify-center rounded-lg bg-purple-500/5">
                    <BookOpen className="w-12 h-12 text-purple-400/20" />
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Convert match statistics into compelling narratives with dramatic chapters and key moments.
                  </p>
                  <div className="mt-3 text-[10px] text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Read the Story →
                  </div>
                </TacticalCardContent>
              </TacticalCard>
            </Link>

            {/* Tactical */}
            <Link href="/tactical" className="group animate-fadeInScale" style={{ animationDelay: "240ms" }}>
              <TacticalCard variant="elevated" className="h-full relative overflow-hidden" team="neutral">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TacticalCardContent className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-pitch-700 border border-gold-500/20 flex items-center justify-center text-indigo-400">
                      <Brain className="w-5 h-5" />
                    </span>
                    <div>
                      <TacticalCardTitle className="group-hover:text-indigo-400 transition-colors">Tactical Briefing</TacticalCardTitle>
                      <p className="text-[10px] text-text-tertiary">Combined Intel</p>
                    </div>
                  </div>
                  <div className="h-28 mb-2 flex items-center justify-center rounded-lg bg-indigo-500/5">
                    <Brain className="w-12 h-12 text-indigo-400/20" />
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Combined formation and momentum analysis for comprehensive tactical breakdown.
                  </p>
                  <div className="mt-3 text-[10px] text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter Briefing →
                  </div>
                </TacticalCardContent>
              </TacticalCard>
            </Link>

            {/* Chat */}
            <Link href="/chat" className="group animate-fadeInScale" style={{ animationDelay: "300ms" }}>
              <TacticalCard variant="elevated" className="h-full relative overflow-hidden" team="neutral">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <TacticalCardContent className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-pitch-700 border border-gold-500/20 flex items-center justify-center text-gold-500">
                      <MessageSquare className="w-5 h-5" />
                    </span>
                    <div>
                      <TacticalCardTitle className="group-hover:text-gold-500 transition-colors">AI Dugout</TacticalCardTitle>
                      <p className="text-[10px] text-text-tertiary">Chat with All Agents</p>
                    </div>
                  </div>
                  <div className="h-28 mb-2 flex items-center justify-center rounded-lg bg-gold-500/5">
                    <MessageSquare className="w-12 h-12 text-gold-500/20" />
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Chat with all five agents — adapting to your level from casual fan to scout.
                  </p>
                  <div className="mt-3 text-[10px] text-gold-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Join the Dugout →
                  </div>
                </TacticalCardContent>
              </TacticalCard>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          POWERED BY — Scoreboard Section
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-pitch-800/50 via-pitch-900 to-pitch-800/50" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-home/3 blur-3xl animate-stadiumPulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-away/3 blur-3xl animate-stadiumPulse stagger-2" style={{ animationDuration: "5s" }} />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <MatchBadge variant="info" size="sm">Powered by Multi-Agent AI</MatchBadge>

            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
              Every response is orchestrated by multiple specialized agents working together, with reasoning, evidence, and confidence scores.
            </h2>

            <div className="flex justify-center gap-8 lg:gap-16 pt-4">
              <StatPill value={100} label="Transparent" suffix="%" color="var(--color-momentum)" size="md" />
              <StatPill value={5} label="AI Agents" color="var(--color-gold-500)" size="md" />
              <StatPill value={4} label="Expertise Levels" color="var(--color-home)" size="md" />
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              {agents.map((a) => (
                <div key={a.name} className="flex flex-col items-center gap-1">
                  <AgentAvatar name={a.name} size="sm" />
                  <span className="text-[9px] text-text-tertiary uppercase tracking-wider">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
