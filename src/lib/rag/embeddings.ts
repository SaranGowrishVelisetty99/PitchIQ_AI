export async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    return simpleHashEmbedding(text);
  }

  try {
    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}/embeddings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: text,
        }),
      }
    );

    if (!response.ok) {
      return simpleHashEmbedding(text);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || simpleHashEmbedding(text);
  } catch {
    return simpleHashEmbedding(text);
  }
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    return texts.map((t) => simpleHashEmbedding(t));
  }

  try {
    const response = await fetch(
      `${process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"}/embeddings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: texts,
        }),
      }
    );

    if (!response.ok) {
      return texts.map((t) => simpleHashEmbedding(t));
    }

    const data = await response.json();
    return data.data?.map((d: { embedding: number[] }) => d.embedding) || texts.map((t) => simpleHashEmbedding(t));
  } catch {
    return texts.map((t) => simpleHashEmbedding(t));
  }
}

export function simpleHashEmbedding(text: string): number[] {
  const dims = 384;
  const embedding = new Array(dims).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dims;
    embedding[idx] += 1 / words.length;
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dims; i++) embedding[i] /= magnitude;
  }
  return embedding;
}
