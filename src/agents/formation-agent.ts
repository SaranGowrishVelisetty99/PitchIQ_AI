import { BaseAgent } from "./base-agent";
import { FORMATION_SYSTEM, buildFormationPrompt } from "@/lib/prompts";
import { retrieveAgentContext } from "@/lib/rag/retriever";
import type { AgentInput } from "../../types";

export class FormationAgent extends BaseAgent {
  constructor() {
    super({
      name: "formation",
      systemPrompt: FORMATION_SYSTEM,
      temperature: 0.3,
      maxTokens: 3000,
    });
  }

  async buildPrompt(input: AgentInput): Promise<string> {
    const md = input.matchData;
    const eventsStr = md?.events
      ? md.events
          .map(
            (e) =>
              `${e.minute}' - ${e.team === "home" ? md.homeTeam : md.awayTeam} ${e.type}: ${e.player ? e.player + " - " : ""}${e.description}`
          )
          .join("\n")
      : input.message;

    const s = md?.stats;
    const statsStr = s
      ? `Possession: ${s.possession?.home ?? "?"}%-${s.possession?.away ?? "?"}% | Shots: ${s.shots?.home ?? "?"}-${s.shots?.away ?? "?"} | Passes: ${s.passes?.home ?? "?"}-${s.passes?.away ?? "?"}`
      : "No statistics provided";

    let retrievedContext = "";
    try {
      const result = await retrieveAgentContext("formation", eventsStr);
      retrievedContext = result.context;
    } catch {
      retrievedContext = "";
    }

    return buildFormationPrompt(
      eventsStr,
      md?.homeTeam ?? "Home",
      md?.awayTeam ?? "Away",
      md?.formations,
      statsStr,
      retrievedContext
    );
  }
}
