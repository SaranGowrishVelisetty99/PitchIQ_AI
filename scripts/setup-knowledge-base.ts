/**
 * PitchIQ AI - Knowledge Base Setup Script
 *
 * One-time setup that ingests all knowledge base data.
 * This uses the built-in fallback content (no PDFs required).
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. Run: npx tsx scripts/setup-knowledge-base.ts
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:3000
 *   - ChromaDB running (optional, gracefully falls back)
 */

const INGEST_API = "http://localhost:3000/api/ingest";

const COLLECTIONS: Record<string, { title: string; content: string }[]> = {
  fifaLaws: [
    { title: "Law 1 - The Field of Play", content: "The field of play must be rectangular and marked with lines. The longer boundary lines are called touchlines. The shorter boundary lines are called goal lines. The field of play is divided into two halves by a halfway line." },
    { title: "Law 11 - Offside", content: "A player is in an offside position if any part of the head, body or feet is in the opponents' half (excluding the halfway line) and any part of the head, body or feet is nearer to the opponents' goal line than both the ball and the second-last opponent." },
    { title: "Law 12 - Fouls and Misconduct", content: "Direct free kick offences include: kicking, tripping, jumping at, charging, striking, pushing, tackling an opponent, holding, spitting, deliberately handling the ball. Indirect free kick offences include: playing dangerously, impeding an opponent." },
    { title: "Law 14 - The Penalty Kick", content: "A penalty kick is awarded against a team that commits one of the ten direct free kick offences inside its own penalty area while the ball is in play. The ball must be placed on the penalty mark." },
    { title: "Law 5 - The Referee", content: "The referee has full authority to enforce the Laws of the Game. Decisions are made to the best of the referee's judgement according to the Laws. The referee may use VAR to review clear and obvious errors." },
    { title: "VAR Protocol", content: "The Video Assistant Referee (VAR) assists the referee by reviewing incidents using video footage. VAR may only review four types of decisions: goals, penalties, direct red cards, and mistaken identity." },
    { title: "Handball Law", content: "Handling the ball involves a deliberate act of a player making contact with the ball with their hand or arm. Criteria: movement of hand towards ball, distance, position of hand making body bigger." },
  ],
  tacticalKnowledge: [
    { title: "High Pressing", content: "High pressing is a tactical strategy where a team applies pressure on the opponent high up the pitch immediately after losing possession. The aim is to win the ball back quickly in dangerous areas. Requires coordinated movement and good physical conditioning." },
    { title: "Counter-Attacking", content: "Counter-attacking is a reactive strategy where a team quickly transitions from defence to attack after winning possession. Key principles: rapid forward passing, direct runs in behind the defence, exploiting spaces left by the attacking team." },
    { title: "Formation 4-4-2", content: "The 4-4-2 formation features four defenders, four midfielders, and two forwards. Provides defensive solidity with two banks of four. Wide midfielders provide attacking width. Can be vulnerable to three-man midfields." },
    { title: "Formation 4-3-3", content: "The 4-3-3 formation uses four defenders, three midfielders, and three forwards. Offers attacking width through the wide forwards. Three midfielders can control possession. Common in modern football." },
    { title: "Formation 4-2-3-1", content: "Features four defenders, two defensive midfielders, three attacking midfielders, and one striker. Double pivot protects the defence. Good balance between attack and defence." },
    { title: "Formation 3-5-2", content: "Uses three center-backs and two wing-backs. Strong central midfield presence. Wing-backs provide attacking width. Can transition to 5-3-2 defensively." },
    { title: "Momentum in Football", content: "Momentum refers to the psychological and tactical advantage one team gains during a match. Goals, red cards, tactical substitutions, and key saves can shift momentum. Often visible through changes in possession patterns and chance creation." },
    { title: "Pressing Triggers", content: "Specific situations that initiate a team's press: a bad pass from the opponent, playing backwards, receiving with back to goal, ball going into a specific zone. Teams use triggers to coordinate defensive pressure." },
    { title: "Defensive Blocks", content: "Low block: deep defending, compact, narrow. Mid-block: defending in middle third, pressing selectively. High block: pressing high up the pitch, high defensive line, aggressive." },
  ],
  coachingDocuments: [
    { title: "Defensive Organization", content: "Maintains compactness between lines, with the back four holding a consistent shape. Midfielders track runners. Communication and positioning are key. The offside trap requires coordinated movement." },
    { title: "Attacking Principles", content: "Width: stretching the defense. Depth: runners in behind. Mobility: interchanging positions. Penetration: passes through defense. Creativity: individual skill in final third." },
    { title: "Transition Phases", content: "Attacking transition: immediate forward passing after winning ball. Defensive transition: immediate pressure after losing ball, preventing counter-attacks." },
  ],
  refereeGuidelines: [
    { title: "Advantage Principle", content: "Allow play to continue when the fouled team benefits. If advantage does not materialize within 2-3 seconds, stop play and award original free kick." },
    { title: "Disciplinary Action", content: "Yellow card: caution for reckless challenges, dissent, time-wasting. Red card: serious foul play, violent conduct, deliberate handball denying goal, abusive language." },
    { title: "VAR Review Process", content: "VAR checks all four reviewable incidents. Referee can go to monitor for 'clear and obvious' review. Final decision always belongs to the referee." },
  ],
  formationPatterns: [
    { title: "4-3-3 Attacking Patterns", content: "Full-back overlaps provide width. Inside forwards cut in from wings. Midfield rotations create overloads. False nine drops deep to link play." },
    { title: "3-5-2 Attacking Patterns", content: "Wing-backs provide main width. Two strikers combine centrally. Overloads in midfield. Can target cross-field switches to wing-backs." },
    { title: "4-2-3-1 Attacking Patterns", content: "Attacking midfield three provide creativity. Full-backs provide width. Double pivot enables counter-pressing. Number 10 operates between lines." },
  ],
  momentumPatterns: [
    { title: "Goal Impact", content: "First goal typically shifts momentum by 15-20 minutes. Equalizer creates 10-15 minute pressure wave. Goals in quick succession (<5 min apart) compound momentum shifts." },
    { title: "Substitution Impact", content: "Attacking substitutions signal intent and can shift momentum. Impact typically visible within 5-10 minutes. Defensive substitutions often indicate protecting a lead." },
    { title: "Momentum Indicators", content: "Increased territory, higher pass completion rate, more touches in opposition box, consecutive corners, increased pressing intensity. All suggest momentum shift." },
  ],
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestCollection(
  collectionName: string,
  sections: { title: string; content: string }[]
) {
  console.log(`\n📚 Ingesting: ${collectionName} (${sections.length} sections)`);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    try {
      const res = await fetch(INGEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: section.content,
          collection: collectionName,
          metadata: {
            title: section.title,
            source: `setup-${collectionName}`,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`  ❌ [${i + 1}/${sections.length}] ${section.title}: ${err}`);
      } else {
        const data = await res.json();
        console.log(`  ✅ [${i + 1}/${sections.length}] ${section.title}`);
      }
    } catch (err) {
      console.error(`  ❌ [${i + 1}/${sections.length}] ${section.title}: Network error`);
    }

    await sleep(200);
  }
}

async function main() {
  console.log("🏁 PitchIQ AI - Knowledge Base Setup\n");
  console.log(`🌐 Ingest API: ${INGEST_API}\n`);

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    console.log("ℹ️  Using fallback embeddings (no API key required for ingestion)\n");
  }

  const collectionEntries = Object.entries(COLLECTIONS);
  for (const [name, sections] of collectionEntries) {
    await ingestCollection(name, sections);
    console.log();
  }

  console.log("✅ Knowledge base setup complete!\n");
  console.log("Your ChromaDB (if running) now contains knowledge in these collections:");
  for (const name of Object.keys(COLLECTIONS)) {
    console.log(`  • ${name}`);
  }
  console.log("\nRestart your dev server to use the updated knowledge base:");
  console.log("  npm run dev\n");
}

main().catch(console.error);
