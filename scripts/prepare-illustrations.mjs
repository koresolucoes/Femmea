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

await mkdir(outputDir, { recursive: true });

function stripExportedBlackCanvas(source) {
  const viewBox = source.match(/viewBox=["']\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  if (!viewBox) return { source, changed: false };

  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return { source, changed: false };

  const blackPathPattern = /<path\s+fill=["']#000000["'][^>]*\sd=["']([\s\S]*?)["']\s*\/>/i;
  const blackPath = source.match(blackPathPattern);
  if (!blackPath) return { source, changed: false };

  const d = blackPath[1];
  const nextSubpath = d.match(/\nM(?=[\d.+-])/);
  if (!nextSubpath || nextSubpath.index == null) return { source, changed: false };

  const canvasSubpath = d.slice(0, nextSubpath.index);
  const canvasWidth = (width + 1).toFixed(6);
  const canvasHeight = (height + 1).toFixed(6);

  const looksLikeGeneratedCanvas =
    canvasSubpath.includes("1.000000") &&
    canvasSubpath.includes(canvasWidth) &&
    canvasSubpath.includes(canvasHeight);

  if (!looksLikeGeneratedCanvas) return { source, changed: false };

  const artworkOnlyPath = d.slice(nextSubpath.index + 1);
  const cleanedPath = blackPath[0].replace(d, artworkOnlyPath);

  return {
    source: source.replace(blackPath[0], cleanedPath),
    changed: true,
  };
}

for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const outputPath = path.join(outputDir, file);

  try {
    const source = await readFile(sourcePath, "utf8");
    const cleaned = stripExportedBlackCanvas(source);

    await writeFile(outputPath, cleaned.source, "utf8");

    console.log(
      `[Femmea] asset preparado: ${file}${cleaned.changed ? " (canvas preto removido)" : ""}`,
    );
  } catch (error) {
    console.warn(
      `[Femmea] falha ao preparar ${file}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
