/**
 * FIFA Knowledge Base Ingestion Script
 * 
 * Usage:
 *   npx tsx scripts/ingest-fifa.ts
 * 
 * Prerequisites:
 *   - Download FIFA Laws of the Game PDF to data/fifa-laws.pdf
 *   - Download tactical guide to data/tactical-guide.pdf
 *   - Have ChromaDB running (docker run -p 8000:8000 chromadb/chroma)
 *   - Set OPENROUTER_API_KEY in .env.local
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const INGEST_API = "http://localhost:3000/api/ingest";

interface Document {
  filename: string;
  collection: "fifaLaws" | "tacticalKnowledge";
  sections: { title: string; content: string }[];
}

const DOCUMENTS: Record<string, Document> = {
  "fifa-laws": {
    filename: "fifa-laws.txt",
    collection: "fifaLaws",
    sections: [
      {
        title: "Law 1 - The Field of Play",
        content: `The field of play must be rectangular and marked with lines. The longer boundary lines are called touchlines. The shorter boundary lines are called goal lines. The field of play is divided into two halves by a halfway line. The centre mark is at the midpoint of the halfway line.`,
      },
      {
        title: "Law 11 - Offside",
        content: `A player is in an offside position if any part of the head, body or feet is in the opponents' half (excluding the halfway line) and any part of the head, body or feet is nearer to the opponents' goal line than both the ball and the second-last opponent. A player is not in an offside position if level with the second-last opponent or level with the last two opponents. Offside is penalised when a player in an offside position at the moment the ball is played or touched by a teammate becomes actively involved in play.`,
      },
      {
        title: "Law 12 - Fouls and Misconduct",
        content: `Direct free kick offences include: kicking, tripping, jumping at, charging, striking, pushing, tackling an opponent, holding, spitting, deliberately handling the ball. Indirect free kick offences include: playing dangerously, impeding an opponent, preventing the goalkeeper from releasing the ball. A direct free kick is awarded if a player commits any of these offences in a careless, reckless or excessive manner.`,
      },
      {
        title: "Law 14 - The Penalty Kick",
        content: `A penalty kick is awarded against a team that commits one of the ten direct free kick offences inside its own penalty area while the ball is in play. The ball must be placed on the penalty mark. The kicker must be clearly identified. The defending goalkeeper must remain on the goal line until the ball is kicked. All other players must be outside the penalty area and at least 9.15m from the penalty mark.`,
      },
      {
        title: "Law 5 - The Referee",
        content: `The referee has full authority to enforce the Laws of the Game. Decisions are made to the best of the referee's judgement according to the Laws. The referee may use VAR to review clear and obvious errors or serious missed incidents relating to goals, penalty decisions, direct red cards, and mistaken identity.`,
      },
      {
        title: "VAR Protocol",
        content: `The Video Assistant Referee (VAR) is a match official who assists the referee by reviewing incidents using video footage. VAR may only review four types of decisions: goals, penalties, direct red cards, and mistaken identity. The VAR recommends a review but the referee makes the final decision. Clear and obvious errors or serious missed incidents will result in an overturn.`,
      },
      {
        title: "Law 7 - Handball",
        content: `Handling the ball involves a deliberate act of a player making contact with the ball with their hand or arm. The following criteria determine deliberate handball: the movement of the hand towards the ball, the distance between the opponent and the ball, the position of the hand not making the body bigger. A player is penalised if they score directly from their hand/arm or immediately after accidentally touching the ball with hand/arm.`,
      },
    ],
  },
  "tactical-knowledge": {
    filename: "tactical-guide.txt",
    collection: "tacticalKnowledge",
    sections: [
      {
        title: "High Pressing",
        content: `High pressing is a tactical strategy where a team applies pressure on the opponent high up the pitch immediately after losing possession. The aim is to win the ball back quickly in dangerous areas. Effective high pressing requires coordinated movement, good physical conditioning, and defensive organisation. Teams like Liverpool under Klopp and Bayern Munich used high pressing to create scoring opportunities from turnovers.`,
      },
      {
        title: "Counter-Attacking",
        content: `Counter-attacking is a reactive strategy where a team quickly transitions from defence to attack after winning possession. Key principles: rapid forward passing, direct runs in behind the defence, and exploiting spaces left by the attacking team. Effective counter-attacking requires pace, clinical finishing, and defensive discipline.`,
      },
      {
        title: "Formations - 4-4-2",
        content: `The 4-4-2 formation features four defenders, four midfielders, and two forwards. It provides defensive solidity with two banks of four. The two strikers can combine effectively. Wide midfielders provide attacking width. This formation is balanced but can be vulnerable to three-man midfields in central areas.`,
      },
      {
        title: "Formations - 4-3-3",
        content: `The 4-3-3 formation uses four defenders, three midfielders, and three forwards. It offers attacking width through the wide forwards. The three midfielders can control possession. This formation is common in modern football for its flexibility in attack and pressing capability.`,
      },
      {
        title: "Formations - 4-2-3-1",
        content: `The 4-2-3-1 formation features four defenders, two defensive midfielders, three attacking midfielders, and one striker. The double pivot protects the defence while the three attacking midfielders provide creativity. This formation offers a good balance between attack and defence.`,
      },
      {
        title: "Momentum in Football",
        content: `Momentum in football refers to the psychological and tactical advantage one team gains during a match. Goals, red cards, tactical substitutions, and key saves can shift momentum. Momentum changes are often visible through changes in possession patterns, territory, and chance creation. Substitutions are a key tool for managers to change momentum.`,
      },
      {
        title: "Pressing Triggers",
        content: `Pressing triggers are specific situations that initiate a team's press: a bad pass from the opponent, the opponent playing backwards, the opponent receiving with their back to goal, or the ball going into a specific zone. Teams use pressing triggers to coordinate their defensive pressure effectively.`,
      },
    ],
  },
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestDocument(doc: Document) {
  console.log(`\n📄 Ingesting: ${doc.filename}`);

  for (let i = 0; i < doc.sections.length; i++) {
    const section = doc.sections[i];
    console.log(`  📝 Section ${i + 1}/${doc.sections.length}: ${section.title}`);

    try {
      const res = await fetch(INGEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: section.content,
          collection: doc.collection,
          metadata: {
            title: section.title,
            source: doc.filename,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`    ❌ Failed: ${err}`);
      } else {
        const data = await res.json();
        console.log(`    ✅ Success: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error(`    ❌ Error: ${err}`);
    }

    await sleep(500);
  }
}

async function main() {
  console.log("🏁 PitchIQ AI - Knowledge Ingestion\n");
  console.log(`📍 Data directory: ${DATA_DIR}`);
  console.log(`📍 Ingest API: ${INGEST_API}\n`);

  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "your_openrouter_api_key_here") {
    console.warn("⚠️  OPENROUTER_API_KEY not set. Using fallback embeddings.");
  }

  for (const [key, doc] of Object.entries(DOCUMENTS)) {
    await ingestDocument(doc);
  }

  console.log("\n✅ Ingestion complete!\n");
  console.log("Now restart your dev server to use the ingested knowledge:");
  console.log("  npm run dev");
}

main().catch(console.error);
