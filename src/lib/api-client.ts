/** Unified API client — routes to Python backend or Next.js API routes. */

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function* streamResponse(
  path: string,
  body: unknown,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) yield data.content;
        } catch {
          // ignore parse errors on partial lines
        }
      }
    }
  }
}

export const api = {
  formation: (body: unknown) =>
    request("/api/agents/formation", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  momentum: (body: unknown) =>
    request("/api/agents/momentum", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  var: (body: unknown) =>
    request("/api/var", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  story: (body: unknown) =>
    request("/api/story", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  chat: (body: unknown) =>
    request("/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  tactical: (body: unknown) =>
    request("/api/tactical", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  explanation: (body: unknown) =>
    request("/api/agents/explanation", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  health: () => request("/health"),
  chatStream: (body: unknown, signal?: AbortSignal) =>
    streamResponse("/api/chat/stream", body, signal),
  orchestrateStream: (body: unknown, signal?: AbortSignal) =>
    streamResponse("/api/orchestrate/stream", body, signal),
};
