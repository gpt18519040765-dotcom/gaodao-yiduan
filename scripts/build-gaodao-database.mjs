import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRows = [
  [1, "乾为天", "乾爲天", "760552"],
  [2, "坤为地", "坤爲地", "760552"],
  [3, "水雷屯", "水雷屯", "760552"],
  [4, "山水蒙", "山水蒙", "760552"],
  [5, "水天需", "水天需", "760552"],
  [6, "天水讼", "天水訟", "760552"],
  [7, "地水师", "地水師", "760552"],
  [8, "水地比", "水地比", "760552"],
  [9, "风天小畜", "風天小畜", "760552"],
  [10, "天泽履", "天澤履", "760552"],
  [11, "地天泰", "地天泰", "760552"],
  [12, "天地否", "天地否", "760552"],
  [13, "天火同人", "天火同人", "760552"],
  [14, "火天大有", "火天大有", "760552"],
  [15, "地山谦", "地山謙", "760552"],
  [16, "雷地豫", "雷地豫", "760552"],
  [17, "泽雷随", "澤雷隨", "760553"],
  [18, "山风蛊", "山風蠱", "760553"],
  [19, "地泽临", "地澤臨", "760553"],
  [20, "风地观", "風地觀", "760553"],
  [21, "火雷噬嗑", "火雷噬嗑", "760553"],
  [22, "山火贲", "山火賁", "760553"],
  [23, "山地剥", "山地剝", "760553"],
  [24, "地雷复", "地雷復", "760553"],
  [25, "天雷无妄", "天雷无妄", "760553"],
  [26, "山天大畜", "山天大畜", "760553"],
  [27, "山雷颐", "山雷頤", "760553"],
  [28, "泽风大过", "澤風大過", "760553"],
  [29, "坎为水", "坎爲水", "760553"],
  [30, "离为火", "離爲火", "760553"],
  [31, "泽山咸", "澤山咸", "760554"],
  [32, "雷风恒", "雷風恒", "760554"],
  [33, "天山遁", "天山遯", "760554"],
  [34, "雷天大壮", "雷天大壯", "760554"],
  [35, "火地晋", "火地晉", "760554"],
  [36, "地火明夷", "地火明夷", "760554"],
  [37, "风火家人", "風火家人", "760554"],
  [38, "火泽睽", "火澤睽", "760554"],
  [39, "水山蹇", "水山蹇", "760554"],
  [40, "雷水解", "雷水解", "760554"],
  [41, "山泽损", "山澤損", "760554"],
  [42, "风雷益", "風雷益", "760554"],
  [43, "泽天夬", "澤天夬", "760554"],
  [44, "天风姤", "天風姤", "760554"],
  [45, "泽地萃", "澤地萃", "760554"],
  [46, "地风升", "地風升", "760554"],
  [47, "泽水困", "澤水困", "760554"],
  [48, "水风井", "水風井", "760554"],
  [49, "泽火革", "澤火革", "760555"],
  [50, "火风鼎", "火風鼎", "760555"],
  [51, "震为雷", "震爲雷", "760555"],
  [52, "艮为山", "艮爲山", "760555"],
  [53, "风山渐", "風山漸", "760555"],
  [54, "雷泽归妹", "雷澤歸妹", "760555"],
  [55, "雷火丰", "雷火豐", "760555"],
  [56, "火山旅", "火山旅", "760555"],
  [57, "巽为风", "巽爲風", "760555"],
  [58, "兑为泽", "兌爲澤", "760555"],
  [59, "风水涣", "風水渙", "760555"],
  [60, "水泽节", "水澤節", "760555"],
  [61, "风泽中孚", "風澤中孚", "760555"],
  [62, "雷山小过", "雷山小過", "760555"],
  [63, "水火既济", "水火既濟", "760555"],
  [64, "火水未济", "火水未濟", "760555"],
];

const lineMarkers = ["初", "二", "三", "四", "五", "上"];
const lineAliases = [
  ["初九", "初六"],
  ["九二", "六二"],
  ["九三", "六三"],
  ["九四", "六四"],
  ["九五", "六五"],
  ["上九", "上六"],
];

const ocrNameAliases = {
  山火賁: ["山火賁", "山火責"],
  澤山咸: ["澤山咸", "澤山感", "澤山成"],
  澤天夬: ["澤天夬", "澤天夫"],
  天風姤: ["天風姤", "天風妬"],
  艮爲山: ["艮爲山", "良爲山"],
  巽爲風: ["巽爲風", "異爲風"],
};

const ocrLineAliases = {
  风天小畜: {
    4: ["有孚血去"],
  },
};

function namesForSearch(name) {
  return ocrNameAliases[name] ?? [name];
}

function compact(text) {
  return text.replace(/\s+/g, "").replace(/髙/g, "高").replace(/〓/g, "□");
}

function excerptFrom(text, start, end, limit = 2400) {
  if (start < 0) return "";
  const slice = text.slice(start, end > start ? end : start + limit);
  return slice.slice(0, limit);
}

function findMainStart(text, name) {
  const indexes = namesForSearch(name).flatMap((candidate) => findAllIndexes(text, candidate)).sort((a, b) => a - b);
  return indexes.find((index) => index > 80) ?? indexes[0] ?? -1;
}

function findAllIndexes(text, name) {
  const indexes = [];
  let current = text.indexOf(name);
  while (current >= 0) {
    indexes.push(current);
    current = text.indexOf(name, current + name.length);
  }
  return indexes;
}

function buildSectionStarts(text, rows) {
  let previousStart = 1000;
  const starts = new Map();

  for (const [, name, traditionalName] of rows) {
    const candidates = namesForSearch(traditionalName).flatMap((candidate) => findAllIndexes(text, candidate)).sort((a, b) => a - b);
    const start =
      candidates.find((index) => index > previousStart + 1200) ??
      candidates.find((index) => index > previousStart + 400) ??
      findMainStart(text, traditionalName);

    starts.set(name, start);
    if (start > 0) previousStart = start;
  }

  return starts;
}

function findLineStart(section, aliases, minPosition = 0) {
  const matchesByStrength = aliases.flatMap((alias) => {
    const matches = [];
    let current = section.indexOf(alias, minPosition);
    while (current >= 0) {
      const lookahead = section.slice(current, current + 180);
      const previousChar = current > 0 ? section[current - 1] : "";
      const looksLikeLineHeading = /象(?:[傳传][曰日]|[曰日])/.test(lookahead);
      const startsAfterSentence = current === 0 || /[。○)」]/.test(previousChar);
      if (looksLikeLineHeading) matches.push({ position: current, strength: startsAfterSentence ? 2 : 1 });
      current = section.indexOf(alias, current + alias.length);
    }
    return matches;
  });

  const strongMatches = matchesByStrength.filter((match) => match.strength === 2);
  if (strongMatches.length > 0) return strongMatches.map((match) => match.position).sort((a, b) => a - b)[0];

  if (matchesByStrength.length > 0) return matchesByStrength.map((match) => match.position).sort((a, b) => a - b)[0];

  return aliases
    .map((alias) => section.indexOf(alias))
    .filter((position) => position >= 0)
    .sort((a, b) => a - b)[0] ?? -1;
}

const volumes = new Map();
const sectionStarts = new Map();
for (const [, , , ndlId] of sourceRows) {
  if (volumes.has(ndlId)) continue;
  const payload = JSON.parse(await readFile(path.join("data", "sources", "ndl", `${ndlId}.json`), "utf8"));
  const volumeText = compact(payload.pages.map((page) => page.contents).join("\n"));
  volumes.set(ndlId, volumeText);
  sectionStarts.set(
    ndlId,
    buildSectionStarts(
      volumeText,
      sourceRows.filter((row) => row[3] === ndlId),
    ),
  );
}

const records = sourceRows.map(([kingWenNumber, name, traditionalName, ndlId], index) => {
  const text = volumes.get(ndlId);
  const nextInVolume = sourceRows.slice(index + 1).find((row) => row[3] === ndlId);
  const starts = sectionStarts.get(ndlId);
  const start = starts.get(name) ?? findMainStart(text, traditionalName);
  const nextStart = nextInVolume ? (starts.get(nextInVolume[1]) ?? findMainStart(text, nextInVolume[2])) : -1;
  const sectionEnd = nextStart > start ? nextStart : start + 12000;
  const section = excerptFrom(text, start, sectionEnd, 12000);

  const lineStarts = [];
  for (const [lineIndex, aliases] of lineAliases.entries()) {
    const previousStart = lineStarts.length > 0 ? lineStarts[lineStarts.length - 1] : 0;
    const extraAliases = ocrLineAliases[name]?.[lineIndex + 1] ?? [];
    lineStarts.push(findLineStart(section, [...extraAliases, ...aliases], Math.max(0, previousStart + 20)));
  }

  const lines = lineMarkers.map((label, lineIndex) => {
    const lineStart = lineStarts[lineIndex];
    const nextLineStart = lineStarts.slice(lineIndex + 1).find((position) => position > lineStart) ?? -1;
    const lineText = excerptFrom(section, lineStart, nextLineStart, 2200);
    const exampleStart = lineText.indexOf("占例");

    return {
      line: lineIndex + 1,
      label,
      original: lineText,
      caseText: exampleStart >= 0 ? lineText.slice(exampleStart, 2200) : "",
    };
  });

  const firstLineStart = Math.min(...lineStarts.filter((position) => position > 0));
  const judgment = section.slice(0, Number.isFinite(firstLineStart) ? firstLineStart : 2600).slice(0, 2600);

  return {
    kingWenNumber,
    name,
    traditionalName,
    ndlId,
    judgment,
    lines,
  };
});

const output = `import { GaodaoHexagramText } from "@/data/reading";\n\nexport const gaodaoTextDatabase: GaodaoHexagramText[] = ${JSON.stringify(records, null, 2)};\n`;

await writeFile(path.join("data", "gaodao-text.ts"), output);
console.log(`built ${records.length} hexagram records`);
