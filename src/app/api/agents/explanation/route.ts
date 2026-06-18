import { NextResponse } from "next/server";
import { ExplanationAgent } from "@/agents/explanation-agent";
import { streamAgentResponse } from "@/lib/agent-stream";
import type { AgentInput } from "../../../../../types";

const agent = new ExplanationAgent();

export async function POST(request: Request) {
  try {
    const body: AgentInput = await request.json();
    const accept = request.headers.get("accept") || "";
    if (accept === "text/event-stream") return streamAgentResponse(agent, body);
    const result = await agent.process(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Explanation agent error:", error);
    return NextResponse.json({ error: "Explanation failed" }, { status: 500 });
  }
}
