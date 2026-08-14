import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const artworkDir = path.join(process.cwd(), "public", "illustrations", "journey");
const files = [
  "planning.svg",
  "cycle-monitoring.svg",
  "insemination-day.svg",
  "post-procedure.svg",
  "pregnancy-test.svg",
  "pregnancy.svg",
  "reminder.svg",
];

const fullCanvasBlackPath = /\s*<path\s+fill="#000000"\s+d="\s*M\s+0(?:\.0+)?\s+0(?:\.0+)?\s+L\s+1024(?:\.0+)?\s+0(?:\.0+)?\s+L\s+1024(?:\.0+)?\s+1024(?:\.0+)?\s+L\s+0(?:\.0+)?\s+1024(?:\.0+)?\s+L\s+0(?:\.0+)?\s+0(?:\.0+)?\s+Z[^\"]*"\s*\/>/i;

for (const file of files) {
  const filePath = path.join(artworkDir, file);
  try {
    const source = await readFile(filePath, "utf8");
    const cleaned = source.replace(fullCanvasBlackPath, "");
    if (cleaned !== source) {
      await writeFile(filePath, cleaned, "utf8");
      console.log(`[Femmea] fundo preto removido de ${file}`);
    } else {
      console.log(`[Femmea] ${file} já está sem fundo preto exportado`);
    }
  } catch (error) {
    console.warn(`[Femmea] não foi possível preparar ${file}:`, error instanceof Error ? error.message : error);
  }
}
