import { readFile } from "node:fs/promises";

const files = {
  gua: await readFile("data/gua.ts", "utf8"),
  reading: await readFile("data/reading.ts", "utf8"),
  gaodaoText: await readFile("data/gaodao-text.ts", "utf8"),
  plainReading: await readFile("data/plain-reading.ts", "utf8"),
  specialReadings: await readFile("data/special-readings.ts", "utf8"),
  translations: await readFile("data/gaodao-translations.ts", "utf8"),
  translationDrafts: await readFile("data/sources/translation-workbench/gaodao-translation-drafts.json", "utf8"),
  readingContext: await readFile("lib/reading-context.ts", "utf8"),
  resultPage: await readFile("app/result/page.tsx", "utf8"),
};

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractJsonArray(source, declarationName) {
  const startToken = `export const ${declarationName}`;
  const start = source.indexOf(startToken);
  assert(start >= 0, `Missing declaration: ${declarationName}`);
  if (start < 0) return [];

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

  failures.push(`Could not parse array: ${declarationName}`);
  return [];
}

const gaodaoTextDatabase = extractJsonArray(files.gaodaoText, "gaodaoTextDatabase");
const translationDrafts = JSON.parse(files.translationDrafts);

assert(gaodaoTextDatabase.length === 64, `Expected 64 hexagram text records, got ${gaodaoTextDatabase.length}`);

const names = new Set();
for (const record of gaodaoTextDatabase) {
  names.add(record.name);
  assert(record.kingWenNumber >= 1 && record.kingWenNumber <= 64, `Invalid King Wen number: ${record.name}`);
  assert(record.judgment?.length > 80, `Short or missing judgment: ${record.name}`);
  assert(record.lines?.length === 6, `Expected 6 lines for ${record.name}`);

  for (const line of record.lines ?? []) {
    assert(line.line >= 1 && line.line <= 6, `Invalid line number for ${record.name}`);
    assert(line.original?.length > 20, `Short or missing line text: ${record.name} line ${line.line}`);
  }
}

assert(names.size === 64, `Expected 64 unique hexagram names, got ${names.size}`);
assert(translationDrafts.hexagrams?.length === 64, `Expected 64 draft translations, got ${translationDrafts.hexagrams?.length}`);
for (const hexagram of translationDrafts.hexagrams ?? []) {
  assert(hexagram.status === "draft", `Draft translation not marked draft: ${hexagram.name}`);
  assert(hexagram.modernDraft?.length > 20, `Missing hexagram modern draft: ${hexagram.name}`);
  assert(hexagram.lines?.length === 6, `Expected 6 draft lines for ${hexagram.name}`);
  for (const line of hexagram.lines ?? []) {
    assert(line.modernDraft?.length > 20, `Missing line modern draft: ${hexagram.name} line ${line.line}`);
    assert(line.caseModernDraft?.length > 20, `Missing case modern draft: ${hexagram.name} line ${line.line}`);
  }
}
assert(files.reading.includes("weight: 30") && files.reading.includes("weight: 51") && files.reading.includes("weight: 19"), "Reading weights are incomplete");
assert(files.plainReading.includes('"乾为天"'), "Missing Qian plain-reading override block");
assert(files.translations.includes('name: "乾为天"'), "Missing Qian translation overlay");
assert(files.translations.includes("caseModern"), "Translation overlay should include case modern drafts");
assert(files.resultPage.includes("getHexagramTranslation"), "Result page does not use translation overlays");
assert(files.readingContext.includes("getLineTranslation"), "Reading context does not use line translation overlays");

for (const line of [1, 2, 3, 4, 5, 6]) {
  assert(files.plainReading.includes(`${line}: "`), `Missing Qian line override ${line}`);
}

assert(files.specialReadings.includes("qian-yong-jiu"), "Missing Qian yongjiu special reading");
assert(files.specialReadings.includes("见群龙无首，吉。"), "Missing yongjiu original text");
assert(files.resultPage.includes("result.specialReadings"), "Result page does not render special readings");
assert(files.resultPage.includes("本卦 · 30%") && files.resultPage.includes("动爻 · 51%") && files.resultPage.includes("变卦 · 19%"), "Result page missing weighted reading panels");
assert(files.readingContext.includes("buildReadingContext"), "Missing model reading context builder");
assert(files.readingContext.includes("本卦30%、动爻51%、变卦19%"), "Reading context missing required weights");
assert(files.resultPage.includes("buildReadingContext"), "Result page does not use reading context builder");

if (failures.length > 0) {
  console.error("Gaodao data validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Gaodao data validation passed.");
console.log(`Validated ${gaodaoTextDatabase.length} hexagrams and ${gaodaoTextDatabase.length * 6} line records.`);
