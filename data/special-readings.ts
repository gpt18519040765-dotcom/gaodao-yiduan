export type SpecialReading = {
  id: string;
  hexagramName: string;
  title: string;
  condition: string;
  original: string;
  plainText: string;
};

export const specialReadings: SpecialReading[] = [
  {
    id: "qian-yong-jiu",
    hexagramName: "乾为天",
    title: "用九",
    condition: "乾卦六爻皆阳时参考。当前三步起卦只取单一动爻，因此默认作为乾卦附加读法展示。",
    original: "见群龙无首，吉。",
    plainText:
      "乾卦极刚，若六阳俱动，重点不在争先称首，而在让众阳各得其位。做事宜共同进退、同心协力，以公正和秩序统领局面；若人人争首，反而破坏乾道的健行。",
  },
];

export function getSpecialReadings(hexagramName: string) {
  return specialReadings.filter((reading) => reading.hexagramName === hexagramName);
}
