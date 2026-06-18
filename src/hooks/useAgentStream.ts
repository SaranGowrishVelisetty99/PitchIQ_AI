"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMatch } from "@/contexts/MatchContext";
import type { AgentName } from "../../types";

interface UseAgentStreamOptions {
  cacheKey: string;
  agentName: AgentName;
  endpoint: string;
  buildBody: (args: {
    homeTeam: string;
    awayTeam: string;
    homeFormation: string;
    awayFormation: string;
    events: Record<string, unknown>[];
    stats: Record<string, unknown>;
  }) => Record<string, unknown>;
}

export function useAgentStream(options: UseAgentStreamOptions) {
  const { homeTeam, awayTeam, homeFormation, awayFormation, events, stats, analysisResults, setAnalysisResult } = useMatch();
  const [result, setResult] = useState<unknown>(() => analysisResults[options.cacheKey]?.result ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState(() => analysisResults[options.cacheKey]?.streamText ?? "");
  const streamRef = useRef(false);
  const cacheKey = options.cacheKey;

  useEffect(() => {
    const cached = analysisResults[cacheKey];
    if (cached) {
      setResult(cached.result);
      setStreamText(cached.streamText);
    } else {
      setResult(null);
      setStreamText("");
    }
  }, [cacheKey, analysisResults]);

  const analyze = useCallback(async () => {
    if (streamRef.current) return;
    streamRef.current = true;
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamText("");

    try {
      const body = options.buildBody({
        homeTeam,
        awayTeam,
        homeFormation,
        awayFormation,
        events: events as unknown as Record<string, unknown>[],
        stats: stats as unknown as Record<string, unknown>,
      });

      const res = await fetch(options.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "token") {
              setStreamText((prev) => prev + data.content);
            } else if (data.type === "result") {
              setResult(data.output);
              setStreamText("");
            } else if (data.type === "error") {
              setError(data.error || "Analysis failed");
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
      streamRef.current = false;
    }
  }, [homeTeam, awayTeam, homeFormation, awayFormation, events, stats, options.endpoint, options.buildBody]);

  useEffect(() => {
    if (result && !loading && !streamText) {
      setAnalysisResult(cacheKey, { result, streamText: "" });
    }
  }, [result, loading, streamText, cacheKey, setAnalysisResult]);

  useEffect(() => {
    if (streamText && !loading && !result) {
      setAnalysisResult(cacheKey, { result: null, streamText });
    }
  }, [streamText, loading, result, cacheKey, setAnalysisResult]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setStreamText("");
    setLoading(false);
    streamRef.current = false;
    setAnalysisResult(cacheKey, null);
  }, [cacheKey, setAnalysisResult]);

  return { result, loading, error, streamText, analyze, reset };
}
