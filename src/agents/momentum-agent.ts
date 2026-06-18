import { BaseAgent } from "./base-agent";
import { MOMENTUM_SYSTEM, buildMomentumPrompt } from "@/lib/prompts";
import { retrieveAgentContext } from "@/lib/rag/retriever";
import type { AgentInput } from "../../types";

export class MomentumAgent extends BaseAgent {
  constructor() {
    super({
      name: "momentum",
      systemPrompt: MOMENTUM_SYSTEM,
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
      ? `Possession: ${s.possession?.home ?? "?"}%-${s.possession?.away ?? "?"}% | Shots: ${s.shots?.home ?? "?"}-${s.shots?.away ?? "?"} | Shots on Target: ${s.shotsOnTarget?.home ?? "?"}-${s.shotsOnTarget?.away ?? "?"}`
      : "No statistics provided";

    let retrievedContext = "";
    try {
      const result = await retrieveAgentContext("momentum", eventsStr);
      retrievedContext = result.context;
    } catch {
      retrievedContext = "";
    }

    return buildMomentumPrompt(eventsStr, statsStr, md?.homeTeam ?? "Home", md?.awayTeam ?? "Away", retrievedContext);
  }
}
