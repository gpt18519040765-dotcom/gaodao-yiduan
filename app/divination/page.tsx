"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { ActionButton } from "@/components/PrimaryButton";
import { ACTIVE_STICKS, createDivinationDraft, DEDICATED_STICKS, DivinationDraft, TOTAL_STICKS } from "@/lib/divination";

const steps = ["静置一心", "第一次分木棍", "第二次分木棍", "第三次定动爻"];

export default function DivinationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DivinationDraft | null>(null);

  const sticks = useMemo(() => Array.from({ length: ACTIVE_STICKS }, (_, index) => index), []);

  function nextStep() {
    if (step === 0) {
      setDraft(createDivinationDraft());
      setStep(1);
      return;
    }
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    if (draft) {
      localStorage.setItem("gaodao-current-divination", JSON.stringify(draft));
      router.push("/result");
    }
  }

  const split = step === 1 ? draft?.upperSplit : step === 2 ? draft?.lowerSplit : step === 3 ? draft?.movingSplit : null;
  const number = step === 1 ? draft?.upperNumber : step === 2 ? draft?.lowerNumber : step === 3 ? draft?.movingLine : null;

  return (
    <Shell>
      <section className="mx-auto max-w-6xl py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="gold-text text-sm tracking-[0.4em]">蓍草起卦 MVP</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">三步分木棍</h1>
              <p className="mt-4 max-w-2xl leading-7 text-stone-300">
                初始 {TOTAL_STICKS} 根木棍，横置 {DEDICATED_STICKS} 根象征“一心一意”，其余 {ACTIVE_STICKS} 根参与起卦。
                当前版本按男性规则：第一次取左手除以 8，第二次取右手除以 8，第三次取左手除以 6。
              </p>
            </div>
            <ActionButton onClick={nextStep}>{step === 0 ? "开始第一次分木棍" : step === 3 ? "查看结果" : "进入下一次分木棍"}</ActionButton>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {steps.map((label, index) => (
              <div key={label} className={`rounded-2xl border p-4 ${index === step ? "border-yellow-400/70 bg-yellow-500/10" : "border-stone-700 bg-stone-950/30"}`}>
                <p className="gold-text text-xs">第 {index + 1} 阶段</p>
                <p className="mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-yellow-500/15 bg-black/20 p-5">
            <div className="mb-7 flex justify-center">
              <motion.div layout className="stick stick-horizontal" title="一心一意" />
            </div>
            {split ? (
              <div className="grid gap-6 md:grid-cols-2">
                <StickGroup title="左手" count={split.left} highlight={step === 1 || step === 3} />
                <StickGroup title="右手" count={split.right} highlight={step === 2} />
              </div>
            ) : (
              <div className="flex min-h-56 flex-wrap items-center justify-center gap-2">
                {sticks.map((stick) => <motion.div key={stick} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stick * 0.006 }} className="stick" />)}
              </div>
            )}
          </div>

          {split && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-yellow-500/10 p-5 text-stone-200">
              <p>本次分得：左手 {split.left} 根，右手 {split.right} 根。</p>
              <p className="mt-2 gold-text text-xl">得到数字：{number}</p>
            </motion.div>
          )}
        </motion.div>
      </section>
    </Shell>
  );
}

function StickGroup({ title, count, highlight }: { title: string; count: number; highlight: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-yellow-400/50" : "border-stone-700"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium">{title}</h2>
        <span className="gold-text">{count} 根</span>
      </div>
      <div className="flex min-h-44 flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, index) => <motion.div key={index} layout className="stick" />)}
      </div>
    </div>
  );
}
