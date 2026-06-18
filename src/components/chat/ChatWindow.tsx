"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MatchButton } from "@/components/design-system/MatchButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MessageBubble } from "./MessageBubble";
import { AgentIndicator } from "./AgentIndicator";
import { ExpertiseSelector } from "./ExpertiseSelector";
import { MatchContextChips } from "@/components/match/MatchContextChips";
import { Send } from "lucide-react";
import Image from "next/image";
import type { ChatMessage, ExpertiseLevel, AgentName } from "../../../types";
import { generateId, cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Explain offside in simple terms",
  "Formation analysis of both teams",
  "Key momentum shifts in this match",
  "Simplified recap for a child",
];

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to PitchIQ AI Chat! I'm powered by five specialized AI agents: Formation Analyst, Momentum Analyst, VAR Expert, Storyteller, and Explanator. What would you like to know about soccer?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeAgents, setActiveAgents] = useState<AgentName[]>([]);
  const [expertise, setExpertise] = useState<ExpertiseLevel>("intermediate");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    async (message: string) => {
      if (!message.trim() || loading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoading(true);
      setStreamingContent("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message,
            history: messages.slice(-20),
            expertiseLevel: expertise,
          }),
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";
        let sources: unknown[] = [];
        let agents: AgentName[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                fullContent += data.token;
                setStreamingContent(fullContent);
              }
              if (data.sources) sources = data.sources;
              if (data.agents) {
                agents = data.agents;
                setActiveAgents(data.agents);
              }
              if (data.done) {
                const assistantMessage: ChatMessage = {
                  id: generateId(),
                  role: "assistant",
                  content: fullContent || "I'm not sure how to respond to that. Could you rephrase?",
                  timestamp: new Date(),
                  sources: sources as ChatMessage["sources"],
                  expertiseLevel: expertise,
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingContent("");
              }
            } catch {
              // skip malformed data
            }
          }
        }
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
          confidence: 0,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setLoading(false);
        setStreamingContent("");
      }
    },
    [messages, loading, expertise]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4">
      {/* Header */}
      <div className="shrink-0 py-3 flex items-center justify-between border-b border-pitch-700 bg-pitch-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-home to-away shadow-sm">
              <Image
                src="/PitchIQ_logo.png"
                alt="PitchIQ AI"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary leading-tight">PitchIQ AI Chat</h1>
              <p className="text-[11px] text-text-tertiary">Five specialized soccer agents</p>
            </div>
          </div>
          {activeAgents.length > 0 && (
            <AgentIndicator agents={activeAgents} />
          )}
        </div>
        <ExpertiseSelector value={expertise} onChange={setExpertise} />
      </div>

      {/* Match context */}
      <div className="shrink-0 pt-2 pb-1">
        <MatchContextChips onSelectContext={(ctx) => {
          setInput(`Analyze the ${ctx} for this match. `);
          textareaRef.current?.focus();
        }} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="space-y-3 py-4 px-0.5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {streamingContent && (
            <MessageBubble
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingContent,
                timestamp: new Date(),
              }}
              isStreaming
            />
          )}
          {loading && !streamingContent && (
            <div className="flex justify-center py-8">
              <div className="bg-pitch-800/80 rounded-xl px-6 py-4 border border-pitch-700 shadow-lg">
                <LoadingSpinner text="Consulting PitchIQ agents..." />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 pb-3 pt-2">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="text-xs px-3.5 py-2 rounded-full border border-pitch-700 text-text-secondary bg-pitch-800 hover:bg-gold-500 hover:text-black hover:border-gold-500 shadow-sm transition-all duration-200 animate-fadeInUp"
                style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <div className="relative flex items-end gap-2 bg-pitch-800/80 border border-pitch-700 rounded-2xl px-4 py-3 focus-within:border-gold-500/50 focus-within:ring-1 focus-within:ring-gold-500/20 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about formations, momentum, VAR, or match stories..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary resize-none outline-none max-h-[200px] leading-relaxed"
          />
          <MatchButton
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl transition-all duration-200",
              input.trim()
                ? "bg-gold-600 hover:bg-gold-500 text-black shadow-lg shadow-gold-500/25"
                : "bg-pitch-700 text-text-tertiary"
            )}
          >
            <Send className="h-4 w-4" />
          </MatchButton>
        </div>
        <p className="text-[11px] text-text-tertiary text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
