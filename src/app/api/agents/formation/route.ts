import { NextResponse } from "next/server";
import { FormationAgent } from "@/agents/formation-agent";
import { streamAgentResponse } from "@/lib/agent-stream";
import type { AgentInput } from "../../../../../types";

const agent = new FormationAgent();

export async function POST(request: Request) {
  try {
    const body: AgentInput = await request.json();
    const accept = request.headers.get("accept") || "";

    if (accept === "text/event-stream") {
      return streamAgentResponse(agent, body);
    }

    const result = await agent.process(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Formation agent error:", error);
    return NextResponse.json({ error: "Formation analysis failed" }, { status: 500 });
  }
}
