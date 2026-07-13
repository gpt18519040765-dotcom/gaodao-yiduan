import Link from "next/link";
import { Shell } from "@/components/Shell";
import { formatTranslationBasis, getHexagramTranslation } from "@/data/gaodao-translations";
import { getHexagram, hexagrams } from "@/data/gua";
import { getPlainHexagramSummary, getPlainLineSummary } from "@/data/plain-reading";
import { extractYaoCi, getGaodaoText, trimOriginalText } from "@/data/reading";

const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

export default async function HexagramLearnPage({ params }: { params: Promise<{ name: string }> }) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  const text = getGaodaoText(name);
  const translation = getHexagramTranslation(name);
  const hexagram = hexagrams.find((item) => item.name === name);

  if (!text && !translation && !hexagram) {
    return (
      <Shell>
        <section className="mx-auto max-w-5xl py-12">
          <div className="ritual-card rounded-[2rem] p-8">
            <p className="gold-text text-sm tracking-[0.35em]">完整卦</p>
            <h1 className="mt-3 text-3xl font-semibold">暂时没有找到「{name}」</h1>
            <p className="mt-4 leading-8 text-stone-300">这条内容可能来自《系辞传》或其他传文，不属于六十四卦详情页。</p>
            <Link href="/learn" className="mt-6 inline-block rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-sm text-yellow-100 hover:bg-yellow-500/25">
              返回学易
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  const pairedHexagram = hexagram ?? getHexagram(1, 1);
  const basis = translation ? formatTranslationBasis(translation.basis) : "《高岛易断》OCR 原文 / 现代白话整理";

  return (
    <Shell>
      <section className="mx-auto max-w-6xl py-12">
        <article className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="gold-text text-sm tracking-[0.35em]">完整卦 · {text?.traditionalName ?? name}</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{name}</h1>
              <p className="mt-5 max-w-3xl leading-8 text-stone-300">{translation?.modernText ?? getPlainHexagramSummary(name)}</p>
            </div>
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-stone-300">
              <p className="gold-text">资料来源</p>
              <p className="mt-3 leading-7">{basis}</p>
              {text ? <p className="mt-2 text-stone-500">高导库序号：{text.kingWenNumber} · NDL {text.ndlId}</p> : null}
            </div>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-stone-700 bg-black/20 p-5">
              <h2 className="text-lg font-semibold gold-text">先看卦意</h2>
              <p className="mt-3 text-sm leading-8 text-stone-300">{getPlainHexagramSummary(name)}</p>
              <p className="mt-4 text-xs leading-6 text-stone-500">
                读卦先看整体气象，再看具体动爻。完整卦页用来帮助用户把一句爻辞放回整件事的阶段里。
              </p>
            </div>
            <div className="rounded-2xl border border-stone-700 bg-stone-950/40 p-5">
              <h2 className="text-lg font-semibold gold-text">原文摘录</h2>
              <p className="mt-3 text-sm leading-8 text-stone-300">{trimOriginalText(text?.judgment ?? "", 1400)}</p>
            </div>
          </section>

          <section className="mt-8 border-t border-yellow-500/20 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="gold-text text-sm tracking-[0.35em]">六爻</p>
                <h2 className="mt-2 text-2xl font-semibold">一爻一阶段，逐层看进退</h2>
              </div>
              <Link href="/divination" className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-center text-sm text-yellow-100 hover:bg-yellow-500/25">
                去问一卦
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {(text?.lines ?? []).map((line) => {
                const lineTranslation = translation?.lines[line.line];
                const plain = getPlainLineSummary(line, "general", name);
                const yaoCi = extractYaoCi(line.original);

                return (
                  <section key={line.line} className="rounded-2xl border border-stone-700 bg-black/20 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-stone-500">{name} · {lineNames[line.line - 1] ?? line.label}</p>
                        <h3 className="mt-1 text-xl font-semibold gold-text">{line.label}：{yaoCi || "爻辞待校"}</h3>
                      </div>
                      <span className="rounded-full border border-stone-600 px-3 py-1 text-xs text-stone-400">第 {line.line} 爻</span>
                    </div>
                    <p className="mt-4 text-sm leading-8 text-stone-300">{lineTranslation?.modernText ?? plain.summary}</p>
                    {lineTranslation?.caseModern ? (
                      <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-yellow-500/10 p-4">
                        <p className="text-sm gold-text">高导占例白话</p>
                        <p className="mt-2 text-sm leading-7 text-stone-300">{lineTranslation.caseModern}</p>
                      </div>
                    ) : null}
                    <details className="mt-4 rounded-2xl border border-stone-800 bg-stone-950/35 p-4">
                      <summary className="cursor-pointer text-sm text-stone-300">查看原文摘录</summary>
                      <p className="mt-3 text-sm leading-8 text-stone-400">{trimOriginalText(line.original, 900)}</p>
                      {line.caseText ? <p className="mt-3 text-sm leading-8 text-stone-500">{trimOriginalText(line.caseText, 520)}</p> : null}
                    </details>
                  </section>
                );
              })}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/learn" className="rounded-full border border-stone-600 px-5 py-3 text-center text-sm text-stone-200 hover:border-yellow-500/40">
              返回学易
            </Link>
            {pairedHexagram ? (
              <Link href="/result" className="rounded-full border border-stone-600 px-5 py-3 text-center text-sm text-stone-200 hover:border-yellow-500/40">
                查看上次卦象
              </Link>
            ) : null}
          </div>
        </article>
      </section>
    </Shell>
  );
}
