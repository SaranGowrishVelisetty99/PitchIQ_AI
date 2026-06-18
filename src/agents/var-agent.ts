import { BaseAgent } from "./base-agent";
import { VAR_SYSTEM, buildVARPrompt } from "@/lib/prompts";
import { retrieveAgentContext } from "@/lib/rag/retriever";
import type { AgentInput } from "../../types";

export class VARAgent extends BaseAgent {
  constructor() {
    super({
      name: "var",
      systemPrompt: VAR_SYSTEM,
      temperature: 0.2,
    });
  }

  async buildPrompt(input: AgentInput): Promise<string> {
    const incidentType = input.incident?.type ?? "general";
    const description = input.incident?.description ?? input.message;
    const context = input.incident?.context;

    let retrievedRules = "";
    try {
      const result = await retrieveAgentContext("var", `${incidentType} ${description}`);
      retrievedRules = result.context;
    } catch {
      retrievedRules = "No specific rules retrieved.";
    }

    return buildVARPrompt(incidentType, description, context, retrievedRules);
  }
}
