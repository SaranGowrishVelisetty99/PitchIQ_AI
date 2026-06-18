"use client";

import { useRef, useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { AgentName } from "../../../types";

interface InsightCardProps {
  agent: AgentName;
  summary: string;
  confidence: number;
  homeTeam: string;
  awayTeam: string;
  competition?: string;
  className?: string;
}

const agentColors: Record<AgentName, { bg: string; text: string; border: string }> = {
  formation: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  momentum: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  var: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  story: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  explanation: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

const agentLabels: Record<AgentName, string> = {
  formation: "Formation Analysis",
  momentum: "Momentum Analysis",
  var: "VAR Review",
  story: "Match Story",
  explanation: "Explanation",
};

export function InsightCard({ agent, summary, confidence, homeTeam, awayTeam, competition, className }: InsightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const colors = agentColors[agent];

  const handleShare = async () => {
    const text = [
      `⚽ PitchIQ AI — ${agentLabels[agent]}`,
      `${homeTeam} vs ${awayTeam}${competition ? ` (${competition})` : ""}`,
      "",
      summary,
      "",
      `Confidence: ${Math.round(confidence * 100)}%`,
      `AI-powered soccer intelligence — pitchiq.ai`,
    ].join("\n");

    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative rounded-xl border-2 p-4 flex flex-col gap-3",
        colors.border,
        colors.bg,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Image
          src="/PitchIQ_logo.png"
          alt="PitchIQ"
          width={24}
          height={24}
          className="rounded-full ring-1 ring-blue-500/30"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-700 truncate">
            {homeTeam} vs {awayTeam}
          </p>
          {competition && (
            <p className="text-[10px] text-slate-500">{competition}</p>
          )}
        </div>
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", colors.text, colors.bg)}>
          {agentLabels[agent]}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm leading-relaxed text-slate-800">{summary}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              confidence >= 0.8 ? "bg-green-500" : confidence >= 0.5 ? "bg-amber-400" : "bg-red-400"
            )}
          />
          <span className="text-[10px] text-slate-500">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {/* PitchIQ badge */}
      <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none select-none">
        <span className="text-[8px] font-bold tracking-widest text-slate-500">PitchIQ AI</span>
      </div>
    </div>
  );
}
