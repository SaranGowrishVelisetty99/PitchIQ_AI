import { retrieveRelevantContext, storeChunks, type CollectionName } from "./retriever";
import type { SourceCitation } from "../../../types";

export async function retrieveVARContext(
  incidentType: string,
  description: string
): Promise<{ context: string; sources: SourceCitation[] }> {
  const query = `${incidentType} ${description}`;
  const result = await retrieveRelevantContext(query, "fifaLaws", 5);

  const sources: SourceCitation[] = result.documents.map((doc, i) => ({
    title: (result.metadatas[i]?.title as string) || "FIFA Law",
    section: (result.metadatas[i]?.section as string) || "",
    similarity: result.distances[i] !== undefined ? 1 - result.distances[i] : 0,
    excerpt: doc.slice(0, 300),
  }));

  return {
    context: result.documents.join("\n\n---\n\n"),
    sources,
  };
}

export async function retrieveTacticalContext(
  events: string
): Promise<{ context: string; sources: SourceCitation[] }> {
  const result = await retrieveRelevantContext(events, "tacticalKnowledge", 4);

  const sources: SourceCitation[] = result.documents.map((doc, i) => ({
    title: (result.metadatas[i]?.title as string) || "Tactical Concept",
    section: (result.metadatas[i]?.section as string) || "",
    similarity: result.distances[i] !== undefined ? 1 - result.distances[i] : 0,
    excerpt: doc.slice(0, 300),
  }));

  return {
    context: result.documents.join("\n\n---\n\n"),
    sources,
  };
}

export async function ingestTextChunks(
  collection: CollectionName,
  chunks: { text: string; metadata: Record<string, unknown> }[]
) {
  return storeChunks(collection, chunks);
}

export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100
): { text: string; metadata: Record<string, unknown> }[] {
  const words = text.split(/\s+/);
  const chunks: { text: string; metadata: Record<string, unknown> }[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) {
      chunks.push({
        text: chunk,
        metadata: {
          index: chunks.length,
          wordCount: chunk.split(/\s+/).length,
        },
      });
    }
  }

  return chunks;
}
