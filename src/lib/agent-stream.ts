/** Streaming helpers for agent API routes. */

import { generateStreamingResponse } from "@/lib/openrouter";
import type { BaseAgent } from "@/agents/base-agent";
import type { AgentInput, AgentOutput } from "../../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

function parseLLMOutput(raw: string, _fallbackMessage: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    /* fall through */
  }
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      /* fall through */
    }
  }
  const braceStart = raw.indexOf("{");
  if (braceStart >= 0) {
    const braceEnd = raw.lastIndexOf("}");
    if (braceEnd > braceStart) {
      try {
        return JSON.parse(raw.slice(braceStart, braceEnd + 1));
      } catch {
        /* fall through */
      }
    }
  }
  const trimmed = raw.slice(0, 2000);
  const hasJsonStructure = raw.includes("{") && raw.includes("}");
  return {
    summary: trimmed,
    reasoning: hasJsonStructure ? "The model returned incomplete JSON. Showing what was received:" : "The model response was not in the expected format. Showing raw output:",
    evidence: [trimmed],
    raw,
    confidence: 50,
  };
}

export function streamAgentResponse(
  agent: BaseAgent,
  input: AgentInput,
): Response {
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
        await generateStreamingResponse(
          config.systemPrompt,
          messages,
          pushToken,
        );

        const output = parseLLMOutput(fullContent, input.message);
        const rawConfidence = (output.confidence as number) ?? 70;
        const confidence = rawConfidence > 1 ? rawConfidence : Math.round(rawConfidence * 100);

        const result: AgentOutput = {
          agent: agent.name,
          output,
          confidence,
          reasoning: (output.reasoning as string) ?? "Analysis completed.",
          sources: [],
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "result", ...result })}\n\n`));
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: String(err) })}\n\n`)
        );
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
