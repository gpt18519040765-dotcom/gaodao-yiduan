import { getPlainHexagramSummary, getPlainLineSummary } from "@/data/plain-reading";
import { getHexagramTranslation, getLineTranslation } from "@/data/gaodao-translations";
import { readingWeights, trimOriginalText } from "@/data/reading";
import { getTopicDescription } from "@/data/topics";
import { DivinationResult } from "@/lib/divination";

export type ReadingContext = {
  topic: string;
  topicDescription: string;
  headline: string;
  weightedSummary: {
    label: string;
    weight: number;
    summary: string;
  }[];
  modelPrompt: string;
};

export function buildReadingContext(result: DivinationResult, topic: string): ReadingContext {
  const movingPlain = getPlainLineSummary(result.movingLineText, topic, result.hexagramName);
  const primaryTranslation = getHexagramTranslation(result.hexagramName);
  const movingTranslation = getLineTranslation(result.hexagramName, result.movingLine);
  const changedTranslation = getHexagramTranslation(result.changedHexagramName);
  const primarySummary = primaryTranslation?.modernText ?? getPlainHexagramSummary(result.hexagramName);
  const changedSummary = changedTranslation?.modernText ?? getPlainHexagramSummary(result.changedHexagramName);
  const topicDescription = getTopicDescription(topic);

  const weightedSummary = [
    {
      label: "本卦",
      weight: readingWeights.find((item) => item.key === "primary")?.weight ?? 30,
      summary: primarySummary,
    },
    {
      label: "动爻",
      weight: readingWeights.find((item) => item.key === "moving")?.weight ?? 51,
      summary: movingTranslation?.modernText ?? movingPlain.summary,
    },
    {
      label: "变卦",
      weight: readingWeights.find((item) => item.key === "changed")?.weight ?? 19,
      summary: changedSummary,
    },
  ];

  const sourceParts = [
    `所问事项：${result.question || "未填写"}`,
    `事情类型：${topic}（${topicDescription}）`,
    `本卦：${result.hexagramName}。白话：${primarySummary}`,
    `动爻：${result.movingLine}爻。爻辞：${movingPlain.yaoCi || "待校对"}。白话：${movingTranslation?.modernText ?? movingPlain.summary}`,
    `变卦：${result.changedHexagramName}。白话：${changedSummary}`,
    `本卦原文摘录：${trimOriginalText(result.primaryText?.judgment ?? "", 360)}`,
    `动爻原文摘录：${trimOriginalText(result.movingLineText?.original ?? "", 360)}`,
    `动爻占例摘录：${trimOriginalText(result.movingLineText?.caseText ?? "", 360)}`,
    `变卦原文摘录：${trimOriginalText(result.changedText?.judgment ?? "", 360)}`,
  ];

  return {
    topic,
    topicDescription,
    headline: `${result.hexagramName} ${result.movingLine}爻动，之 ${result.changedHexagramName}`,
    weightedSummary,
    modelPrompt: [
      "请按《高岛易断》的阅读顺序整理这次事件：先读本卦，再读动爻，最后读变卦。",
      "权重为本卦30%、动爻51%、变卦19%。输出应先给简明判断，再说明风险、机会和建议行动。",
      ...sourceParts,
    ].join("\n"),
  };
}
