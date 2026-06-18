import { BaseAgent } from "./base-agent";
import { STORY_SYSTEM, buildStoryPrompt } from "@/lib/prompts";
import { retrieveAgentContext } from "@/lib/rag/retriever";
import type { AgentInput } from "../../types";

export class StoryAgent extends BaseAgent {
  constructor() {
    super({
      name: "story",
      systemPrompt: STORY_SYSTEM,
      temperature: 0.4,
      maxTokens: 2500,
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
      ? `Possession: ${s.possession?.home ?? "?"}%-${s.possession?.away ?? "?"}% | Shots: ${s.shots?.home ?? "?"}-${s.shots?.away ?? "?"} | Corners: ${s.corners?.home ?? "?"}-${s.corners?.away ?? "?"}`
      : "No statistics provided";

    let retrievedContext = "";
    try {
      const result = await retrieveAgentContext("story", eventsStr);
      retrievedContext = result.context;
    } catch {
      retrievedContext = "";
    }

    return buildStoryPrompt(eventsStr, statsStr, md?.homeTeam ?? "Home", md?.awayTeam ?? "Away", "", "", retrievedContext);
  }
}
