import { NextResponse } from "next/server";
import { getMatchDetails } from "@/lib/match-fetcher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Match id is required" }, { status: 400 });
    }

    const match = await getMatchDetails(id);

    if (!match) {
      return NextResponse.json({ error: "Failed to fetch match details" }, { status: 500 });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Match fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch match details" }, { status: 500 });
  }
}
