import type { DivinationResult } from "@/lib/divination";

export type DivinationAnalysis = {
  provider: "openai" | "rule";
  summary: string;
  risk: string;
  opportunity: string;
  action: string;
  createdAt: string;
};

function fallbackAnalysis(input: { topic: string; question?: string; result: DivinationResult; modelPrompt: string }): DivinationAnalysis {
  const { topic, question, result } = input;
  const questionText = question ? `所问事项是「${question}」。` : "";

  return {
    provider: "rule",
    summary: `${questionText}本次为「${topic}」，卦象是 ${result.hexagramName}，${result.movingLine} 爻动，之 ${result.changedHexagramName}。先按本卦看当前格局，再以动爻判断主要变化点，最后用变卦看后续走势。`,
    risk: "风险主要在动爻所提示的位置：如果当前行动过急、位置不稳，容易把可控问题推成失控问题。",
    opportunity: "机会在于顺着卦象的变化点调整节奏。先把眼前最活跃的矛盾处理好，再考虑扩大行动。",
    action: "建议先确认事实和边界，再做小步推进；遇到阻力时优先修正策略，不急于强推结果。",
    createdAt: new Date().toISOString(),
  };
}

function extractOutputText(payload: { output_text?: string; output?: unknown[] }) {
  if (payload.output_text) return payload.output_text;

  const output = payload.output ?? [];
  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item)) continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const contentItem of content) {
      if (contentItem && typeof contentItem === "object" && "text" in contentItem) {
        const text = (contentItem as { text?: unknown }).text;
        if (typeof text === "string") parts.push(text);
      }
    }
  }
  return parts.join("\n").trim();
}

function parseAnalysis(text: string, fallback: DivinationAnalysis): DivinationAnalysis {
  try {
    const parsed = JSON.parse(text) as Partial<DivinationAnalysis>;
    return {
      provider: "openai",
      summary: parsed.summary?.trim() || fallback.summary,
      risk: parsed.risk?.trim() || fallback.risk,
      opportunity: parsed.opportunity?.trim() || fallback.opportunity,
      action: parsed.action?.trim() || fallback.action,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return {
      provider: "openai",
      summary: text.trim() || fallback.summary,
      risk: fallback.risk,
      opportunity: fallback.opportunity,
      action: fallback.action,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function generateDivinationAnalysis(input: {
  topic: string;
  question?: string;
  result: DivinationResult;
  modelPrompt: string;
}): Promise<DivinationAnalysis> {
  const fallback = fallbackAnalysis(input);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) return fallback;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.1",
        instructions:
          "你是高岛易断应用的分析助手。只输出 JSON，字段为 summary、risk、opportunity、action。中文回答，简明、克制，不做绝对化预测。",
        input: input.modelPrompt,
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    });

    if (!response.ok) return fallback;
    const payload = await response.json();
    return parseAnalysis(extractOutputText(payload), fallback);
  } catch {
    return fallback;
  }
}
