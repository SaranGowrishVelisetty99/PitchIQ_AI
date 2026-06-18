import { ChromaClient, type Metadata } from "chromadb";
import { createEmbedding, simpleHashEmbedding } from "./embeddings";
import type { AgentName } from "../../../types";

const COLLECTIONS = {
  fifaLaws: "fifa-laws",
  tacticalKnowledge: "tactical-knowledge",
  coachingDocuments: "coaching-documents",
  refereeGuidelines: "referee-guidelines",
  formationPatterns: "formation-patterns",
  momentumPatterns: "momentum-patterns",
} as const;

const hashEmbeddingFn = {
  generate: async (texts: string[]): Promise<number[][]> => {
    return texts.map((t) => simpleHashEmbedding(t));
  },
};

let client: ChromaClient | null = null;
let chromaAvailable: boolean | null = null;

// Knowledge base mapping: agent -> relevant collections
const AGENT_COLLECTIONS: Record<AgentName, (keyof typeof COLLECTIONS)[]> = {
  formation: ["formationPatterns", "tacticalKnowledge"],
  momentum: ["momentumPatterns", "tacticalKnowledge"],
  var: ["fifaLaws", "refereeGuidelines"],
  story: ["tacticalKnowledge", "momentumPatterns", "formationPatterns"],
  explanation: ["tacticalKnowledge", "coachingDocuments", "fifaLaws"],
};

function getChromaUrl(): string {
  return process.env.CHROMA_DB_URL || "http://localhost:8000";
}

async function checkChromaHealth(): Promise<boolean> {
  if (chromaAvailable !== null) return chromaAvailable;
  if (!process.env.CHROMA_DB_URL) {
    chromaAvailable = false;
    return false;
  }
  const url = getChromaUrl().replace(/\/$/, "");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${url}/heartbeat`, { signal: controller.signal });
    clearTimeout(timeout);
    chromaAvailable = res.ok;
    return chromaAvailable;
  } catch {
    chromaAvailable = false;
    return false;
  }
}

function getClient(): ChromaClient {
  if (!client) {
    const url = new URL(getChromaUrl());
    client = new ChromaClient({
      host: url.hostname,
      port: parseInt(url.port, 10) || 8000,
      ssl: url.protocol === "https:",
    });
  }
  return client;
}

export type CollectionName = keyof typeof COLLECTIONS;

// --- JSON Knowledge Base Fallback ---
let kbCache: Record<string, { text: string; metadata: Record<string, unknown> }[]> | null = null;
let kbLoaded = false;

async function loadKnowledgeBase(): Promise<Record<string, { text: string; metadata: Record<string, unknown> }[]>> {
  if (kbLoaded) return kbCache ?? {};
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const kbPath = path.join(process.cwd(), "data", "knowledge-base.json");
    const data = await fs.readFile(kbPath, "utf-8");
    const parsed = JSON.parse(data);
    kbCache = parsed;
    console.log(`RAG: Loaded knowledge base with ${Object.keys(parsed).length} collections`);
  } catch {
    kbCache = {};
    console.log("RAG: No knowledge-base.json found, using ChromaDB only");
  }
  kbLoaded = true;
  return kbCache ?? {};
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

async function retrieveFromJsonKB(
  query: string,
  collectionName: CollectionName,
  topK: number
): Promise<{ documents: string[]; metadatas: Record<string, unknown>[]; distances: number[] }> {
  const kb = await loadKnowledgeBase();
  const collectionKey = COLLECTIONS[collectionName];
  const chunks = kb[collectionKey];

  if (!chunks || chunks.length === 0) {
    return { documents: [], metadatas: [], distances: [] };
  }

  const queryEmb = simpleHashEmbedding(query);

  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    metadata: chunk.metadata,
    score: cosineSimilarity(queryEmb, simpleHashEmbedding(chunk.text)),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);

  return {
    documents: top.map((t) => t.text),
    metadatas: top.map((t) => t.metadata),
    distances: top.map((t) => 1 - t.score),
  };
}

export async function retrieveRelevantContext(
  query: string,
  collectionName: CollectionName = "fifaLaws",
  topK = 5
): Promise<{ documents: string[]; metadatas: Record<string, unknown>[]; distances: number[] }> {
  try {
    if (await checkChromaHealth()) {
      const c = getClient();
      const collection = await c.getOrCreateCollection({
        name: COLLECTIONS[collectionName],
        embeddingFunction: hashEmbeddingFn,
      });

      const queryEmbedding = await createEmbedding(query);

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
      });

      const docs = (results.documents?.[0] || []).filter((d): d is string => d !== null);
      const metas = (results.metadatas?.[0] || []).filter((m): m is Metadata => m !== null);
      const dists = (results.distances?.[0] || []).filter((d): d is number => d !== null);

      return { documents: docs, metadatas: metas, distances: dists };
    }
  } catch (error) {
    chromaAvailable = false;
    console.error(`ChromaDB retrieval error (${collectionName}):`, error);
  }

  return retrieveFromJsonKB(query, collectionName, topK);
}

export async function retrieveMultiCollection(
  query: string,
  collections: CollectionName[],
  topK = 3
): Promise<{ documents: string[]; metadatas: Record<string, unknown>[]; distances: number[]; collection: CollectionName }[]> {
  const results = await Promise.all(
    collections.map(async (name) => {
      const result = await retrieveRelevantContext(query, name, topK);
      return { ...result, collection: name };
    })
  );
  return results.filter((r) => r.documents.length > 0);
}

/**
 * Retrieve context relevant to a specific agent.
 * Each agent has dedicated collections mapped in AGENT_COLLECTIONS.
 */
export async function retrieveAgentContext(
  agentName: AgentName,
  query: string,
  topK = 3
): Promise<{ context: string; sources: { title: string; excerpt: string }[] }> {
  const collections = AGENT_COLLECTIONS[agentName] ?? ["tacticalKnowledge"];
  const results = await retrieveMultiCollection(query, collections, topK);

  const contextParts: string[] = [];
  const sources: { title: string; excerpt: string }[] = [];

  for (const result of results) {
    for (let i = 0; i < result.documents.length; i++) {
      const doc = result.documents[i];
      const meta = result.metadatas[i] ?? {};
      contextParts.push(doc);
      sources.push({
        title: (meta.source as string) ?? COLLECTIONS[result.collection],
        excerpt: doc.slice(0, 300),
      });
    }
  }

  return {
    context: contextParts.join("\n\n---\n\n"),
    sources,
  };
}

export async function storeChunks(
  collectionName: CollectionName,
  chunks: { text: string; metadata: Record<string, unknown> }[]
) {
  try {
    if (!(await checkChromaHealth())) {
      return { success: false, error: new Error("ChromaDB not available") };
    }
    const c = getClient();
    const collection = await c.getOrCreateCollection({
      name: COLLECTIONS[collectionName],
      embeddingFunction: hashEmbeddingFn,
    });

    const ids = chunks.map((_, i) => `${collectionName}-${Date.now()}-${i}`);
    const texts = chunks.map((c) => c.text);
    const metadatas: Metadata[] = chunks.map((c) => c.metadata as Metadata);
    const embeddings = await Promise.all(texts.map((t) => createEmbedding(t)));

    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents: texts,
    });

    return { success: true, count: chunks.length };
  } catch (error) {
    console.error(`ChromaDB store error (${collectionName}):`, error);
    return { success: false, error };
  }
}

export async function getCollectionStats(collectionName: CollectionName) {
  try {
    if (await checkChromaHealth()) {
      const c = getClient();
      const collection = await c.getOrCreateCollection({
        name: COLLECTIONS[collectionName],
        embeddingFunction: hashEmbeddingFn,
      });
      const count = await collection.count();
      return { count, name: COLLECTIONS[collectionName] };
    }
  } catch {
    // fall through to JSON KB
  }
  const kb = await loadKnowledgeBase();
  const collectionKey = COLLECTIONS[collectionName];
  const chunks = kb[collectionKey];
  return { count: chunks?.length ?? 0, name: COLLECTIONS[collectionName] };
}

export async function getAllCollectionsStats() {
  const names = Object.keys(COLLECTIONS) as CollectionName[];
  const stats = await Promise.all(names.map((n) => getCollectionStats(n)));
  return Object.fromEntries(stats.map((s) => [s.name, s]));
}
