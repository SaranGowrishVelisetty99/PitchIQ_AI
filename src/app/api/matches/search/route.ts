import { NextResponse } from "next/server";
import { getMatchesByYear } from "@/lib/match-fetcher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year } = body;

    if (!year || typeof year !== "number") {
      return NextResponse.json({ error: "Year is required as a number" }, { status: 400 });
    }

    const matches = await getMatchesByYear(year);

    if (matches.length === 0) {
      return NextResponse.json({ error: "No matches found for that year. Try a different year." }, { status: 404 });
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Match search error:", error);
    return NextResponse.json({ error: "Failed to search matches" }, { status: 500 });
  }
}
