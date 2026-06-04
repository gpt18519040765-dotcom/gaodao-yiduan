export type DivinationTopic = {
  label: string;
  description: string;
};

export const divinationTopics: DivinationTopic[] = [
  { label: "问占", description: "综合判断结果和吉凶趋势。" },
  { label: "问天候", description: "看阴晴、雨雪、时令变化。" },
  { label: "问买卖", description: "看买入卖出、价格涨落和交易成败。" },
  { label: "问祸福", description: "看风险、福分、积善积恶的后果。" },
  { label: "问常人", description: "看普通人的处境、性情和日常进退。" },
  { label: "问贤者", description: "看有志有德者的出处、潜伏和进用。" },
  { label: "问战征", description: "看竞争、冲突、攻守和行动时机。" },
  { label: "问营商", description: "看经营、贸易、货物和利润。" },
  { label: "问功名", description: "看职位、名望、考试、升迁和被赏识。" },
  { label: "问婚姻", description: "看匹配、名分、进退和关系成败。" },
  { label: "问家宅", description: "看家庭、居所、内部秩序和修整。" },
  { label: "问六甲", description: "传统用于孕产、生育之占；现代仅作文化文本参考。" },
  { label: "其他", description: "按本卦、动爻、变卦综合判断。" },
];

export function getTopicDescription(topic: string) {
  return divinationTopics.find((item) => item.label === topic)?.description ?? divinationTopics.at(-1)?.description ?? "";
}
