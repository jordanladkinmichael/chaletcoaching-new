const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const targetDirs = ["app", "components", "lib"];
const outputDir = path.join(root, "reports");
const outputJson = path.join(outputDir, "i18n-audit.json");
const outputCsv = path.join(outputDir, "i18n-audit.csv");

const filePattern = /\.(ts|tsx)$/;
const attrPattern = /\b(title|label|placeholder|alt|aria-label)\s*=\s*"([^"]+)"/g;
const stringPattern = /"([^"\n]{3,})"|'([^'\n]{3,})'/g;
const jsxTextPattern = />([^<>{][^<>{]{2,})</g;

const ignoreSegments = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}lib${path.sep}i18n${path.sep}`,
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (ignoreSegments.some((segment) => fullPath.includes(segment))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (filePattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function getLineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

function guessNamespace(filePath) {
  const relativePath = path.relative(root, filePath).replaceAll("\\", "/");
  if (relativePath.includes("/auth/")) return "auth";
  if (relativePath.includes("site-header")) return "header";
  if (relativePath.includes("site-footer")) return "footer";
  if (relativePath.includes("/faq/") || relativePath.includes("faq-data")) return "faq";
  if (relativePath.includes("/support/") || relativePath.includes("support-articles")) return "support";
  if (relativePath.includes("metadata") || relativePath.includes("/layout")) return "metadata";
  return "common";
}

function addMatch(results, filePath, index, kind, text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length < 3) return;
  if (!/[A-Za-zÀ-ÿ]/.test(normalized)) return;
  if (/^(use client|import |from |return |className|href=|src=)/.test(normalized)) return;

  results.push({
    file: path.relative(root, filePath).replaceAll("\\", "/"),
    line: getLineNumber(fs.readFileSync(filePath, "utf8"), index),
    kind,
    text: normalized,
    suggestedNamespace: guessNamespace(filePath),
  });
}

function collectFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const results = [];

  for (const match of content.matchAll(attrPattern)) {
    addMatch(results, filePath, match.index ?? 0, "attr", match[2]);
  }

  for (const match of content.matchAll(jsxTextPattern)) {
    addMatch(results, filePath, match.index ?? 0, "jsx", match[1]);
  }

  if (/data|articles|faq/i.test(path.basename(filePath))) {
    for (const match of content.matchAll(stringPattern)) {
      addMatch(results, filePath, match.index ?? 0, "string", match[1] ?? match[2]);
    }
  }

  return results;
}

function toCsv(rows) {
  const header = ["file", "line", "kind", "text", "suggestedNamespace"];
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
  return [header.join(","), ...rows.map((row) => header.map((key) => escape(row[key])).join(","))].join("\n");
}

const files = targetDirs.flatMap((dir) => walk(path.join(root, dir)));
const rows = files.flatMap((filePath) => collectFromFile(filePath));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputJson, JSON.stringify(rows, null, 2));
fs.writeFileSync(outputCsv, toCsv(rows));

console.log(`i18n audit complete: ${rows.length} candidates`);
console.log(path.relative(root, outputJson));
console.log(path.relative(root, outputCsv));
