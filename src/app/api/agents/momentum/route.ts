import { NextResponse } from "next/server";
import { MomentumAgent } from "@/agents/momentum-agent";
import { streamAgentResponse } from "@/lib/agent-stream";
import type { AgentInput } from "../../../../../types";

const agent = new MomentumAgent();

export async function POST(request: Request) {
  try {
    const body: AgentInput = await request.json();
    const accept = request.headers.get("accept") || "";
    if (accept === "text/event-stream") return streamAgentResponse(agent, body);
    const result = await agent.process(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Momentum agent error:", error);
    return NextResponse.json({ error: "Momentum analysis failed" }, { status: 500 });
  }
}
