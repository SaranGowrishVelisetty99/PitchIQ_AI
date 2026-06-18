import { getAgent, detectRelevantAgents } from "./agent-registry";
import { generateAIResponse, generateStreamingResponse } from "./openrouter";
import { CHAT_SYSTEM, buildChatPrompt } from "./prompts";
import { retrieveAgentContext } from "@/lib/rag/retriever";
import { ExplanationAgent } from "@/agents/explanation-agent";
import type { AgentName, AgentInput, AgentOutput, OrchestratedResponse, SourceCitation, ExpertiseLevel, ChatMessage } from "../../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface OrchestrateParams {
  message: string;
  matchData?: AgentInput["matchData"];
  incident?: AgentInput["incident"];
  expertiseLevel?: ExpertiseLevel;
  history?: AgentInput["history"];
  agents?: AgentName[];
  stream?: boolean;
  onToken?: (token: string) => void;
}

export async function orchestrate(params: OrchestrateParams): Promise<OrchestratedResponse> {
  const {
    message,
    matchData,
    incident,
    expertiseLevel = "intermediate",
    history = [],
    agents: selectedAgents,
  } = params;

  const agentNames = selectedAgents ?? detectRelevantAgents(message);
  const agentOutputs: AgentOutput[] = [];
  let relevantContext = "";
  let sources: SourceCitation[] = [];

  try {
    const primaryAgent = agentNames[0] ?? "formation";
    const result = await retrieveAgentContext(primaryAgent, message, 4);
    relevantContext = result.context;
    sources = result.sources.map((s) => ({
      title: s.title,
      section: "",
      similarity: 0,
      excerpt: s.excerpt,
    }));
  } catch {
    relevantContext = "";
  }

  for (const name of agentNames) {
    try {
      const agent = getAgent(name);
      const output = await agent.process({
        message,
        matchData,
        incident,
        expertiseLevel,
        history,
      });
      agentOutputs.push(output);
    } catch (err) {
      console.error(`Agent ${name} error:`, err);
      agentOutputs.push({
        agent: name,
        output: { summary: `${name} analysis could not be completed.` },
        confidence: 0,
        reasoning: "Agent processing failed.",
        sources: [],
      });
    }
  }

  if (agentNames.length > 0 && !agentNames.includes("explanation")) {
    try {
      const explanationAgent = new ExplanationAgent();
      const combinedOutput = agentOutputs.map((o) => JSON.stringify(o.output)).join("\n");
      const explained = await explanationAgent.process({
        message: combinedOutput,
        expertiseLevel,
      });
      agentOutputs.push(explained);
    } catch {
      // Explanation optional
    }
  }

  const combinedContext = [relevantContext, ...agentOutputs.map((o) => JSON.stringify(o.output))].filter(Boolean).join("\n\n");

  const messageHistory: ChatCompletionMessageParam[] = history
    .slice(-10)
    .map((m: ChatMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const currentMessage = buildChatPrompt(message, expertiseLevel, agentNames.join(","), combinedContext);
  const allMessages: ChatCompletionMessageParam[] = [...messageHistory, { role: "user", content: currentMessage }];

  let combinedResponse: string;
  if (params.stream && params.onToken) {
    let fullContent = "";
    await generateStreamingResponse(CHAT_SYSTEM, allMessages, (token) => {
      fullContent += token;
      params.onToken!(token);
    });
    combinedResponse = fullContent;
  } else {
    combinedResponse = await generateAIResponse({
      systemPrompt: CHAT_SYSTEM,
      messages: allMessages,
      responseFormat: "text",
    });
  }

  return {
    query: message,
    primaryAgent: agentNames[0] ?? "formation",
    agents: agentOutputs,
    combined: combinedResponse,
    sources,
  };
}
