import { lessons } from "@/data/learn-course";
import type { DivinationResult } from "@/lib/divination";

export type LearningRecommendation = {
  lessonId: string;
  title: string;
  reason: string;
  action: string;
};

const lineActions: Record<number, { reason: string; action: string; lessonId: string }> = {
  1: {
    lessonId: "quiet-question",
    reason: "动爻在初爻，事情还在开端，最容易因为问题没问清而急着行动。",
    action: "先把事实、担心和真正想问的判断分开写下来，再决定下一步。",
  },
  2: {
    lessonId: "three-parts",
    reason: "动爻在二爻，事情进入执行位置，需要把局面、变化点和后续趋势拆开看。",
    action: "用三句话分别写出本卦、动爻、变卦，不要把所有判断混成一团。",
  },
  3: {
    lessonId: "line-position",
    reason: "动爻在三爻，正处在内外转换处，压力和误判会明显增加。",
    action: "今天先不做激烈决定，列出三个可能的风险和一个可退的余地。",
  },
  4: {
    lessonId: "line-position",
    reason: "动爻在四爻，已经接近关键节点，适合试探，但不适合盲目跃进。",
    action: "先做一次小范围试探，确认上方支持和下方基础都接得住。",
  },
  5: {
    lessonId: "gaodao-method",
    reason: "动爻在五爻，问题触及主位、核心人物或关键决策。",
    action: "找出这件事真正能拍板的人、平台或规则，优先处理核心关系。",
  },
  6: {
    lessonId: "risk-desire",
    reason: "动爻在上爻，事情容易过盛或走到尾声，最需要防止过头生悔。",
    action: "先做止盈止损清单，明确什么情况必须收手或换路径。",
  },
};

const topicLessonIds: Record<string, string> = {
  问占: "three-parts",
  问天候: "eight-symbols",
  问买卖: "risk-desire",
  问祸福: "risk-desire",
  问常人: "quiet-question",
  问贤者: "gaodao-method",
  问战征: "line-position",
  问营商: "risk-desire",
  问功名: "gaodao-method",
  问婚姻: "quiet-question",
  问家宅: "eight-symbols",
  问六甲: "quiet-question",
  其他: "three-parts",
};

function lessonTitle(id: string) {
  return lessons.find((lesson) => lesson.id === id)?.title ?? "学易课程";
}

function makeRecommendation(lessonId: string, reason: string, action: string): LearningRecommendation {
  return {
    lessonId,
    title: lessonTitle(lessonId),
    reason,
    action,
  };
}

export function buildLearningRecommendations(result: DivinationResult, topic: string): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];
  const lineGuide = lineActions[result.movingLine] ?? lineActions[1];
  recommendations.push(makeRecommendation(lineGuide.lessonId, lineGuide.reason, lineGuide.action));

  const topicLessonId = topicLessonIds[topic] ?? "three-parts";
  if (!recommendations.some((item) => item.lessonId === topicLessonId)) {
    recommendations.push(makeRecommendation(
      topicLessonId,
      `你选择的是「${topic}」，这一类问题更需要把判断落到具体行为和风险上。`,
      "读完本卦和动爻后，写下一个今天能做的小动作，而不是只停留在吉凶判断。",
    ));
  }

  if (!recommendations.some((item) => item.lessonId === "gaodao-method")) {
    recommendations.push(makeRecommendation(
      "gaodao-method",
      "本次结果包含《高岛易断》占例，适合学习如何把爻辞落到现实事件。",
      "展开占例，找出其中的所问事项、对应爻辞、判断依据和最终行动。",
    ));
  }

  return recommendations.slice(0, 3);
}
