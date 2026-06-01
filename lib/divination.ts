import { getHexagram, getTrigram } from "@/data/gua";

export type SplitResult = {
  left: number;
  right: number;
};

export type DivinationDraft = {
  upperNumber: number;
  lowerNumber: number;
  movingLine: number;
  upperSplit: SplitResult;
  lowerSplit: SplitResult;
  movingSplit: SplitResult;
  createdAt: string;
};

export type DivinationResult = DivinationDraft & {
  upperName: string;
  lowerName: string;
  hexagramName: string;
  explanation: string;
};

export const TOTAL_STICKS = 50;
export const DEDICATED_STICKS = 1;
export const ACTIVE_STICKS = 49;

export function splitSticks(total = ACTIVE_STICKS): SplitResult {
  const left = Math.floor(Math.random() * (total - 1)) + 1;
  return { left, right: total - left };
}

export function remainderAsNumber(value: number, divisor: 8 | 6): number {
  const remainder = value % divisor;
  return remainder === 0 ? divisor : remainder;
}

export function createDivinationDraft(): DivinationDraft {
  const upperSplit = splitSticks();
  const lowerSplit = splitSticks();
  const movingSplit = splitSticks();

  return {
    upperNumber: remainderAsNumber(upperSplit.left, 8),
    lowerNumber: remainderAsNumber(lowerSplit.right, 8),
    movingLine: remainderAsNumber(movingSplit.left, 6),
    upperSplit,
    lowerSplit,
    movingSplit,
    createdAt: new Date().toISOString(),
  };
}

export function enrichDivination(draft: DivinationDraft): DivinationResult {
  const upper = getTrigram(draft.upperNumber);
  const lower = getTrigram(draft.lowerNumber);
  const hexagram = getHexagram(draft.upperNumber, draft.lowerNumber);

  return {
    ...draft,
    upperName: upper?.name ?? "未知",
    lowerName: lower?.name ?? "未知",
    hexagramName: hexagram?.name ?? "未知本卦",
    explanation: hexagram?.explanation ?? "请重新起卦，以获得更清晰的提示。",
  };
}
