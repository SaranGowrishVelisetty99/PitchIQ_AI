import { generateAIResponse } from "@/lib/openrouter";
import type { AgentName, AgentInput, AgentOutput } from "../../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface AgentConfig {
  name: AgentName;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  get name(): AgentName {
    return this.config.name;
  }

  abstract buildPrompt(input: AgentInput): Promise<string>;

  async process(input: AgentInput): Promise<AgentOutput> {
    const userPrompt = await this.buildPrompt(input);
    const messages: ChatCompletionMessageParam[] = [{ role: "user", content: userPrompt }];
    const raw = await generateAIResponse({
      systemPrompt: this.config.systemPrompt,
      messages,
      temperature: this.config.temperature ?? 0.3,
      maxTokens: this.config.maxTokens ?? 2000,
    });

    const output = parseLLMOutput(raw, input.message);

    const rawConfidence = (output.confidence as number) ?? 70;
    const confidence = rawConfidence > 1 ? rawConfidence : Math.round(rawConfidence * 100);

    return {
      agent: this.config.name,
      output,
      confidence,
      reasoning: (output.reasoning as string) ?? "Analysis completed.",
      sources: [],
    };
  }
}

function parseLLMOutput(raw: string, fallbackMessage: string): Record<string, unknown> {
  // Direct JSON parse
  try {
    return JSON.parse(raw);
  } catch {
    /* fall through */
  }

  // Extract JSON from markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      /* fall through */
    }
  }

  // Find first {…} or […] block
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

  // Fallback: show the raw text so the user still gets the content
  const trimmed = raw.slice(0, 2000);
  const hasJsonStructure = raw.includes("{") && raw.includes("}");
  return {
    summary: hasJsonStructure ? trimmed : trimmed,
    reasoning: hasJsonStructure ? "The model returned incomplete JSON. Showing what was received:" : "The model response was not in the expected format. Showing raw output:",
    evidence: [trimmed],
    raw,
    confidence: 50,
  };
}
