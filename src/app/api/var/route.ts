import { NextResponse } from "next/server";
import { VARAgent } from "@/agents/var-agent";
import { generateStreamingResponse } from "@/lib/openrouter";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { VARResult, AgentInput } from "../../../../types";

const agent = new VARAgent();

function normalizeConfidence(val: unknown, fallback: number): number {
  if (typeof val !== "number") return fallback;
  return val > 1 ? Math.round(val) : Math.round(val * 100);
}

function buildVARResult(output: Record<string, unknown>, type: string, description: string): VARResult {
  return {
    summary: (output.summary as string) ?? `Analysis of ${type} incident: ${description}`,
    reasoning: (output.reasoning as string) ?? "Based on FIFA Laws of the Game analysis.",
    evidence: (output.evidence as string[]) ?? ["FIFA Law applicable to this situation"],
    confidence: normalizeConfidence(output.confidence, 75),
    sources: [],
    fifaLaw: (output.fifaLaw as string) ?? (output.applicableLaws as Array<{ law: string }>)?.map((l: { law: string }) => l.law).join(", ") ?? "FIFA Law applicable",
    lawSection: (output.lawSection as string) ?? incidentTypeToSection(type),
    fanFriendly: (output.fanFriendly as string) ?? `This ${type} decision relates to ${description}. The referee applied the relevant FIFA Law.`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, description, context } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: "Incident type and description are required" },
        { status: 400 }
      );
    }

    const input: AgentInput = {
      message: description,
      incident: { type, description, context },
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

            const varResult = buildVARResult(output, type, description);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "result", output: varResult })}\n\n`));
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
    const varResult = buildVARResult(output, type, description);

    return NextResponse.json(varResult);
  } catch (error) {
    console.error("VAR API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze VAR decision" },
      { status: 500 }
    );
  }
}

function incidentTypeToSection(type: string): string {
  const map: Record<string, string> = {
    offside: "Law 11 - Offside Position",
    handball: "Law 12 - Fouls and Misconduct",
    penalty: "Law 14 - The Penalty Kick",
    "red-card": "Law 12 - Fouls and Misconduct",
    general: "FIFA Laws of the Game",
  };
  return map[type] || "FIFA Laws of the Game";
}
