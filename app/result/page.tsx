"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Shell } from "@/components/Shell";
import { DivinationDraft, DivinationResult, enrichDivination } from "@/lib/divination";

const topics = ["事业", "感情", "财运", "家庭", "健康", "学业", "其他"];
const currentDraftKey = "gaodao-current-divination";

function subscribeToStoredDraft(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredDraftSnapshot() {
  return localStorage.getItem(currentDraftKey);
}

export default function ResultPage() {
  const [topic, setTopic] = useState(topics[0]);
  const [saved, setSaved] = useState(false);
  const draftSnapshot = useSyncExternalStore(subscribeToStoredDraft, getStoredDraftSnapshot, () => null);
  const draft = useMemo(() => (draftSnapshot ? (JSON.parse(draftSnapshot) as DivinationDraft) : null), [draftSnapshot]);
  const result: DivinationResult | null = useMemo(() => (draft ? enrichDivination(draft) : null), [draft]);

  function saveRecord() {
    if (!result) return;
    const raw = localStorage.getItem("gaodao-divination-records");
    const records = raw ? JSON.parse(raw) : [];
    records.unshift({ ...result, topic, savedAt: new Date().toISOString() });
    localStorage.setItem("gaodao-divination-records", JSON.stringify(records));
    setSaved(true);
  }

  return (
    <Shell>
      <section className="mx-auto max-w-5xl py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">观象成卦</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">本次起卦结果</h1>

          {!result ? (
            <div className="mt-10 rounded-2xl border border-yellow-500/20 p-6 text-stone-300">
              尚未发现起卦记录。请先完成三步起卦。
              <Link href="/divination" className="gold-text ml-2 underline">前往起卦</Link>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ResultCard label="上卦数字" value={`${result.upperNumber} · ${result.upperName}`} />
                <ResultCard label="下卦数字" value={`${result.lowerNumber} · ${result.lowerName}`} />
                <ResultCard label="动爻数字" value={`${result.movingLine} 爻动`} />
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
                <p className="text-stone-400">对应八卦名称</p>
                <p className="mt-2 text-2xl gold-text">上 {result.upperName} · 下 {result.lowerName}</p>
                <p className="mt-6 text-stone-400">本卦名称</p>
                <h2 className="mt-2 text-4xl font-semibold">{result.hexagramName}</h2>
                <p className="mt-5 leading-8 text-stone-300">{result.explanation}</p>
              </div>

              <div className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-stone-700 bg-stone-950/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex flex-col gap-2 text-stone-300">
                  事情类型选择
                  <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-full border border-yellow-500/30 bg-stone-950 px-4 py-3 text-stone-100 outline-none">
                    {topics.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <button type="button" onClick={saveRecord} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-yellow-100 hover:bg-yellow-500/25">
                  {saved ? "已保存到本地" : "保存本次记录"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </section>
    </Shell>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
      <p className="text-sm text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
