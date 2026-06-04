import { getHexagram, getTrigram, trigramLines } from "@/data/gua";
import { GaodaoHexagramText, GaodaoLineText, getGaodaoText } from "@/data/reading";
import { getSpecialReadings, SpecialReading } from "@/data/special-readings";

export type SplitResult = {
  left: number;
  right: number;
};

export type DivinationDraft = {
  question: string;
  topic: string;
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
  changedUpperNumber: number;
  changedLowerNumber: number;
  changedHexagramName: string;
  explanation: string;
  sourceTitle?: string;
  sourceRange?: string;
  sourceOcrUrl?: string;
  sourcePdfUrl?: string;
  sourceTraditionalName?: string;
  kingWenNumber?: number;
  primaryText?: GaodaoHexagramText;
  movingLineText?: GaodaoLineText;
  changedText?: GaodaoHexagramText;
  specialReadings: SpecialReading[];
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

export function createDivinationDraft(question = "", topic = "问占"): DivinationDraft {
  const upperSplit = splitSticks();
  const lowerSplit = splitSticks();
  const movingSplit = splitSticks();

  return {
    question: question.trim(),
    topic,
    upperNumber: remainderAsNumber(upperSplit.left, 8),
    lowerNumber: remainderAsNumber(lowerSplit.right, 8),
    movingLine: remainderAsNumber(movingSplit.left, 6),
    upperSplit,
    lowerSplit,
    movingSplit,
    createdAt: new Date().toISOString(),
  };
}

function numberFromLines(lines: boolean[]) {
  return (
    Object.entries(trigramLines).find(([, trigramLine]) =>
      trigramLine.every((line, index) => line === lines[index]),
    )?.[0] ?? "1"
  );
}

export function getChangedHexagramNumbers(upperNumber: number, lowerNumber: number, movingLine: number) {
  const lines = [...trigramLines[lowerNumber], ...trigramLines[upperNumber]];
  lines[movingLine - 1] = !lines[movingLine - 1];

  return {
    changedLowerNumber: Number(numberFromLines(lines.slice(0, 3))),
    changedUpperNumber: Number(numberFromLines(lines.slice(3, 6))),
  };
}

export function enrichDivination(draft: DivinationDraft): DivinationResult {
  const upper = getTrigram(draft.upperNumber);
  const lower = getTrigram(draft.lowerNumber);
  const hexagram = getHexagram(draft.upperNumber, draft.lowerNumber);
  const { changedUpperNumber, changedLowerNumber } = getChangedHexagramNumbers(
    draft.upperNumber,
    draft.lowerNumber,
    draft.movingLine,
  );
  const changedHexagram = getHexagram(changedUpperNumber, changedLowerNumber);
  const primaryText = hexagram ? getGaodaoText(hexagram.name) : undefined;

  return {
    ...draft,
    upperName: upper?.name ?? "未知",
    lowerName: lower?.name ?? "未知",
    hexagramName: hexagram?.name ?? "未知本卦",
    changedUpperNumber,
    changedLowerNumber,
    changedHexagramName: changedHexagram?.name ?? "未知变卦",
    explanation: hexagram?.explanation ?? "请重新起卦，以获得更清晰的提示。",
    sourceTitle: hexagram?.source?.volume.title,
    sourceRange: hexagram?.source?.volume.range,
    sourceOcrUrl: hexagram?.source?.volume.ocrUrl,
    sourcePdfUrl: hexagram?.source?.volume.pdfUrl,
    sourceTraditionalName: hexagram?.source?.traditionalName,
    kingWenNumber: hexagram?.source?.kingWenNumber,
    primaryText,
    movingLineText: primaryText?.lines.find((line) => line.line === draft.movingLine),
    changedText: changedHexagram ? getGaodaoText(changedHexagram.name) : undefined,
    specialReadings: hexagram ? getSpecialReadings(hexagram.name) : [],
  };
}
