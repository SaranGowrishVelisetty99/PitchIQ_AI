import { FormationAgent } from "@/agents/formation-agent";
import { MomentumAgent } from "@/agents/momentum-agent";
import { VARAgent } from "@/agents/var-agent";
import { StoryAgent } from "@/agents/story-agent";
import { ExplanationAgent } from "@/agents/explanation-agent";
import type { AgentName } from "../../types";

const agents = {
  formation: new FormationAgent(),
  momentum: new MomentumAgent(),
  var: new VARAgent(),
  story: new StoryAgent(),
  explanation: new ExplanationAgent(),
} as const;

export function getAgent(name: AgentName) {
  return agents[name];
}

export function getAllAgents() {
  return Object.values(agents);
}

export function getAgentNames(): AgentName[] {
  return Object.keys(agents) as AgentName[];
}

export function detectRelevantAgents(message: string): AgentName[] {
  const lower = message.toLowerCase();

  const formationKeywords = ["formation", "tactic", "pressing", "defensive block", "attacking pattern", "shape", "4-3-3", "4-4-2", "3-5-2", "lineup", "position"];
  const momentumKeywords = ["momentum", "shift", "turning point", "dominant", "pressure", "phase", "comeback", "control"];
  const varKeywords = ["offside", "handball", "penalty", "red card", "foul", "var", "referee", "fifa law", "rule", "decision"];
  const storyKeywords = ["story", "narrative", "tale", "chapter", "drama", "summary of the match", "what happened", "recap"];

  const matched: AgentName[] = [];

  if (formationKeywords.some((k) => lower.includes(k))) matched.push("formation");
  if (momentumKeywords.some((k) => lower.includes(k))) matched.push("momentum");
  if (varKeywords.some((k) => lower.includes(k))) matched.push("var");
  if (storyKeywords.some((k) => lower.includes(k))) matched.push("story");

  if (matched.length === 0) matched.push("formation", "momentum");

  return matched;
}
