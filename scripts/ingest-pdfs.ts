/**
 * PitchIQ AI - Docling PDF Ingestion Script
 *
 * Processes FIFA Laws of the Game, tactical analysis, coaching documents,
 * and referee guidelines PDFs using Docling (Python library).
 *
 * Usage:
 *   1. Install Python deps: pip install docling
 *   2. Place PDFs in data/pdfs/
 *   3. Run: npx tsx scripts/ingest-pdfs.ts
 *
 * Alternatively, use the built-in text fallback for demo data.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const DATA_DIR = path.join(process.cwd(), "data");
const PDF_DIR = path.join(DATA_DIR, "pdfs");
const OUTPUT_DIR = path.join(DATA_DIR, "processed");
const INGEST_API = "http://localhost:3000/api/ingest";

interface PDFConfig {
  filename: string;
  collection: string;
  title: string;
}

const PDF_SOURCES: PDFConfig[] = [
  { filename: "fifa-laws-of-the-game.pdf", collection: "fifaLaws", title: "FIFA Laws of the Game" },
  { filename: "tactical-analysis-guide.pdf", collection: "tacticalKnowledge", title: "Tactical Analysis Guide" },
  { filename: "soccer-coaching-manual.pdf", collection: "coachingDocuments", title: "Soccer Coaching Manual" },
  { filename: "referee-guidelines.pdf", collection: "refereeGuidelines", title: "Referee Guidelines" },
  { filename: "formation-patterns.pdf", collection: "formationPatterns", title: "Formation Patterns" },
  { filename: "momentum-patterns.pdf", collection: "momentumPatterns", title: "Momentum Patterns" },
];

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function checkDoclingInstalled(): boolean {
  try {
    execSync("python3 -c \"import docling\" 2>/dev/null || python -c \"import docling\" 2>/dev/null", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

async function processWithDocling(pdfPath: string, outputPath: string): Promise<string | null> {
  const pythonScript = `
import sys
sys.path.insert(0, '.')
try:
    from docling.document_converter import DocumentConverter
    converter = DocumentConverter()
    result = converter.convert("${pdfPath.replace(/\\/g, "\\\\")}")
    text = result.document.export_to_markdown()
    with open("${outputPath.replace(/\\/g, "\\\\")}", "w", encoding="utf-8") as f:
        f.write(text)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
`;

  const scriptPath = path.join(DATA_DIR, "_process_pdf.py");
  fs.writeFileSync(scriptPath, pythonScript);

  try {
    execSync(`python3 "${scriptPath}" 2>/dev/null || python "${scriptPath}" 2>/dev/null`, {
      stdio: "pipe",
      timeout: 120000,
    });
    return fs.readFileSync(outputPath, "utf-8");
  } catch (err) {
    console.error(`  Docling processing failed:`, err);
    return null;
  } finally {
    if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
  }
}

function getFallbackContent(collection: string): { title: string; content: string }[] {
  const fallbacks: Record<string, { title: string; content: string }[]> = {
    fifaLaws: [
      { title: "Law 11 - Offside", content: "A player is in an offside position if any part of the head, body or feet is in the opponents' half and any part of the head, body or feet is nearer to the opponents' goal line than both the ball and the second-last opponent." },
      { title: "Law 12 - Fouls and Misconduct", content: "Direct free kick offences include: kicking, tripping, jumping at, charging, striking, pushing, tackling an opponent, holding, spitting, deliberately handling the ball." },
      { title: "Law 14 - The Penalty Kick", content: "A penalty kick is awarded against a team that commits one of the ten direct free kick offences inside its own penalty area while the ball is in play." },
      { title: "VAR Protocol", content: "The Video Assistant Referee (VAR) assists the referee by reviewing incidents using video footage for four types of decisions: goals, penalties, direct red cards, and mistaken identity." },
    ],
    tacticalKnowledge: [
      { title: "High Pressing", content: "High pressing is a tactical strategy where a team applies pressure on the opponent high up the pitch immediately after losing possession. The aim is to win the ball back quickly in dangerous areas." },
      { title: "Counter-Attacking", content: "Counter-attacking is a reactive strategy where a team quickly transitions from defence to attack after winning possession. Key principles: rapid forward passing, direct runs in behind." },
      { title: "Formation 4-3-3", content: "The 4-3-3 formation uses four defenders, three midfielders, and three forwards. It offers attacking width through the wide forwards. Common in modern football." },
      { title: "Momentum Shifts", content: "Momentum in football refers to the psychological and tactical advantage one team gains during a match. Goals, red cards, substitutions, and key saves can shift momentum." },
    ],
    coachingDocuments: [
      { title: "Defensive Organization", content: "A well-organized defense maintains compactness between lines, with the back four holding a consistent shape and midfielders tracking runners." },
      { title: "Attacking Transitions", content: "Quick attacks from winning possession require immediate forward passing options and runners in behind the opposition defense." },
    ],
    refereeGuidelines: [
      { title: "Advantage Principle", content: "The referee should allow play to continue when the team that was fouled will benefit from the advantage, and penalize the original offence if the advantage does not materialize." },
    ],
    formationPatterns: [
      { title: "4-3-3 Formation", content: "A fluid formation that can transition to 4-5-1 defensively. Wide forwards track back. The single pivot protects the back line." },
      { title: "3-5-2 Formation", content: "Uses three center-backs and wing-backs providing width. Strong in central midfield with three players. Vulnerable to wide attacks." },
    ],
    momentumPatterns: [
      { title: "Goal Momentum", content: "Goals within 5 minutes of each other create compounding momentum shifts. Conceding immediately after scoring can be particularly damaging psychologically." },
    ],
  };

  return fallbacks[collection] || [];
}

async function ingestContent(
  collection: string,
  sections: { title: string; content: string }[]
) {
  console.log(`  Ingesting ${sections.length} sections into "${collection}"...`);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    try {
      const res = await fetch(INGEST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: section.content,
          collection,
          metadata: { title: section.title, source: `docling-${collection}` },
        }),
      });

      if (!res.ok) {
        console.error(`    Section ${i + 1} failed: ${await res.text()}`);
      } else {
        const data = await res.json();
        console.log(`    Section ${i + 1}/${sections.length}: ${section.title} ✅`);
      }
    } catch (err) {
      console.error(`    Section ${i + 1} error: ${err}`);
    }

    await new Promise((r) => setTimeout(r, 300));
  }
}

async function main() {
  console.log("\n🏁 PitchIQ AI - Knowledge Base Ingestion\n");
  console.log(`📁 PDF directory: ${PDF_DIR}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🌐 Ingest API: ${INGEST_API}\n`);

  await ensureDir(PDF_DIR);
  await ensureDir(OUTPUT_DIR);

  const hasDocling = checkDoclingInstalled();
  if (!hasDocling) {
    console.log("⚠️  Docling not found. Using built-in knowledge base fallback.\n");
    console.log("   To install Docling: pip install docling\n");
    console.log("   Place PDFs in: data/pdfs/\n");
  } else {
    console.log("✅ Docling detected. Will process PDFs.\n");
  }

  for (const source of PDF_SOURCES) {
    console.log(`📄 Processing: ${source.filename}`);

    let text: string | null = null;
    const pdfPath = path.join(PDF_DIR, source.filename);

    if (hasDocling && fs.existsSync(pdfPath)) {
      const outputPath = path.join(OUTPUT_DIR, `${source.collection}.md`);
      text = await processWithDocling(pdfPath, outputPath);
    }

    if (text) {
      const sections = text
        .split("\n## ")
        .filter(Boolean)
        .map((s) => {
          const lines = s.trim().split("\n");
          const title = lines[0].replace(/^#+\s*/, "").trim();
          const content = lines.slice(1).join("\n").trim();
          return { title: title || source.title, content: content || s };
        });

      await ingestContent(source.collection, sections.slice(0, 50));
    } else {
      console.log(`  Using fallback content for ${source.collection}...`);
      const fallback = getFallbackContent(source.collection);
      if (fallback.length > 0) {
        await ingestContent(source.collection, fallback);
      } else {
        console.log(`  No fallback content available for ${source.collection}, skipping.`);
      }
    }
  }

  console.log("\n✅ Ingestion complete!\n");
  console.log("Now restart your dev server:");
  console.log("  npm run dev\n");
}

main().catch(console.error);
