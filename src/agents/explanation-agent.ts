import { BaseAgent } from "./base-agent";
import { EXPLANATION_SYSTEM, buildExplanationPrompt } from "@/lib/prompts";
import { retrieveAgentContext } from "@/lib/rag/retriever";
import type { AgentInput } from "../../types";

export class ExplanationAgent extends BaseAgent {
  constructor() {
    super({
      name: "explanation",
      systemPrompt: EXPLANATION_SYSTEM,
      temperature: 0.3,
      maxTokens: 1500,
    });
  }

  async buildPrompt(input: AgentInput): Promise<string> {
    const mode = input.expertiseLevel ?? "intermediate";

    let retrievedContext = "";
    try {
      const result = await retrieveAgentContext("explanation", input.message);
      retrievedContext = result.context;
    } catch {
      retrievedContext = "";
    }

    return buildExplanationPrompt(input.message, mode, retrievedContext);
  }
}
