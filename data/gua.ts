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
  row.map((name, lowerIndex) => ({
    upper: upperIndex + 1,
    lower: lowerIndex + 1,
    name,
    explanation:
      explanations[name] ??
      `「${name}」提示你观察上下两股力量的互动：先辨明处境，再选择顺势、守正或暂缓。`,
  })),
);

export function getTrigram(number: number) {
  return trigrams.find((trigram) => trigram.number === number);
}

export function getHexagram(upper: number, lower: number) {
  return hexagrams.find((hexagram) => hexagram.upper === upper && hexagram.lower === lower);
}
