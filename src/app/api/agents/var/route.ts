import { NextResponse } from "next/server";
import { VARAgent } from "@/agents/var-agent";
import { streamAgentResponse } from "@/lib/agent-stream";
import type { AgentInput } from "../../../../../types";

const agent = new VARAgent();

export async function POST(request: Request) {
  try {
    const body: AgentInput = await request.json();
    const accept = request.headers.get("accept") || "";
    if (accept === "text/event-stream") return streamAgentResponse(agent, body);
    const result = await agent.process(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("VAR agent error:", error);
    return NextResponse.json({ error: "VAR analysis failed" }, { status: 500 });
  }
}
