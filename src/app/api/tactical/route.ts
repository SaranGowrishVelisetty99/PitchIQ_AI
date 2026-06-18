import { NextResponse } from "next/server";
import { FormationAgent } from "@/agents/formation-agent";
import { MomentumAgent } from "@/agents/momentum-agent";
import { generateStreamingResponse } from "@/lib/openrouter";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { TacticalResult } from "../../../../types";

const formationAgent = new FormationAgent();
const momentumAgent = new MomentumAgent();

function normalizeConfidence(val: unknown, fallback: number): number {
  if (typeof val !== "number") return fallback;
  return val > 1 ? Math.round(val) : Math.round(val * 100);
}

function buildTacticalResult(
  fOutput: Record<string, unknown>,
  mOutput: Record<string, unknown>,
  events: { minute: number; type: string; team: string; description: string }[],
  stats: { possession: { home: number; away: number }; shots: { home: number; away: number } },
  homeTeam: string,
  awayTeam: string,
  formations?: { home: string; away: string },
  fConfidence?: number,
  mConfidence?: number,
): TacticalResult {
  const momentumEvents = findMomentumShifts(events, homeTeam, awayTeam);
  return {
    summary: (fOutput.summary as string) ?? `${homeTeam} vs ${awayTeam} tactical analysis completed.`,
    reasoning: `Analyzed ${events.length} events using Formation and Momentum agents.`,
    evidence: [
      `Possession: ${stats.possession.home}% - ${stats.possession.away}%`,
      `Shots: ${stats.shots.home} - ${stats.shots.away}`,
      fConfidence && fConfidence > 0 ? `Formation analysis confidence: ${fConfidence}%` : "",
      mConfidence && mConfidence > 0 ? `Momentum analysis confidence: ${mConfidence}%` : "",
    ].filter(Boolean),
    confidence: fConfidence && mConfidence ? Math.round((fConfidence + mConfidence) / 2) : 75,
    sources: [],
    tacticalSummary: (fOutput.tacticalSummary as string) ?? (fOutput.summary as string) ?? `${homeTeam} and ${awayTeam} employed ${formations?.home || "unknown"} and ${formations?.away || "unknown"} formations respectively.`,
    momentumAnalysis: (mOutput.summary as string) ?? generateMomentumText(events, homeTeam, awayTeam),
    turningPoints: (mOutput.shiftExplanations as Array<{ minute: number; explanation: string; team: string }>)?.map((s) => ({
      minute: s.minute,
      description: s.explanation,
      impact: "medium" as const,
      team: s.team as "home" | "away",
    })) ?? momentumEvents,
    formationImpact: ((fOutput.formationTimeline as Array<{ description: string }>)?.map((f) => f.description).join(" ") as string) ?? `The ${formations?.home || "home"} vs ${formations?.away || "away"} tactical battle shaped the match dynamics.`,
    keyAdjustments: (fOutput.tacticalInsights as string[]) ?? findAdjustments(events),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { events, stats, homeTeam, awayTeam, formations } = body;

    if (!events || !stats) {
      return NextResponse.json(
        { error: "Match events and statistics are required" },
        { status: 400 }
      );
    }

    const accept = request.headers.get("accept") || "";
    if (accept === "text/event-stream") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Stream formation analysis first
            const fConfig = (formationAgent as unknown as { config: { systemPrompt: string; temperature?: number; maxTokens?: number } }).config;
            const fPrompt = await formationAgent.buildPrompt({ message: `${homeTeam} vs ${awayTeam} tactical analysis`, matchData: { events, stats, homeTeam, awayTeam, formations } });

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: "📍 Formation analysis in progress...\n" })}\n\n`));

            let fFullContent = "";
            const fMessages: ChatCompletionMessageParam[] = [{ role: "user", content: fPrompt }];
            await generateStreamingResponse(fConfig.systemPrompt, fMessages, (token: string) => {
              fFullContent += token;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`));
            });

            // Then stream momentum analysis
            const mConfig = (momentumAgent as unknown as { config: { systemPrompt: string; temperature?: number; maxTokens?: number } }).config;
            const mPrompt = await momentumAgent.buildPrompt({ message: `${homeTeam} vs ${awayTeam} momentum analysis`, matchData: { events, stats, homeTeam, awayTeam } });

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: "\n📊 Momentum analysis in progress...\n" })}\n\n`));

            let mFullContent = "";
            const mMessages: ChatCompletionMessageParam[] = [{ role: "user", content: mPrompt }];
            await generateStreamingResponse(mConfig.systemPrompt, mMessages, (token: string) => {
              mFullContent += token;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`));
            });

            let fOutput: Record<string, unknown>;
            try { fOutput = JSON.parse(fFullContent); }
            catch { fOutput = { summary: fFullContent.slice(0, 500), reasoning: "Raw LLM response.", evidence: [], confidence: 50 }; }

            let mOutput: Record<string, unknown>;
            try { mOutput = JSON.parse(mFullContent); }
            catch { mOutput = { summary: mFullContent.slice(0, 500), reasoning: "Raw LLM response.", evidence: [], confidence: 50 }; }

            fOutput.confidence = normalizeConfidence(fOutput.confidence, 50);
            mOutput.confidence = normalizeConfidence(mOutput.confidence, 50);

            const tacticalResult = buildTacticalResult(fOutput, mOutput, events, stats, homeTeam, awayTeam, formations);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "result", output: tacticalResult })}\n\n`));
          } catch (err) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", error: String(err) })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    }

    const matchData = { events, stats, homeTeam, awayTeam, formations };

    const [formationResult, momentumResult] = await Promise.all([
      formationAgent.process({ message: `${homeTeam} vs ${awayTeam} tactical analysis`, matchData }),
      momentumAgent.process({ message: `${homeTeam} vs ${awayTeam} momentum analysis`, matchData }),
    ]);

    const fOutput = formationResult.output as Record<string, unknown>;
    const mOutput = momentumResult.output as Record<string, unknown>;

    const result = buildTacticalResult(
      fOutput, mOutput, events, stats, homeTeam, awayTeam, formations,
      formationResult.confidence, momentumResult.confidence,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tactical API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze tactical situation" },
      { status: 500 }
    );
  }
}

function findMomentumShifts(
  events: { minute: number; type: string; team: string; description: string }[],
  homeTeam: string,
  awayTeam: string
) {
  const points: { minute: number; description: string; impact: "high" | "medium" | "low"; team: "home" | "away" }[] = [];
  const highImpact = ["goal", "red-card", "missed-penalty"];

  for (const event of events) {
    if (highImpact.includes(event.type)) {
      points.push({
        minute: event.minute,
        description: event.description,
        impact: "high",
        team: event.team as "home" | "away",
      });
    }
  }

  return points;
}

function generateMomentumText(
  events: { minute: number; type: string; team: string; description: string }[],
  homeTeam: string,
  awayTeam: string
): string {
  const goals = events.filter((e) => e.type === "goal");
  if (goals.length === 0) return "No goals scored. Momentum remained relatively even throughout.";
  return `Momentum shifted at key moments including goal events at minutes ${goals.map((g) => g.minute).join(", ")}.`;
}

function findAdjustments(events: { type: string; description: string }[]): string[] {
  return events
    .filter((e) => e.type === "substitution")
    .map((e) => `Substitution: ${e.description}`);
}
