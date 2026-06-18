import { NextResponse } from "next/server";
import { storeChunks, getCollectionStats, getAllCollectionsStats } from "@/lib/rag/retriever";
import { chunkText } from "@/lib/rag/ingest";
import type { CollectionName } from "@/lib/rag/retriever";

const VALID_COLLECTIONS: CollectionName[] = [
  "fifaLaws",
  "tacticalKnowledge",
  "coachingDocuments",
  "refereeGuidelines",
  "formationPatterns",
  "momentumPatterns",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, collection, metadata } = body;

    if (!text || !collection) {
      return NextResponse.json(
        { error: "Text and collection name are required" },
        { status: 400 }
      );
    }

    if (!VALID_COLLECTIONS.includes(collection as CollectionName)) {
      return NextResponse.json(
        { error: `Collection must be one of: ${VALID_COLLECTIONS.join(", ")}` },
        { status: 400 }
      );
    }

    const chunks = chunkText(text).map((chunk) => ({
      ...chunk,
      metadata: { ...chunk.metadata, ...metadata },
    }));

    const result = await storeChunks(collection as CollectionName, chunks);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ingest API error:", error);
    return NextResponse.json(
      { error: "Failed to ingest text" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const stats = await getAllCollectionsStats();
  return NextResponse.json({ collections: stats });
}
