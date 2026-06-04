import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const volumes = [
  { ndlId: "760552", title: "高島易断 上経 元" },
  { ndlId: "760553", title: "高島易断 上経 亨" },
  { ndlId: "760554", title: "高島易断 下経 利" },
  { ndlId: "760555", title: "高島易断 下経 貞" },
];

const outputDir = path.join(process.cwd(), "data", "sources", "ndl");

await mkdir(outputDir, { recursive: true });

for (const volume of volumes) {
  const url = `https://lab.ndl.go.jp/dl/api/book/fulltext-json/${volume.ndlId}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "gaodao-yiduan-dev/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${volume.ndlId}: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const pages = raw.list.map((page) => ({
    page: page.page,
    contents: page.contents,
  }));

  const payload = {
    ...volume,
    source: url,
    fetchedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages,
  };

  await writeFile(path.join(outputDir, `${volume.ndlId}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`saved ${volume.ndlId}: ${pages.length} pages`);
}
