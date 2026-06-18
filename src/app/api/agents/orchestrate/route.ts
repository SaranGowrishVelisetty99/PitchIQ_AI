import { NextResponse } from "next/server";
import { orchestrate } from "@/lib/orchestrator";
import type { OrchestratedResponse } from "../../../../../types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      matchData,
      incident,
      expertiseLevel = "intermediate",
      history = [],
      agents,
    } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const streamRequested = request.headers.get("accept") === "text/event-stream";

    if (streamRequested) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await orchestrate({
              message,
              matchData,
              incident,
              expertiseLevel,
              history,
              agents,
              stream: true,
              onToken: (token) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`));
              },
            });

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "result",
                  output: { combined: result.combined, agents: result.agents, sources: result.sources },
                })}\n\n`
              )
            );
          } catch (err) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Orchestration failed", details: String(err) })}\n\n`)
            );
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const result: OrchestratedResponse = await orchestrate({
      message,
      matchData,
      incident,
      expertiseLevel,
      history,
      agents,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Orchestration error:", error);
    return NextResponse.json({ error: "Failed to orchestrate agents" }, { status: 500 });
  }
}
