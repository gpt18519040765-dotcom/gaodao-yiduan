"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { getHexagram, trigrams } from "@/data/gua";

export default function LearnPage() {
  const [upper, setUpper] = useState(1);
  const [lower, setLower] = useState(1);
  const hexagram = useMemo(() => getHexagram(upper, lower), [upper, lower]);

  return (
    <Shell>
      <section className="mx-auto max-w-6xl py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">八卦学习</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">从八卦到六十四卦</h1>
          <p className="mt-4 max-w-3xl leading-7 text-stone-300">
            先记八个基础卦象，再以上卦、下卦相叠，即可组合出六十四卦名称。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trigrams.map((trigram) => (
              <div key={trigram.number} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5">
                <div className="flex items-start justify-between">
                  <span className="gold-text">{trigram.number}</span>
                  <span className="text-5xl text-yellow-100">{trigram.symbol}</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{trigram.name}</h2>
                <p className="mt-2 text-stone-300">自然象：{trigram.nature}</p>
                <p className="mt-1 text-sm text-stone-500">{trigram.quality}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 rounded-[1.5rem] border border-yellow-500/20 bg-yellow-500/10 p-6 md:grid-cols-[1fr_1fr_1.2fr]">
            <SelectGua label="选择上卦" value={upper} onChange={setUpper} />
            <SelectGua label="选择下卦" value={lower} onChange={setLower} />
            <div className="rounded-2xl bg-black/25 p-5">
              <p className="text-stone-400">实时组合后的六十四卦</p>
              <p className="mt-3 text-4xl font-semibold gold-text">{hexagram?.name}</p>
              <p className="mt-4 leading-7 text-stone-300">{hexagram?.explanation}</p>
            </div>
          </div>
        </motion.div>
      </section>
    </Shell>
  );
}

function SelectGua({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex flex-col gap-3 text-stone-300">
      {label}
      <select value={value} onChange={(event) => onChange(Number(event.target.value))} className="rounded-full border border-yellow-500/30 bg-stone-950 px-4 py-3 text-stone-100 outline-none">
        {trigrams.map((trigram) => (
          <option key={trigram.number} value={trigram.number}>
            {trigram.number} · {trigram.name} · {trigram.nature}
          </option>
        ))}
      </select>
    </label>
  );
}
