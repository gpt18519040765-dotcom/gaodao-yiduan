import { gaodaoTextDatabase } from "@/data/gaodao-text";

export type WeightedReadingPart = {
  key: "primary" | "moving" | "changed";
  label: string;
  weight: number;
  description: string;
};

export type GaodaoLineText = {
  line: number;
  label: string;
  original: string;
  caseText: string;
};

export type GaodaoHexagramText = {
  kingWenNumber: number;
  name: string;
  traditionalName: string;
  ndlId: string;
  judgment: string;
  lines: GaodaoLineText[];
};

export const readingWeights: WeightedReadingPart[] = [
  {
    key: "primary",
    label: "本卦",
    weight: 30,
    description: "看事情的当前格局、环境和根本矛盾。",
  },
  {
    key: "moving",
    label: "动爻",
    weight: 51,
    description: "看此事最活跃的变化点、应对重点和实际判断。",
  },
  {
    key: "changed",
    label: "变卦",
    weight: 19,
    description: "看后续趋向和余势，不压过动爻。",
  },
];

export function trimOriginalText(text: string, maxLength = 520) {
  if (!text) return "此段 OCR 尚待校对。";
  return text.length > maxLength ? `${text.slice(0, maxLength)}……` : text;
}

export function getGaodaoText(name: string) {
  return gaodaoTextDatabase.find((item) => item.name === name);
}

export function extractYaoCi(text = "") {
  const beforeCommentary = text.split(/象[傳传][曰日]|象[曰日]/)[0] ?? "";
  return beforeCommentary.replace(/增補高島易斷|增補高島易|高島易斷|高島易/g, "").trim();
}
