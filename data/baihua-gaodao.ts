import baihuaGaodaoIndex from "@/data/sources/pdfs/gaodao-baihua-hexagrams.json";

type BaihuaLineSection = {
  marker: string;
  text: string;
};

type BaihuaHexagram = {
  name: string;
  bookPageStart: number;
  bookPageEnd: number;
  text: string;
  lineSections: BaihuaLineSection[];
};

const lineMarkers: Record<number, string[]> = {
  1: ["初九", "初六"],
  2: ["九二", "六二"],
  3: ["九三", "六三"],
  4: ["九四", "六四"],
  5: ["九五", "六五"],
  6: ["上九", "上六"],
};

const hexagrams = baihuaGaodaoIndex.hexagrams as BaihuaHexagram[];

export function getBaihuaHexagramText(name: string) {
  return hexagrams.find((item) => item.name === name);
}

export function getBaihuaLineText(name: string, line: number | undefined) {
  if (!line) return undefined;
  const hexagram = getBaihuaHexagramText(name);
  const markers = lineMarkers[line] ?? [];
  return hexagram?.lineSections.find((section) => markers.includes(section.marker));
}

export function formatBaihuaSource(hexagram: BaihuaHexagram | undefined) {
  if (!hexagram) return undefined;
  return `白话高岛易断 PDF OCR，第 ${hexagram.bookPageStart}-${hexagram.bookPageEnd} 页`;
}

const topicAliases: Record<string, string[]> = {
  问占: ["问占"],
  问天候: ["问天候", "问天气"],
  问买卖: ["问买卖", "问商业", "问经商", "问营商"],
  问祸福: ["问祸福"],
  问常人: ["问常人"],
  问贤者: ["问贤者", "问贤人"],
  问战征: ["问战征", "问征战", "问战争"],
  问营商: ["问营商", "问经商", "问商业", "问买卖"],
  问功名: ["问功名"],
  问婚姻: ["问婚姻"],
  问家宅: ["问家宅"],
  问六甲: ["问六甲", "问胎孕", "问生产"],
  其他: [],
};

const stopTopicLabels = [
  ...Object.values(topicAliases).flat(),
  "问疾病",
  "问失物",
  "问讼事",
  "问诉讼",
  "问胎孕",
  "问生产",
  "问官禄",
  "问旅行",
  "问行人",
  "问迁移",
  "问谋事",
  "问求财",
  "问学业",
  "问考试",
  "问出行",
  "问捕盗",
];

function normalizeForTopic(text: string) {
  return text.replace(/\s+/g, "").replace(/交/g, "爻");
}

function normalizeBaihuaDisplay(text: string) {
  return text
    .replace(/交辞/g, "爻辞")
    .replace(/([初二三四五六上九])交/g, "$1爻")
    .replace(/([初二三四五六上九])爻/g, "$1爻");
}

function excerptByAlias(text: string, alias: string) {
  const normalized = normalizeForTopic(text);
  const labels = Array.from(new Set(stopTopicLabels)).filter(Boolean).sort((a, b) => b.length - a.length);
  const escapedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`(?:○)?${alias}[：:]`);
  const match = normalized.match(pattern);

  if (match?.index === undefined) return undefined;

  const start = match.index;
  const rest = normalized.slice(start);
  const nextPattern = new RegExp(`(?:○)?(?:${escapedLabels})[：:]|\\[活断实例\\]|【活断实例】|活断实例|\\[占例\\]|【占例】|占例[)）]`, "g");
  let end = rest.length;

  for (const next of rest.matchAll(nextPattern)) {
    if ((next.index ?? 0) > 0) {
      end = next.index ?? end;
      break;
    }
  }

  return normalizeBaihuaDisplay(rest.slice(0, end).replace(/^○/, ""));
}

export function getBaihuaTopicReading(sectionText: string | undefined, topic: string) {
  if (!sectionText) return undefined;
  const aliases = topicAliases[topic] ?? [];

  for (const alias of aliases) {
    const excerpt = excerptByAlias(sectionText, alias);
    if (excerpt) {
      return {
        matchedTopic: alias,
        text: excerpt,
      };
    }
  }

  return undefined;
}

export function getBaihuaTopicReadings(sectionText: string | undefined, topics: string[]) {
  return Object.fromEntries(
    topics
      .map((topic) => [topic, getBaihuaTopicReading(sectionText, topic)] as const)
      .filter(([, reading]) => Boolean(reading)),
  );
}

export function getBaihuaCaseText(sectionText: string | undefined) {
  if (!sectionText) return undefined;

  const markers = ["[活断实例]", "【活断实例】", "活断实例", "[占例]", "【占例】", "（占例）", "(占例)", "占例)"];
  const starts = markers
    .map((marker) => sectionText.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);

  if (starts.length === 0) return undefined;

  return normalizeBaihuaDisplay(sectionText.slice(starts[0]).trim());
}
