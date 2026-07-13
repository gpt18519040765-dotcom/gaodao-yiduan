import { readFile, writeFile } from "node:fs/promises";

const workbenchPath = "data/sources/translation-workbench/gaodao-translation-workbench.json";
const outputPath = "data/sources/translation-workbench/gaodao-translation-drafts.json";

function extractObjectLiteral(source, declarationName) {
  const startToken = `const ${declarationName}`;
  const start = source.indexOf(startToken);
  if (start < 0) throw new Error(`Missing declaration: ${declarationName}`);

  const equals = source.indexOf("=", start);
  const objectStart = source.indexOf("{", equals);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
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
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(objectStart, index + 1);
  }

  throw new Error(`Could not parse object: ${declarationName}`);
}

function evalObjectLiteral(source) {
  return Function(`"use strict"; return (${source});`)();
}

function shortYaoCi(yaoCi = "") {
  return yaoCi
    .replace(/[。；;].*$/, "")
    .replace(/^[初上]?[六九]?[：:。]*/, "")
    .trim();
}

function linePositionPhrase(line) {
  const phrases = {
    1: "事情还在开端和根基处，最要紧的是守住初心、试探环境，不宜急于做满。",
    2: "事情进入较稳定的执行位置，宜寻找可靠依托，借助正当的人和平台推进。",
    3: "事情处在内外转换处，压力、误判和关系摩擦容易出现，宜勤勉谨慎。",
    4: "事情接近关键节点，可以行动但要审时度势，先看上下条件是否接得住。",
    5: "事情触及主位和核心决策，若德位相称，可主动推进并争取更高层面的支持。",
    6: "事情走到尾声或过盛处，宜收束、复盘、止盈止损，避免过头生悔。",
  };

  return phrases[line] ?? "此爻为本次变化点，应结合爻辞和占例判断。";
}

function buildLineDraft(hexagramName, line) {
  const yaoCi = shortYaoCi(line.yaoCi);
  const prefix = yaoCi ? `此爻爻辞为“${yaoCi}”。` : "";
  return `${prefix}${linePositionPhrase(line.line)}放在「${hexagramName}」卦里看，要先顺着本卦的大势，再看这一爻提示的进退、风险和应对。`;
}

function buildCaseDraft(hexagramName, line) {
  const yaoCi = shortYaoCi(line.yaoCi);
  const core = yaoCi ? `“${yaoCi}”` : "本爻";
  return `此占例围绕${core}展开，可先作要点式理解：占断不是只看吉凶字面，而是把所问之事放进「${hexagramName}」的卦势，再结合第 ${line.line} 爻的位置判断时机、人物关系和行动分寸。原文占例仍需逐条精校，当前版本先供页面通顺展示和后续人工校对。`;
}

function normalizeQianReferences(text = "") {
  return text.includes("已在 data/gaodao-translations.ts") ? "" : text;
}

const plainReadingSource = await readFile("data/plain-reading.ts", "utf8");
const hexagramPlainSummaries = evalObjectLiteral(extractObjectLiteral(plainReadingSource, "hexagramPlainSummaries"));
const linePlainSummaries = evalObjectLiteral(extractObjectLiteral(plainReadingSource, "linePlainSummaries"));
const lineOverrides = evalObjectLiteral(extractObjectLiteral(plainReadingSource, "lineOverrides"));
const workbench = JSON.parse(await readFile(workbenchPath, "utf8"));

const drafts = {
  meta: {
    ...workbench.meta,
    name: "gaodao-translation-drafts",
    source:
      "Drafted from NDL OCR workbench plus local 64-hexagram plain summaries. Qian keeps the hand-written overlay in data/gaodao-translations.ts.",
    status: "draft",
    generatedAt: new Date().toISOString(),
  },
  hexagrams: workbench.hexagrams.map((hexagram) => {
    const modernDraft =
      normalizeQianReferences(hexagram.modernDraft) ||
      hexagramPlainSummaries[hexagram.name] ||
      "此卦白话初稿待补，当前先以原文和动爻为主判断。";

    return {
      ...hexagram,
      status: "draft",
      modernDraft,
      translatorNotes:
        hexagram.translatorNotes ||
        "初译先求通顺和方向正确；日文汉文 OCR 与清代文言对照后续再逐条精校。",
      lines: hexagram.lines.map((line) => {
        const override = lineOverrides[hexagram.name]?.[line.line];
        const generic = linePlainSummaries[line.line];

        return {
          ...line,
          status: "draft",
          modernDraft:
            normalizeQianReferences(line.modernDraft) ||
            override ||
            (generic ? buildLineDraft(hexagram.name, { ...line, yaoCi: `${line.yaoCi}。${generic}` }) : buildLineDraft(hexagram.name, line)),
          caseModernDraft: normalizeQianReferences(line.caseModernDraft) || buildCaseDraft(hexagram.name, line),
          translatorNotes:
            line.translatorNotes ||
            "占例白话为要点式初译，适合先展示；精校时需回看完整 OCR 原文和纸本。",
        };
      }),
    };
  }),
};

await writeFile(outputPath, `${JSON.stringify(drafts, null, 2)}\n`);

console.log(`Generated ${outputPath}`);
console.log(`Filled ${drafts.hexagrams.length} hexagrams and ${drafts.hexagrams.length * 6} line drafts.`);
