"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MotionCard } from "@/components/MotionPrimitives";
import { Shell } from "@/components/Shell";
import { ActionButton } from "@/components/PrimaryButton";
import { ConsultationFloat } from "@/components/ConsultationFloat";
import { TrigramIcon } from "@/components/TrigramIcon";
import { getTrigramVisual } from "@/data/gua";
import { divinationTopics } from "@/data/topics";
import { ACTIVE_STICKS, createDivinationDraft, DEDICATED_STICKS, DivinationDraft, TOTAL_STICKS } from "@/lib/divination";

const steps = ["静置一心", "第一次分蓍草", "第二次分蓍草", "第三次定动爻"];

const stepHints = [
  "先把问题与分类确认清楚，再开始分蓍草。",
  "第一次取左手数，定上卦，象事情外部形势。",
  "第二次取右手数，定下卦，象事情内部根基。",
  "第三次再取左手数，定动爻，找出最活跃的变化点。",
];

const processLabels = [
  { title: "第一次", target: "取左手数，除以 8 定上卦" },
  { title: "第二次", target: "取右手数，除以 8 定下卦" },
  { title: "第三次", target: "取左手数，除以 6 定动爻" },
];

export default function DivinationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState(divinationTopics[0].label);
  const [question, setQuestion] = useState("");
  const [draft, setDraft] = useState<DivinationDraft | null>(null);

  const yarrowStalks = useMemo(() => Array.from({ length: ACTIVE_STICKS }, (_, index) => index), []);

  function nextStep() {
    if (step === 0) {
      setDraft(createDivinationDraft(question, topic));
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
  const activeProcess = step > 0 ? processLabels[step - 1] : null;
  const upperTrigram = draft ? getTrigramVisual(draft.upperNumber) : null;
  const lowerTrigram = draft ? getTrigramVisual(draft.lowerNumber) : null;

  return (
    <Shell>
      <section className="mx-auto max-w-6xl py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="gold-text text-sm tracking-[0.4em]">蓍草起卦 MVP</p>
              <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">三步分蓍草</h1>
              <p className="mt-4 max-w-2xl leading-7 text-stone-300">
                初始 {TOTAL_STICKS} 根蓍草，横置 {DEDICATED_STICKS} 根象征“一心一意”，其余 {ACTIVE_STICKS} 根参与起卦。
                当前版本按男性规则：第一次取左手除以 8，第二次取右手除以 8，第三次取左手除以 6。
              </p>
            </div>
            <ActionButton onClick={nextStep}>{step === 0 ? "开始第一次分蓍草" : step === 3 ? "查看结果" : "进入下一次分蓍草"}</ActionButton>
          </div>

          <div className="mt-8 grid gap-5 rounded-[1.5rem] border border-yellow-500/20 bg-stone-950/35 p-5">
            <label className="grid gap-3 text-stone-300">
              先选分类
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                disabled={step > 0}
                className="input-field"
              >
                {divinationTopics.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label} - {item.description}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-3 text-stone-300">
              再写细节
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={step > 0}
                rows={3}
                maxLength={240}
                placeholder="例如：我现在是否应该继续推进这个项目？"
                className="input-field resize-none"
              />
            </label>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {steps.map((label, index) => (
              <motion.div
                key={label}
                animate={{ y: index === step ? -3 : 0, scale: index === step ? 1.015 : 1 }}
                className={`rounded-2xl border p-4 ${
                  index === step ? "border-yellow-400/70 bg-yellow-500/10 shadow-lg shadow-yellow-950/20" : "border-stone-700 bg-stone-950/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="gold-text text-xs">第 {index + 1} 阶段</p>
                  <span className={`h-2 w-2 rounded-full ${index === step ? "bg-yellow-300" : index < step ? "bg-emerald-300/70" : "bg-stone-700"}`} />
                </div>
                <p className="mt-1 font-medium">{label}</p>
                <p className="mt-2 text-xs leading-5 text-stone-500">{stepHints[index]}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-yellow-500/15 bg-black/20 p-5">
            <div className="mb-7 flex justify-center">
              <motion.div layout className="yarrow yarrow-horizontal" title="一心一意" />
            </div>
            <AnimatePresence mode="wait">
              {split ? (
                <motion.div key={`split-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <SplitFlow left={split.left} right={split.right} step={step} />
                    <div className="mt-5 grid gap-6 md:grid-cols-2">
                      <YarrowGroup title="左手" count={split.left} highlight={step === 1 || step === 3} side="left" />
                      <YarrowGroup title="右手" count={split.right} highlight={step === 2} side="right" />
                    </div>
                  </div>
                  <MotionCard key={`process-${step}`} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                    <p className="gold-text text-sm">{activeProcess?.title}分蓍</p>
                    <h2 className="mt-2 text-2xl font-semibold">{activeProcess?.target}</h2>
                    <p className="mt-4 text-sm leading-7 text-stone-300">
                      本次分得左手 {split.left} 根，右手 {split.right} 根。系统按当前步骤取数，得到数字：
                      <span className="gold-text text-xl font-semibold"> {number}</span>。
                    </p>
                    {step === 1 && upperTrigram ? (
                      <div className="mt-5 rounded-2xl border border-stone-700 bg-black/20 p-4">
                        <p className="mb-3 text-sm text-stone-400">上卦结果</p>
                        <TrigramIcon number={draft?.upperNumber ?? 1} />
                        <p className="mt-3 text-xs leading-6 text-stone-500">{upperTrigram.imageHint}</p>
                      </div>
                    ) : null}
                    {step === 2 && lowerTrigram ? (
                      <div className="mt-5 rounded-2xl border border-stone-700 bg-black/20 p-4">
                        <p className="mb-3 text-sm text-stone-400">下卦结果</p>
                        <TrigramIcon number={draft?.lowerNumber ?? 1} />
                        <p className="mt-3 text-xs leading-6 text-stone-500">{lowerTrigram.imageHint}</p>
                      </div>
                    ) : null}
                    {step === 3 ? (
                      <div className="mt-5 rounded-2xl border border-stone-700 bg-black/20 p-4">
                        <p className="text-sm text-stone-400">动爻结果</p>
                        <p className="mt-2 text-3xl font-semibold gold-text">第 {draft?.movingLine} 爻动</p>
                        <p className="mt-2 text-sm leading-7 text-stone-300">动爻是这件事最活跃的变化点，结果页会优先解释这一爻。</p>
                      </div>
                    ) : null}
                  </MotionCard>
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-56 flex-wrap items-center justify-center gap-2">
                  {yarrowStalks.map((stalk) => (
                    <motion.div
                      key={stalk}
                      initial={{ opacity: 0, y: 8, rotate: -3 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ delay: stalk * 0.006 }}
                      className="yarrow"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {split && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-yellow-500/10 p-5 text-stone-200">
              <p>本次分得：左手 {split.left} 根，右手 {split.right} 根蓍草。</p>
              <p className="mt-2 gold-text text-xl">得到数字：{number}</p>
            </motion.div>
          )}
        </motion.div>
      </section>
      <ConsultationFloat source="divination" />
    </Shell>
  );
}

function SplitFlow({ left, right, step }: { left: number; right: number; step: number }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-stone-950/35 p-4">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-stone-400">分蓍草过程</span>
        <span className="gold-text">第 {step} 次</span>
      </div>
      <div className="relative flex min-h-28 items-center justify-center overflow-hidden rounded-xl bg-black/20">
        <motion.div
          key={`left-${step}`}
          initial={{ x: 0, opacity: 0.35 }}
          animate={{ x: -62, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="flex gap-1"
        >
          {Array.from({ length: 8 }, (_, index) => <span key={index} className="yarrow scale-75" />)}
        </motion.div>
        <motion.div
          key={`right-${step}`}
          initial={{ x: 0, opacity: 0.35 }}
          animate={{ x: 62, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="flex gap-1"
        >
          {Array.from({ length: 8 }, (_, index) => <span key={index} className="yarrow scale-75" />)}
        </motion.div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <p className="rounded-xl bg-black/20 p-3 text-stone-300">左手：<span className="gold-text">{left}</span> 根</p>
        <p className="rounded-xl bg-black/20 p-3 text-stone-300">右手：<span className="gold-text">{right}</span> 根</p>
      </div>
    </div>
  );
}

function YarrowGroup({ title, count, highlight, side }: { title: string; count: number; highlight: boolean; side: "left" | "right" }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-yellow-400/50" : "border-stone-700"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium">{title}</h2>
        <span className="gold-text">{count} 根</span>
      </div>
      <div className="flex min-h-44 flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, x: side === "left" ? 26 : -26, rotate: side === "left" ? -8 : 8 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: Math.min(index * 0.01, 0.28), type: "spring", stiffness: 160, damping: 18 }}
            className="yarrow"
          />
        ))}
      </div>
    </div>
  );
}
