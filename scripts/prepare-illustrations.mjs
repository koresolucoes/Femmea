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
  if (!viewBox) return { source, changed: false, reason: "viewBox não encontrado" };

  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return { source, changed: false, reason: "viewBox inválido" };
  }

  const pathStart = source.search(/<path\s+fill=["']#000000["']/i);
  if (pathStart < 0) return { source, changed: false, reason: "path preto não encontrado" };

  const tagEnd = source.indexOf(">", pathStart);
  if (tagEnd < 0) return { source, changed: false, reason: "path preto inválido" };

  const openingTag = source.slice(pathStart, tagEnd + 1);
  const dAttribute = openingTag.match(/\sd=["']/i);
  if (!dAttribute || dAttribute.index == null) {
    return { source, changed: false, reason: "atributo d não encontrado" };
  }

  const quoteIndex = pathStart + dAttribute.index + dAttribute[0].length - 1;
  const quote = source[quoteIndex];
  const dStart = quoteIndex + 1;
  const dEnd = source.indexOf(quote, dStart);
  if (dEnd < 0) return { source, changed: false, reason: "fim do path não encontrado" };

  const d = source.slice(dStart, dEnd);
  const moveCommands = [...d.matchAll(/M(?=[\d.+-])/g)];
  if (moveCommands.length < 2 || moveCommands[1].index == null) {
    return { source, changed: false, reason: "segundo subpath não encontrado" };
  }

  const artworkStart = moveCommands[1].index;
  const canvasSubpath = d.slice(0, artworkStart);
  const canvasWidth = (width + 1).toFixed(6);
  const canvasHeight = (height + 1).toFixed(6);

  const looksLikeGeneratedCanvas =
    canvasSubpath.includes("1.000000") &&
    canvasSubpath.includes(canvasWidth) &&
    canvasSubpath.includes(canvasHeight);

  if (!looksLikeGeneratedCanvas) {
    return { source, changed: false, reason: "primeiro subpath não corresponde ao canvas" };
  }

  const cleanedD = d.slice(artworkStart);
  const cleanedSource = source.slice(0, dStart) + cleanedD + source.slice(dEnd);

  return { source: cleanedSource, changed: true, reason: "canvas preto removido" };
}

for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const outputPath = path.join(outputDir, file);

  try {
    const source = await readFile(sourcePath, "utf8");
    const cleaned = stripExportedBlackCanvas(source);

    await writeFile(outputPath, cleaned.source, "utf8");

    console.log(`[Femmea] ${file}: ${cleaned.reason}`);
  } catch (error) {
    console.warn(
      `[Femmea] falha ao preparar ${file}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
