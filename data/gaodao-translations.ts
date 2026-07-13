import gaodaoDraftTranslations from "@/data/sources/translation-workbench/gaodao-translation-drafts.json";

export type TranslationBasis = "ndl-japanese-kanbun" | "qing-classical" | "editorial-modern";

export type GaodaoLineTranslation = {
  line: number;
  modernText: string;
  caseModern?: string;
  basis: TranslationBasis[];
  status: "draft" | "reviewed";
};

export type GaodaoHexagramTranslation = {
  name: string;
  modernText: string;
  basis: TranslationBasis[];
  status: "draft" | "reviewed";
  lines: Record<number, GaodaoLineTranslation>;
};

type DraftLineTranslation = {
  line: number;
  modernDraft: string;
  caseModernDraft?: string;
  status: "todo" | "draft" | "reviewed";
};

type DraftHexagramTranslation = {
  name: string;
  modernDraft: string;
  status: "todo" | "draft" | "reviewed";
  lines: DraftLineTranslation[];
};

const basisLabels: Record<TranslationBasis, string> = {
  "ndl-japanese-kanbun": "日文汉文 OCR 原文",
  "qing-classical": "清代文言本待校",
  "editorial-modern": "现代白话译写",
};

export const gaodaoTranslationDatabase: GaodaoHexagramTranslation[] = [
  {
    name: "乾为天",
    status: "draft",
    basis: ["ndl-japanese-kanbun", "editorial-modern"],
    modernText:
      "乾为天，六爻皆阳，象征天道刚健、元气充足、不断运行。占到此卦，事情的底色是主动、开创、担当和上升，但成败不只看力量大小，更看能否守正、审时、知进退。元亨利贞不是单纯的大吉，而是提醒人以仁为始、以礼通达、以义取利、以正守成。若刚健而不偏激，能用公正明白的方式行事，则可成大事；若自恃强盛、压人凌弱，则会由盛转悔。",
    lines: {
      1: {
        line: 1,
        status: "draft",
        basis: ["ndl-japanese-kanbun", "editorial-modern"],
        modernText:
          "初九是“潜龙勿用”。龙德还藏在下方，才气和力量已有，但外部时机未到。此时不宜急着表现、争名、强推大事，宜收敛锋芒、积蓄能力、等待真正可用之时。若问事业，多为暂居幕后；若问关系，宜柔顺低调；若问风险，忌因急于证明自己而招来疑忌。",
        caseModern:
          "占例讲一位有武功与学问的人，虽有才能，却暂时不宜出头任事。判断重点不在“永远不用”，而在“时未至”。若能藏光养晦，以柔顺补刚直，待下一阶段气运到来，仍有上升机会。",
      },
      2: {
        line: 2,
        status: "draft",
        basis: ["ndl-japanese-kanbun", "editorial-modern"],
        modernText:
          "九二是“见龙在田，利见大人”。龙已经离开潜藏之地，才德开始被人看见，但位置仍在田野，尚未登上主位。此时最要紧的是接近有德有位的人，借助正当平台、贵人、制度和合作关系推进事情。问买卖，宜见客户和资源方；问功名，宜求引荐；问婚姻，多有遇见合适对象之象。",
        caseModern:
          "占例中，高岛以此爻看自己出狱后重整事业，又以此爻断两国议和须由双方重要人物相见。其核心是：事情要成，必须有能代表大局的人出现并相互接触。",
      },
      3: {
        line: 3,
        status: "draft",
        basis: ["ndl-japanese-kanbun", "editorial-modern"],
        modernText:
          "九三是“君子终日乾乾，夕惕若，厉无咎”。这里处在内卦将尽、外卦未入的交界，责任加重，压力也容易上来。白天勤勉不懈，夜晚仍要警醒反省，虽然有危险，但可免大错。问事多主劳心劳力、进退紧张；关键不是求轻松，而是用谨慎和持续行动化解风险。",
        caseModern:
          "占例以此爻断年成，认为有旱热之象，但因能照田成熟，所以虽有忧惧，结果仍可无咎。用到人事上，就是辛苦、焦灼未必等于失败，守住节奏反而能成。",
      },
      4: {
        line: 4,
        status: "draft",
        basis: ["ndl-japanese-kanbun", "editorial-modern"],
        modernText:
          "九四是“或跃在渊，无咎”。已经到了可以跃升的边缘，但仍在渊边，进退未定。此爻最重观察时机：可动，但不可盲动；可试探，但不可一跃无回。问事业是临近机会、岗位或关键节点；问家宅与计划，则需先看环境和阻隔，预作布置。能审时而动，则无咎。",
        caseModern:
          "占例多从“可进但须待势”来断：见到机会时不要迟疑太久，也不要在条件不足时硬冲。越接近关键位置，越要判断上方是否接纳、下方是否稳固。",
      },
      5: {
        line: 5,
        status: "draft",
        basis: ["ndl-japanese-kanbun", "editorial-modern"],
        modernText:
          "九五是“飞龙在天，利见大人”。此为乾卦最盛之位，德与位相称，才能上达，格局展开。问事业、功名、合作，多主得平台、得贵人、得上级认可，适合推进大事。此爻虽吉，也要求以公心、正道、长远利益行事；若只是借势自利，反会折损乾德。",
        caseModern:
          "占例中用此爻断外交、铁路等大事，重点在“大人相见、德位相应、公共事业可成”。它不是小聪明之吉，而是大格局、大责任之吉。",
      },
      6: {
        line: 6,
        status: "draft",
        basis: ["ndl-japanese-kanbun", "editorial-modern"],
        modernText:
          "上九是“亢龙有悔”。龙飞得太高，气势过满，已经越过合适的位置。占到此爻，最忌只进不退、只强不收、只顾眼前胜势。问财宜止盈，问名宜收敛，问争执宜退让，问病与风险宜早作处置。能见高而知危，及时回头，反可保全后局。",
        caseModern:
          "占例强调盛极必衰、过高必危。若人在高位、事在过满之时，还继续强推，容易招悔；若能因悔而改、见机而退，仍可留住名位与余势。",
      },
    },
  },
];

export function getHexagramTranslation(name: string) {
  const reviewed = gaodaoTranslationDatabase.find((item) => item.name === name);
  if (reviewed) return reviewed;

  const draft = (gaodaoDraftTranslations.hexagrams as DraftHexagramTranslation[]).find((item) => item.name === name);
  if (!draft?.modernDraft) return undefined;

  return {
    name: draft.name,
    status: draft.status === "reviewed" ? "reviewed" : "draft",
    basis: ["ndl-japanese-kanbun", "editorial-modern"],
    modernText: draft.modernDraft,
    lines: Object.fromEntries(
      draft.lines
        .filter((line) => line.modernDraft)
        .map((line) => [
          line.line,
          {
            line: line.line,
            status: line.status === "reviewed" ? "reviewed" : "draft",
            basis: ["ndl-japanese-kanbun", "editorial-modern"],
            modernText: line.modernDraft,
            caseModern: line.caseModernDraft,
          },
        ]),
    ),
  } satisfies GaodaoHexagramTranslation;
}

export function getLineTranslation(name: string, line: number | undefined) {
  if (!line) return undefined;
  return getHexagramTranslation(name)?.lines[line];
}

export function formatTranslationBasis(basis: TranslationBasis[]) {
  return basis.map((item) => basisLabels[item]).join(" / ");
}
