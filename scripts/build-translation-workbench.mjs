import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = "data/sources/translation-workbench";
const outputJsonPath = path.join(outputDir, "gaodao-translation-workbench.json");
const outputMarkdownPath = path.join(outputDir, "gaodao-translation-workbench.md");

function trimText(text = "", maxLength = 640) {
  const compact = text
    .replace(/增補高島易斷|增補高島易|高島易斷|高島易/g, "")
    .replace(/\s+/g, "")
    .trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength)}……` : compact;
}

function extractYaoCi(text = "") {
  const beforeCommentary = text.split(/象[傳传][曰日]|象[曰日]/)[0] ?? "";
  return trimText(beforeCommentary, 160);
}

function extractJsonArray(source, declarationName) {
  const startToken = `export const ${declarationName}`;
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Missing declaration: ${declarationName}`);

  const equals = source.indexOf("=", start);
  const arrayStart = source.indexOf("[", equals);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') inString = true;
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (depth === 0) return JSON.parse(source.slice(arrayStart, index + 1));
  }

  throw new Error(`Could not parse array: ${declarationName}`);
}

function buildWorkbench(records) {
  return {
    meta: {
      name: "gaodao-translation-workbench",
      source: "NDL public-domain OCR text, normalized by scripts/build-gaodao-database.mjs",
      intent:
        "逐卦整理《高岛易断》公版原文，供人工白话译写、清代文言本对照和后续入库使用。",
      statusLegend: {
        todo: "尚未开始译写",
        draft: "已有初稿，待人工校对",
        reviewed: "已完成一轮校对",
      },
      generatedAt: new Date().toISOString(),
    },
    hexagrams: records.map((record) => ({
      key: record.name,
      kingWenNumber: record.kingWenNumber,
      name: record.name,
      traditionalName: record.traditionalName,
      ndlId: record.ndlId,
      status: record.name === "乾为天" ? "draft" : "todo",
      sourceExcerpt: trimText(record.judgment, 900),
      modernDraft: record.name === "乾为天" ? "已在 data/gaodao-translations.ts 录入样板译写。" : "",
      qingClassicalText: "",
      qingModernDraft: "",
      translatorNotes: "",
      lines: record.lines.map((line) => ({
        line: line.line,
        label: line.label,
        yaoCi: extractYaoCi(line.original),
        sourceExcerpt: trimText(line.original, 520),
        caseExcerpt: trimText(line.caseText, 700),
        status: record.name === "乾为天" ? "draft" : "todo",
        modernDraft: record.name === "乾为天" ? "已在 data/gaodao-translations.ts 录入样板译写。" : "",
        caseModernDraft: record.name === "乾为天" ? "已在 data/gaodao-translations.ts 录入样板译写。" : "",
        qingClassicalText: "",
        qingModernDraft: "",
        translatorNotes: "",
      })),
    })),
  };
}

function buildMarkdown(workbench) {
  const lines = [
    "# 高岛易断翻译工作台",
    "",
    `生成时间：${workbench.meta.generatedAt}`,
    "",
    "用途：按 64 卦、384 爻整理公版 OCR 原文，后续把日文/汉文原文、清代文言本、现代白话译写分层入库。",
    "",
    "## 工作流",
    "",
    "1. 先校对 sourceExcerpt / caseExcerpt 的 OCR 错字。",
    "2. 有清代文言本时填入 qingClassicalText。",
    "3. 将本卦、动爻、占例分别写成现代白话。",
    "4. 校对通过后迁入 data/gaodao-translations.ts 或正式内容数据库。",
    "",
    "## 目录",
    "",
    ...workbench.hexagrams.map(
      (hexagram) => `- ${hexagram.kingWenNumber}. ${hexagram.name}（${hexagram.traditionalName}） · ${hexagram.status}`,
    ),
    "",
  ];

  for (const hexagram of workbench.hexagrams) {
    lines.push(
      `## ${hexagram.kingWenNumber}. ${hexagram.name}`,
      "",
      `- 繁体名：${hexagram.traditionalName}`,
      `- NDL：${hexagram.ndlId}`,
      `- 状态：${hexagram.status}`,
      "",
      "### 本卦原文摘录",
      "",
      hexagram.sourceExcerpt,
      "",
      "### 本卦白话译写",
      "",
      hexagram.modernDraft || "TODO",
      "",
    );

    for (const line of hexagram.lines) {
      lines.push(
        `### ${line.label}`,
        "",
        `- 状态：${line.status}`,
        `- 爻辞：${line.yaoCi || "待校对"}`,
        "",
        "原文摘录：",
        "",
        line.sourceExcerpt,
        "",
        "占例摘录：",
        "",
        line.caseExcerpt || "待补",
        "",
        "白话译写：",
        "",
        line.modernDraft || "TODO",
        "",
        "占例白话：",
        "",
        line.caseModernDraft || "TODO",
        "",
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

const source = await readFile("data/gaodao-text.ts", "utf8");
const records = extractJsonArray(source, "gaodaoTextDatabase");
const workbench = buildWorkbench(records);

await mkdir(outputDir, { recursive: true });
await writeFile(outputJsonPath, `${JSON.stringify(workbench, null, 2)}\n`);
await writeFile(outputMarkdownPath, buildMarkdown(workbench));

console.log(`Generated ${outputJsonPath}`);
console.log(`Generated ${outputMarkdownPath}`);
console.log(`Prepared ${records.length} hexagrams and ${records.length * 6} line translation entries.`);
