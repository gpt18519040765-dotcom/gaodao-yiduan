export type GaodaoVolume = {
  ndlId: string;
  title: string;
  range: string;
  ocrUrl: string;
  pdfUrl: string;
};

export type GaodaoHexagramSource = {
  kingWenNumber: number;
  canonicalName: string;
  traditionalName: string;
  volume: GaodaoVolume;
};

export const gaodaoVolumes: Record<string, GaodaoVolume> = {
  "760552": {
    ndlId: "760552",
    title: "高島易断 上経 元",
    range: "乾为天 至 雷地豫",
    ocrUrl: "https://lab.ndl.go.jp/dl/api/book/fulltext-json/760552",
    pdfUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bc/NDL760552_%E9%AB%98%E5%B3%B6%E6%98%93%E6%96%AD_%E4%B8%8A%E7%B5%8C_%E5%85%83_part1.pdf",
  },
  "760553": {
    ndlId: "760553",
    title: "高島易断 上経 亨",
    range: "泽雷随 至 离为火",
    ocrUrl: "https://lab.ndl.go.jp/dl/api/book/fulltext-json/760553",
    pdfUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/NDL760553_%E9%AB%98%E5%B3%B6%E6%98%93%E6%96%AD_%E4%B8%8A%E7%B5%8C_%E4%BA%A8_part1.pdf",
  },
  "760554": {
    ndlId: "760554",
    title: "高島易断 下経 利",
    range: "泽山咸 至 水风井",
    ocrUrl: "https://lab.ndl.go.jp/dl/api/book/fulltext-json/760554",
    pdfUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/60/NDL760554_%E9%AB%98%E5%B3%B6%E6%98%93%E6%96%AD_%E4%B8%8B%E7%B5%8C_%E5%88%A9_part1.pdf",
  },
  "760555": {
    ndlId: "760555",
    title: "高島易断 下経 貞",
    range: "泽火革 至 火水未济",
    ocrUrl: "https://lab.ndl.go.jp/dl/api/book/fulltext-json/760555",
    pdfUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/46/NDL760555_%E9%AB%98%E5%B3%B6%E6%98%93%E6%96%AD_%E4%B8%8B%E7%B5%8C_%E8%B2%9E_part1.pdf",
  },
};

const sourceRows = [
  [1, "乾为天", "乾爲天", "760552"],
  [2, "坤为地", "坤爲地", "760552"],
  [3, "水雷屯", "水雷屯", "760552"],
  [4, "山水蒙", "山水蒙", "760552"],
  [5, "水天需", "水天需", "760552"],
  [6, "天水讼", "天水訟", "760552"],
  [7, "地水师", "地水師", "760552"],
  [8, "水地比", "水地比", "760552"],
  [9, "风天小畜", "風天小畜", "760552"],
  [10, "天泽履", "天澤履", "760552"],
  [11, "地天泰", "地天泰", "760552"],
  [12, "天地否", "天地否", "760552"],
  [13, "天火同人", "天火同人", "760552"],
  [14, "火天大有", "火天大有", "760552"],
  [15, "地山谦", "地山謙", "760552"],
  [16, "雷地豫", "雷地豫", "760552"],
  [17, "泽雷随", "澤雷隨", "760553"],
  [18, "山风蛊", "山風蠱", "760553"],
  [19, "地泽临", "地澤臨", "760553"],
  [20, "风地观", "風地觀", "760553"],
  [21, "火雷噬嗑", "火雷噬嗑", "760553"],
  [22, "山火贲", "山火賁", "760553"],
  [23, "山地剥", "山地剝", "760553"],
  [24, "地雷复", "地雷復", "760553"],
  [25, "天雷无妄", "天雷无妄", "760553"],
  [26, "山天大畜", "山天大畜", "760553"],
  [27, "山雷颐", "山雷頤", "760553"],
  [28, "泽风大过", "澤風大過", "760553"],
  [29, "坎为水", "坎爲水", "760553"],
  [30, "离为火", "離爲火", "760553"],
  [31, "泽山咸", "澤山咸", "760554"],
  [32, "雷风恒", "雷風恒", "760554"],
  [33, "天山遁", "天山遯", "760554"],
  [34, "雷天大壮", "雷天大壯", "760554"],
  [35, "火地晋", "火地晉", "760554"],
  [36, "地火明夷", "地火明夷", "760554"],
  [37, "风火家人", "風火家人", "760554"],
  [38, "火泽睽", "火澤睽", "760554"],
  [39, "水山蹇", "水山蹇", "760554"],
  [40, "雷水解", "雷水解", "760554"],
  [41, "山泽损", "山澤損", "760554"],
  [42, "风雷益", "風雷益", "760554"],
  [43, "泽天夬", "澤天夬", "760554"],
  [44, "天风姤", "天風姤", "760554"],
  [45, "泽地萃", "澤地萃", "760554"],
  [46, "地风升", "地風升", "760554"],
  [47, "泽水困", "澤水困", "760554"],
  [48, "水风井", "水風井", "760554"],
  [49, "泽火革", "澤火革", "760555"],
  [50, "火风鼎", "火風鼎", "760555"],
  [51, "震为雷", "震爲雷", "760555"],
  [52, "艮为山", "艮爲山", "760555"],
  [53, "风山渐", "風山漸", "760555"],
  [54, "雷泽归妹", "雷澤歸妹", "760555"],
  [55, "雷火丰", "雷火豐", "760555"],
  [56, "火山旅", "火山旅", "760555"],
  [57, "巽为风", "巽爲風", "760555"],
  [58, "兑为泽", "兌爲澤", "760555"],
  [59, "风水涣", "風水渙", "760555"],
  [60, "水泽节", "水澤節", "760555"],
  [61, "风泽中孚", "風澤中孚", "760555"],
  [62, "雷山小过", "雷山小過", "760555"],
  [63, "水火既济", "水火既濟", "760555"],
  [64, "火水未济", "火水未濟", "760555"],
] as const;

export const gaodaoHexagramSources: GaodaoHexagramSource[] = sourceRows.map(
  ([kingWenNumber, canonicalName, traditionalName, ndlId]) => ({
    kingWenNumber,
    canonicalName,
    traditionalName,
    volume: gaodaoVolumes[ndlId],
  }),
);

export function getGaodaoSource(canonicalName: string) {
  return gaodaoHexagramSources.find((source) => source.canonicalName === canonicalName);
}
