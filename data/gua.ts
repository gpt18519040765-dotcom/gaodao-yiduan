import { GaodaoHexagramSource, getGaodaoSource } from "@/data/gaodao";

export type Trigram = {
  number: number;
  name: string;
  symbol: string;
  nature: string;
  quality: string;
};

export type Hexagram = {
  upper: number;
  lower: number;
  name: string;
  explanation: string;
  source?: GaodaoHexagramSource;
};

export type TrigramVisual = Trigram & {
  lines: boolean[];
  imageHint: string;
};

export const trigrams: Trigram[] = [
  { number: 1, name: "乾", symbol: "☰", nature: "天", quality: "刚健、开创、主动" },
  { number: 2, name: "兑", symbol: "☱", nature: "泽", quality: "喜悦、沟通、兑现" },
  { number: 3, name: "离", symbol: "☲", nature: "火", quality: "光明、看见、依附" },
  { number: 4, name: "震", symbol: "☳", nature: "雷", quality: "发动、惊醒、突破" },
  { number: 5, name: "巽", symbol: "☴", nature: "风", quality: "进入、顺势、渗透" },
  { number: 6, name: "坎", symbol: "☵", nature: "水", quality: "险阻、智慧、流动" },
  { number: 7, name: "艮", symbol: "☶", nature: "山", quality: "止息、边界、沉稳" },
  { number: 8, name: "坤", symbol: "☷", nature: "地", quality: "承载、包容、成全" },
];

export const trigramLines: Record<number, boolean[]> = {
  1: [true, true, true],
  2: [true, true, false],
  3: [true, false, true],
  4: [true, false, false],
  5: [false, true, true],
  6: [false, true, false],
  7: [false, false, true],
  8: [false, false, false],
};

const trigramImageHints: Record<number, string> = {
  1: "天行健，持续向上、开创、担当。",
  2: "泽有悦，重沟通、兑现、交换。",
  3: "火有明，重看见、依附、辨明。",
  4: "雷发动，重惊醒、启动、突破。",
  5: "风入物，重渗透、顺入、反复沟通。",
  6: "水行险，重风险、流动、智慧。",
  7: "山能止，重边界、沉稳、停下。",
  8: "地承载，重包容、配合、积累。",
};

export function getTrigramLines(number: number) {
  return trigramLines[number] ?? trigramLines[1];
}

export function getTrigramVisual(number: number): TrigramVisual {
  const trigram = getTrigram(number) ?? trigrams[0];

  return {
    ...trigram,
    lines: getTrigramLines(number),
    imageHint: trigramImageHints[number] ?? trigram.quality,
  };
}

const explanations: Record<string, string> = {
  "乾为天": "势能强盛，宜自强不息；但过刚则折，行动前需确认方向。",
  "天泽履": "如履薄冰，守礼而行；谨慎表达，可在压力中稳步前进。",
  "天火同人": "志同道合之象，适合结盟协作；先求共识，再谈推进。",
  "天雷无妄": "顺其正道，不宜妄动；保持真诚，事情自有转机。",
  "天风姤": "偶遇新机，也有突发变量；亲近机会时要看清边界。",
  "天水讼": "有争执与分歧，宜止讼求和；证据、规则与退让同样重要。",
  "天山遁": "退避不是失败，是保存实力；暂缓锋芒，等待更合适的时机。",
  "天地否": "上下不通，阻滞明显；先修内部，再求外部回应。",
};

const matrix = [
  ["乾为天", "天泽履", "天火同人", "天雷无妄", "天风姤", "天水讼", "天山遁", "天地否"],
  ["泽天夬", "兑为泽", "泽火革", "泽雷随", "泽风大过", "泽水困", "泽山咸", "泽地萃"],
  ["火天大有", "火泽睽", "离为火", "火雷噬嗑", "火风鼎", "火水未济", "火山旅", "火地晋"],
  ["雷天大壮", "雷泽归妹", "雷火丰", "震为雷", "雷风恒", "雷水解", "雷山小过", "雷地豫"],
  ["风天小畜", "风泽中孚", "风火家人", "风雷益", "巽为风", "风水涣", "风山渐", "风地观"],
  ["水天需", "水泽节", "水火既济", "水雷屯", "水风井", "坎为水", "水山蹇", "水地比"],
  ["山天大畜", "山泽损", "山火贲", "山雷颐", "山风蛊", "山水蒙", "艮为山", "山地剥"],
  ["地天泰", "地泽临", "地火明夷", "地雷复", "地风升", "地水师", "地山谦", "坤为地"],
];

export const hexagramMatrix: string[][] = matrix;

export const hexagrams: Hexagram[] = matrix.flatMap((row, upperIndex) =>
  row.map((name, lowerIndex) => {
    const source = getGaodaoSource(name);

    return {
      upper: upperIndex + 1,
      lower: lowerIndex + 1,
      name,
      explanation:
        explanations[name] ??
        `已定位《高島易断》原典来源：${source?.volume.title ?? "待校对卷册"}。下一步可依据公版 OCR/扫描逐段整理卦辞、爻辞与高岛断语。`,
      source,
    };
  }),
);

export function getTrigram(number: number) {
  return trigrams.find((trigram) => trigram.number === number);
}

export function getHexagram(upper: number, lower: number) {
  return hexagrams.find((hexagram) => hexagram.upper === upper && hexagram.lower === lower);
}
