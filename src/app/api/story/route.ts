import { NextResponse } from "next/server";
import { StoryAgent } from "@/agents/story-agent";
import { generateStreamingResponse } from "@/lib/openrouter";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { StoryResult, AgentInput } from "../../../../types";

function normalizeConfidence(val: unknown, fallback: number): number {
  if (typeof val !== "number") return fallback;
  return val > 1 ? Math.round(val) : Math.round(val * 100);
}

const agent = new StoryAgent();

function buildStoryResult(output: Record<string, unknown>, events: { type: string }[], homeTeam: string, awayTeam: string, sources?: { title: string; section: string; similarity: number; excerpt: string }[]): StoryResult {
  const chapters = (output.chapters as Array<{ title: string; content: string; minuteRange: string; emotion: string }>) ?? [];
  const keyMoments = (output.keyMoments as Array<{ minute: number; description: string; significance: string }>) ?? [];
  const goals = events.filter((e) => e.type === "goal");

  const storyResult: StoryResult = {
    summary: (output.summary as string) ?? `${homeTeam} vs ${awayTeam} match story`,
    reasoning: (output.reasoning as string) ?? `Generated narrative from ${events.length} match events.`,
    evidence: (output.evidence as string[]) ?? [`Match featured ${goals.length} goals`],
    confidence: normalizeConfidence(output.confidence, 78),
    sources: sources ?? [],
    narrative: (output.narrative as string) ?? `${homeTeam} faced ${awayTeam} in a compelling encounter.`,
    sections: chapters.map((ch) => ({
      title: ch.title,
      content: ch.content,
      minuteRange: ch.minuteRange,
    })),
    keyMoments: keyMoments.map((km) => ({
      minute: km.minute,
      description: km.description,
      impact: "high" as const,
      team: "home" as const,
    })),
  };

  if (storyResult.sections.length === 0) {
    storyResult.sections = generateDefaultSections(events as { minute: number; type: string; team: string; player?: string; description: string }[], output as Record<string, unknown> & { possession: { home: number; away: number }; shots: { home: number; away: number } }, homeTeam, awayTeam);
  }

  return storyResult;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { events, stats, homeTeam, awayTeam } = body;

    if (!events || !stats) {
      return NextResponse.json(
        { error: "Match events and statistics are required" },
        { status: 400 }
      );
    }

    const input: AgentInput = {
      message: `Generate story for ${homeTeam} vs ${awayTeam}`,
      matchData: { events, stats, homeTeam, awayTeam },
    };

    const accept = request.headers.get("accept") || "";
    if (accept === "text/event-stream") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const userPrompt = await agent.buildPrompt(input);
            const config = (agent as unknown as { config: { systemPrompt: string; temperature?: number; maxTokens?: number } }).config;

            let fullContent = "";
            const pushToken = (token: string) => {
              fullContent += token;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`));
            };

            const messages: ChatCompletionMessageParam[] = [{ role: "user", content: userPrompt }];
            await generateStreamingResponse(config.systemPrompt, messages, pushToken);

            let output: Record<string, unknown>;
            try { output = JSON.parse(fullContent); }
            catch { output = { summary: fullContent.slice(0, 500), reasoning: "Raw LLM response.", evidence: [], confidence: 50 }; }

            const storyResult = buildStoryResult(output, events, homeTeam, awayTeam);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "result", output: storyResult })}\n\n`));
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

    const result = await agent.process(input);
    const output = result.output as Record<string, unknown>;
    const storyResult = buildStoryResult(output, events, homeTeam, awayTeam, result.sources);

    return NextResponse.json(storyResult);
  } catch (error) {
    console.error("Story API error:", error);
    return NextResponse.json(
      { error: "Failed to generate match story" },
      { status: 500 }
    );
  }
}

function generateDefaultSections(
  events: { minute: number; type: string; team: string; player?: string; description: string }[],
  stats: { possession: { home: number; away: number }; shots: { home: number; away: number } },
  homeTeam: string,
  awayTeam: string
) {
  const goals = events.filter((e) => e.type === "goal");
  return [
    {
      title: "First Half",
      content: `${homeTeam} started with ${stats.possession.home}% possession against ${awayTeam}'s ${stats.possession.away}%.`,
      minuteRange: "0'-45'",
    },
    {
      title: "Second Half Action",
      content: goals.length > 0
        ? `${goals.filter((g) => g.team === "home").length} goals for ${homeTeam}, ${goals.filter((g) => g.team === "away").length} for ${awayTeam}.`
        : "Neither side could find the breakthrough.",
      minuteRange: "45'-90'",
    },
  ];
}
