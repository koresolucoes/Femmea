import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.join(process.cwd(), "public", "illustrations", "journey");
const outputDir = path.join(process.cwd(), "public", "illustrations", "rendered");
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

await mkdir(outputDir, { recursive: true });

for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const outputPath = path.join(outputDir, file);
  try {
    const source = await readFile(sourcePath, "utf8");
    const cleaned = source.replace(fullCanvasBlackPath, "");
    await writeFile(outputPath, cleaned, "utf8");
    console.log(`[Femmea] ilustração preparada: ${file}${cleaned !== source ? " (fundo preto removido)" : ""}`);
  } catch (error) {
    console.warn(`[Femmea] não foi possível preparar ${file}:`, error instanceof Error ? error.message : error);
  }
}
