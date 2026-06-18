import { NextResponse } from "next/server";
import { generateAIResponse, generateStreamingResponse } from "@/lib/openrouter";
import { CHAT_SYSTEM, buildChatPrompt } from "@/lib/prompts";
import { retrieveRelevantContext } from "@/lib/rag/retriever";
import { detectRelevantAgents } from "@/lib/agent-registry";
import { searchRecentSoccerData } from "@/lib/web-search";
import type { ChatRequest, SourceCitation, ChatMessage } from "../../../../types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history, expertiseLevel = "intermediate", context } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const messageHistory: ChatCompletionMessageParam[] = history
      .slice(-10)
      .map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    let retrievedContext = "";
    let sources: SourceCitation[] = [];

    const effectiveContext = context || detectContext(message);
    const relevantAgents = detectRelevantAgents(message);

    for (const agentName of relevantAgents.slice(0, 2)) {
      const collectionName = agentName === "var" ? "fifaLaws" : agentName === "momentum" || agentName === "formation" ? "tacticalKnowledge" : "fifaLaws";
      try {
        const result = await retrieveRelevantContext(message, collectionName as "fifaLaws" | "tacticalKnowledge", 3);
        if (result.documents.length > 0) {
          retrievedContext += result.documents.join("\n\n---\n\n") + "\n\n";
          sources = [
            ...sources,
            ...result.documents.map((doc, i) => ({
              title: (result.metadatas[i]?.title as string) || "Knowledge Base",
              section: (result.metadatas[i]?.section as string) || "",
              similarity: result.distances[i] !== undefined ? 1 - result.distances[i] : 0,
              excerpt: doc.slice(0, 300),
            })),
          ];
        }
      } catch {
        // Graceful fallback
      }
    }

    let webContext = "";
    try {
      const webResult = await searchRecentSoccerData(message);
      if (webResult.context) {
        webContext = webResult.context;
        sources = [
          ...sources,
          ...webResult.sources.map((s) => ({
            title: s.title,
            section: `Source: ${s.url}`,
            similarity: 0,
            excerpt: "Live data via ESPN",
          })),
        ];
      }
    } catch {
      // graceful fallback
    }

    const currentMessage = buildChatPrompt(message, expertiseLevel, effectiveContext, retrievedContext, webContext);
    const allMessages: ChatCompletionMessageParam[] = [...messageHistory, { role: "user", content: currentMessage }];

    const streamRequested = request.headers.get("accept") === "text/event-stream";

    if (streamRequested) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let fullContent = "";
          await generateStreamingResponse(CHAT_SYSTEM, allMessages, (token) => {
            fullContent += token;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, sources, expertiseLevel, agents: relevantAgents })}\n\n`)
          );
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

    const raw = await generateAIResponse({
      systemPrompt: CHAT_SYSTEM,
      messages: allMessages,
      responseFormat: "text",
    });

    return NextResponse.json({
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      role: "assistant",
      content: raw,
      timestamp: new Date(),
      sources,
      expertiseLevel,
      agents: relevantAgents,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

function detectContext(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("offside") ||
    lower.includes("handball") ||
    lower.includes("penalty") ||
    lower.includes("red card") ||
    lower.includes("referee") ||
    lower.includes("fifa law") ||
    lower.includes("var")
  ) {
    return "var";
  }
  if (
    lower.includes("tactic") ||
    lower.includes("formation") ||
    lower.includes("pressing") ||
    lower.includes("momentum") ||
    lower.includes("substitution") ||
    lower.includes("transition")
  ) {
    return "tactical";
  }
  if (
    lower.includes("law") ||
    lower.includes("rule") ||
    lower.includes("regulation")
  ) {
    return "rules";
  }
  if (
    lower.includes("story") ||
    lower.includes("narrative") ||
    lower.includes("recap") ||
    lower.includes("what happened")
  ) {
    return "story";
  }
  return "general";
}
