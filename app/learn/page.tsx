"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { TrigramIcon } from "@/components/TrigramIcon";
import { lessons, lineStages } from "@/data/learn-course";
import { getHexagram, trigrams } from "@/data/gua";

const localProgressKey = "gaodao-learning-progress";

const qianStages = [
  {
    line: "初九",
    phrase: "潜龙勿用",
    stage: "潜藏",
    meaning: "能力在形成，位置还未到。宜养德、练基本功，不急着证明自己。",
    search: "潜龙勿用 人生阶段",
  },
  {
    line: "九二",
    phrase: "见龙在田",
    stage: "显露",
    meaning: "才德开始被看见，需要见大人、遇平台、得引导。",
    search: "见龙在田 利见大人 人物案例",
  },
  {
    line: "九三",
    phrase: "终日乾乾",
    stage: "警醒",
    meaning: "责任加重，日夜勤勉仍要防错。越靠近成事，越不能松懈。",
    search: "终日乾乾 夕惕若 厉无咎",
  },
  {
    line: "九四",
    phrase: "或跃在渊",
    stage: "试跃",
    meaning: "机会临近但位置未稳。可试探，不可莽撞；进退都要留余地。",
    search: "或跃在渊 无咎 易经",
  },
  {
    line: "九五",
    phrase: "飞龙在天",
    stage: "登位",
    meaning: "德位相称，平台打开。此时要以公心行大事，而非只求个人得势。",
    search: "飞龙在天 利见大人 历史人物",
  },
  {
    line: "上九",
    phrase: "亢龙有悔",
    stage: "知止",
    meaning: "盛极则危，过高则悔。能在高处知止，才是保全后局。",
    search: "亢龙有悔 袁世凯 称帝",
  },
];

const wisdomBatches = [
  [
    {
      phrase: "潜龙勿用",
      title: "有才而未得其时",
      text: "不是不用一生，而是此刻不宜强出头。人在低处先修实力，等待时与位相合。",
      search: "潜龙勿用 人生进退",
    },
    {
      phrase: "见龙在田",
      title: "开始被看见",
      text: "才德出现于田野，最要紧是见大人、入正道、接平台。",
      search: "见龙在田 利见大人 案例",
    },
    {
      phrase: "亢龙有悔",
      title: "盛极要知止",
      text: "高处不是终点。越到顶峰，越要懂得收、退、让、改。",
      search: "亢龙有悔 历史兴衰",
    },
  ],
  [
    {
      phrase: "履霜坚冰至",
      title: "小兆头里有大趋势",
      text: "霜刚出现时，坚冰已在路上。风险不是突然来的，常从微小迹象开始。",
      search: "履霜坚冰至 风险管理",
    },
    {
      phrase: "无平不陂，无往不复",
      title: "顺境也会转弯",
      text: "平地会有坡，去后会有返。顺时不骄，逆时不绝望。",
      search: "无平不陂 无往不复 易经",
    },
    {
      phrase: "穷则变，变则通",
      title: "困局要求改变",
      text: "走到尽头不是只求坚持，有时真正的坚持是换方法。",
      search: "穷则变 变则通 易经",
    },
  ],
  [
    {
      phrase: "括囊，无咎无誉",
      title: "该闭嘴时先收口",
      text: "有些阶段不求表现，只求不失。守住口舌，就是守住局面。",
      search: "括囊 无咎无誉",
    },
    {
      phrase: "鸣鹤在阴，其子和之",
      title: "真诚会相应",
      text: "不是声音越大越有影响力。内在真实，远处也会有人回应。",
      search: "鸣鹤在阴 其子和之",
    },
    {
      phrase: "不远复，无祗悔",
      title: "错了就早回头",
      text: "离正道不远时回头，成本最低。复盘越早，悔越少。",
      search: "不远复 无祗悔 易经",
    },
  ],
  [
    {
      phrase: "云上于天，需",
      title: "真正的等待不是躺平",
      text: "需是等待时机，也是在等待中准备饮食、资源和信用。",
      search: "水天需 云上于天 需 等待",
    },
    {
      phrase: "蒙以养正",
      title: "不懂时先学规则",
      text: "蒙不是愚蠢，而是初学。能承认不懂，才有机会养正。",
      search: "蒙以养正 易经 学习",
    },
    {
      phrase: "扬于王庭",
      title: "决断要公开正当",
      text: "夬是决断，但不是私下逞狠。真正的决断要有规则、有声明、有边界。",
      search: "泽天夬 扬于王庭 决断",
    },
  ],
  [
    {
      phrase: "初吉终乱",
      title: "成了以后更要守",
      text: "事情刚成时容易吉，越到后面越怕松懈。守成比开局更考验人。",
      search: "水火既济 初吉终乱",
    },
    {
      phrase: "未济亨",
      title: "没完成不等于失败",
      text: "未济是尚未完成，仍有可通之机。差的是秩序、位置和最后一步。",
      search: "火水未济 未济亨",
    },
    {
      phrase: "尚消息盈虚",
      title: "看见衰退，就别硬撑",
      text: "剥是剥落。能看见消息盈虚，才知道什么时候保存核心。",
      search: "山地剥 消息盈虚",
    },
  ],
];

const yaoSources: Record<string, { hexagram: string; line: string }> = {
  潜龙勿用: { hexagram: "乾为天", line: "初九" },
  见龙在田: { hexagram: "乾为天", line: "九二" },
  终日乾乾: { hexagram: "乾为天", line: "九三" },
  或跃在渊: { hexagram: "乾为天", line: "九四" },
  飞龙在天: { hexagram: "乾为天", line: "九五" },
  亢龙有悔: { hexagram: "乾为天", line: "上九" },
  履霜坚冰至: { hexagram: "坤为地", line: "初六" },
  "无平不陂，无往不复": { hexagram: "地天泰", line: "九三" },
  "穷则变，变则通": { hexagram: "系辞传", line: "下传" },
  "括囊，无咎无誉": { hexagram: "坤为地", line: "六四" },
  "鸣鹤在阴，其子和之": { hexagram: "风泽中孚", line: "九二" },
  "不远复，无祗悔": { hexagram: "地雷复", line: "初九" },
  "云上于天，需": { hexagram: "水天需", line: "大象" },
  蒙以养正: { hexagram: "山水蒙", line: "彖传" },
  扬于王庭: { hexagram: "泽天夬", line: "卦辞" },
  初吉终乱: { hexagram: "水火既济", line: "卦辞" },
  未济亨: { hexagram: "火水未济", line: "卦辞" },
  尚消息盈虚: { hexagram: "山地剥", line: "大象" },
};

function searchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function hexagramUrl(name: string) {
  return `/learn/hexagrams/${encodeURIComponent(name)}`;
}

export default function LearnPage() {
  const [upper, setUpper] = useState(1);
  const [lower, setLower] = useState(1);
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [syncMessage, setSyncMessage] = useState("学习进度会先保存在本机，登录后自动同步到账户。");
  const [qianStageIndex, setQianStageIndex] = useState(0);
  const [wisdomBatchIndex, setWisdomBatchIndex] = useState(0);
  const hexagram = useMemo(() => getHexagram(upper, lower), [upper, lower]);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];
  const progress = Math.round((completed.length / lessons.length) * 100);
  const activeQianStage = qianStages[qianStageIndex];
  const activeWisdomBatch = wisdomBatches[wisdomBatchIndex];

  useEffect(() => {
    const localProgress = JSON.parse(localStorage.getItem(localProgressKey) ?? "[]") as string[];
    queueMicrotask(() => setCompleted(localProgress));

    fetch("/api/learning-progress")
      .then((response) => response.json())
      .then((payload) => {
        const remoteIds = payload.progress?.completedLessonIds as string[] | undefined;
        if (payload.authenticated && remoteIds) {
          const merged = [...new Set([...localProgress, ...remoteIds])];
          setCompleted(merged);
          localStorage.setItem(localProgressKey, JSON.stringify(merged));
          setSyncMessage("学习进度已同步到账户。");
          if (merged.length !== remoteIds.length) {
            fetch("/api/learning-progress", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ completedLessonIds: merged }),
            });
          }
        }
      })
      .catch(() => setSyncMessage("学习进度已保存在本机，登录后可同步。"));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQianStageIndex((current) => (current + 1) % qianStages.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  async function persistProgress(nextCompleted: string[]) {
    localStorage.setItem(localProgressKey, JSON.stringify(nextCompleted));
    const response = await fetch("/api/learning-progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedLessonIds: nextCompleted }),
    });

    if (response.ok) {
      setSyncMessage("学习进度已同步到账户。");
    } else {
      setSyncMessage("学习进度已保存在本机，登录后可同步到账户。");
    }
  }

  function toggleLessonDone(id: string) {
    setCompleted((items) => {
      const nextItems = items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
      void persistProgress(nextItems);
      return nextItems;
    });
  }

  return (
    <Shell>
      <YaoAttraction
        activeQianStage={activeQianStage}
        activeWisdomBatch={activeWisdomBatch}
        qianStageIndex={qianStageIndex}
        setQianStageIndex={setQianStageIndex}
        setWisdomBatchIndex={setWisdomBatchIndex}
      />

      <section className="mx-auto max-w-6xl py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">学易课程</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold sm:text-5xl">从问清一件事开始</h1>
              <p className="mt-5 max-w-3xl leading-8 text-stone-300">
                学易不是背术语，而是训练自己看清局面、变化、风险和选择。课程按短课设计，每节学一个判断动作，学完就能回到问事里用。
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-400">学习进度</span>
                <span className="gold-text">{progress}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-800">
                <div className="h-full rounded-full bg-yellow-400" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                已完成 {completed.length} / {lessons.length} 节。先不用追求快，能把一个判断动作放进生活里，就算学到东西。
              </p>
              <p className="mt-3 text-xs leading-6 text-stone-500">{syncMessage}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
            <div className="grid gap-3">
              {lessons.map((lesson, index) => {
                const isActive = lesson.id === activeLesson.id;
                const isDone = completed.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isActive ? "border-yellow-500/45 bg-yellow-500/10" : "border-stone-700 bg-stone-950/35 hover:border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-stone-400">第 {index + 1} 课 · {lesson.stage}</span>
                      <span className={isDone ? "gold-text text-sm" : "text-sm text-stone-600"}>{isDone ? "已学" : lesson.duration}</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-stone-100">{lesson.title}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">{lesson.goal}</p>
                  </button>
                );
              })}
            </div>

            <article className="rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="gold-text text-sm">{activeLesson.stage} · {activeLesson.duration}</p>
                  <h2 className="mt-2 text-3xl font-semibold">{activeLesson.title}</h2>
                  <p className="mt-3 leading-7 text-stone-300">{activeLesson.goal}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleLessonDone(activeLesson.id)}
                  className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25"
                >
                  {completed.includes(activeLesson.id) ? "取消完成" : "标记完成"}
                </button>
                <Link href={`/learn/${activeLesson.id}`} className="rounded-full border border-stone-600 px-5 py-2 text-center text-sm text-stone-200 hover:border-yellow-500/40 hover:text-yellow-100">
                  进入详情
                </Link>
              </div>

              <div className="mt-6 grid gap-4">
                <CourseBlock title="核心要点">
                  <ul className="grid gap-3 text-sm leading-7 text-stone-300">
                    {activeLesson.core.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </CourseBlock>
                <CourseBlock title="练习">
                  <p className="text-sm leading-7 text-stone-300">{activeLesson.practice}</p>
                </CourseBlock>
                <CourseBlock title="自问">
                  <p className="text-sm leading-7 text-stone-300">{activeLesson.reflection}</p>
                </CourseBlock>
              </div>
            </article>
          </div>
        </motion.div>
      </section>

      <section className="hidden">
        <div className="ritual-card overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="gold-text text-sm tracking-[0.35em]">世事爻变</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">从潜龙到亢龙，看一件事的升降进退</h2>
              <p className="mt-5 text-sm leading-8 text-stone-300">
                乾卦六爻像一条人生轨道：潜藏、显露、警醒、试跃、登位、知止。读懂它，不是为了崇拜成败，
                而是能站远一点看现在：我在哪一层，下一步该进、该等、该退，还是该收。
              </p>
              <div className="mt-6 grid gap-3">
                {qianStages.map((stage, index) => {
                  const active = index === qianStageIndex;
                  return (
                    <button
                      key={stage.line}
                      type="button"
                      onClick={() => setQianStageIndex(index)}
                      className={`grid gap-3 rounded-2xl border p-4 text-left transition sm:grid-cols-[4rem_7rem_1fr] sm:items-center ${
                        active ? "scale-[1.01] border-yellow-500/50 bg-yellow-500/15" : "border-stone-700 bg-black/20 hover:border-yellow-500/30"
                      }`}
                    >
                      <span className="text-sm text-stone-400">{stage.line}</span>
                      <span className={active ? "gold-text text-lg font-semibold" : "text-lg font-semibold text-stone-200"}>{stage.phrase}</span>
                      <span className="text-sm leading-6 text-stone-400">{stage.stage}：{stage.meaning}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
              <p className="text-sm text-stone-400">当前亮起</p>
              <p className="mt-4 text-sm gold-text">{activeQianStage.line} · {activeQianStage.stage}</p>
              <h3 className="mt-2 text-5xl font-semibold text-stone-50">{activeQianStage.phrase}</h3>
              <p className="mt-5 text-sm leading-8 text-stone-300">{activeQianStage.meaning}</p>
              <div className="mt-6 rounded-2xl border border-stone-700 bg-stone-950/50 p-5">
                <p className="text-sm gold-text">历史镜像</p>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  可搜索“袁世凯称帝前后”这类历史事件，观察人从蓄势、得势到过盛生悔的变化。这里不是给历史下唯一结论，
                  而是借熟悉的人事，理解爻位如何提示进退。
                </p>
              </div>
              <a
                href={searchUrl(activeQianStage.search)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-sm text-yellow-100 hover:bg-yellow-500/25"
              >
                搜索相关人物与事件
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-stone-700 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="gold-text text-sm tracking-[0.35em]">今日观爻</p>
                <h3 className="mt-2 text-2xl font-semibold">用几句脍炙人口的爻，先感受变化规律</h3>
              </div>
              <button
                type="button"
                onClick={() => setWisdomBatchIndex((current) => (current + 1) % wisdomBatches.length)}
                className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25"
              >
                刷新下一批爻
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {activeWisdomBatch.map((item) => (
                <a key={item.phrase} href={searchUrl(item.search)} target="_blank" rel="noreferrer" className="rounded-2xl border border-stone-700 bg-stone-950/35 p-5 hover:border-yellow-500/35">
                  <p className="gold-text text-lg font-semibold">{item.phrase}</p>
                  <p className="mt-3 text-sm font-semibold text-stone-100">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-400">{item.text}</p>
                  <p className="mt-4 text-xs text-stone-500">点击搜索对应的人或事</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="ritual-card rounded-[2rem] p-6 sm:p-8">
            <p className="gold-text text-sm tracking-[0.35em]">八卦速记</p>
            <h2 className="mt-3 text-2xl font-semibold">八种自然状态</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {trigrams.map((trigram) => (
                <div key={trigram.number} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5">
                  <p className="gold-text text-sm">第 {trigram.number} 卦象</p>
                  <div className="mt-4">
                    <TrigramIcon number={trigram.number} />
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">{trigram.name}</h3>
                  <p className="mt-2 text-stone-300">自然象：{trigram.nature}</p>
                  <p className="mt-1 text-sm text-stone-500">{trigram.quality}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="ritual-card rounded-[2rem] p-6 sm:p-8">
              <p className="gold-text text-sm tracking-[0.35em]">组合练习</p>
              <h2 className="mt-3 text-2xl font-semibold">上卦加下卦，成六十四卦</h2>
              <div className="mt-6 grid gap-4">
                <SelectGua label="选择上卦" value={upper} onChange={setUpper} />
                <SelectGua label="选择下卦" value={lower} onChange={setLower} />
                <motion.div
                  key={`${upper}-${lower}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.38 }}
                  className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5"
                >
                  <p className="text-stone-400">实时组合后的六十四卦</p>
                  <p className="mt-3 text-4xl font-semibold gold-text">{hexagram?.name}</p>
                  <p className="mt-4 leading-7 text-stone-300">{hexagram?.explanation}</p>
                </motion.div>
              </div>
            </div>

            <div className="ritual-card rounded-[2rem] p-6 sm:p-8">
              <p className="gold-text text-sm tracking-[0.35em]">六爻位置</p>
              <h2 className="mt-3 text-2xl font-semibold">先看动爻在第几层</h2>
              <div className="mt-5 grid gap-3">
                {lineStages.map(([name, stage, text]) => (
                  <div key={name} className="grid gap-2 rounded-2xl border border-stone-700 bg-black/20 p-3 text-sm sm:grid-cols-[4rem_4rem_1fr] sm:items-center sm:gap-3">
                    <span className="gold-text">{name}</span>
                    <span className="text-stone-200">{stage}</span>
                    <span className="text-stone-400">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function YaoAttraction({
  activeQianStage,
  activeWisdomBatch,
  qianStageIndex,
  setQianStageIndex,
  setWisdomBatchIndex,
}: {
  activeQianStage: (typeof qianStages)[number];
  activeWisdomBatch: (typeof wisdomBatches)[number];
  qianStageIndex: number;
  setQianStageIndex: (value: number) => void;
  setWisdomBatchIndex: (updater: (current: number) => number) => void;
}) {
  const activeSource = yaoSources[activeQianStage.phrase];

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="ritual-card overflow-hidden rounded-[2rem] p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="gold-text text-sm tracking-[0.35em]">世事爻变</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">从潜龙到亢龙，看一件事的升降进退</h1>
            <p className="mt-5 text-sm leading-8 text-stone-300">
              乾卦六爻像一条人生轨道：潜藏、显露、警醒、试跃、登位、知止。读懂它，不是为了崇拜成败，
              而是能站远一点看现在：我在哪一层，下一步该进、该等、该退，还是该收。
            </p>
            <div className="mt-6 grid gap-3">
              {qianStages.map((stage, index) => {
                const active = index === qianStageIndex;
                const source = yaoSources[stage.phrase];

                return (
                  <button
                    key={stage.line}
                    type="button"
                    onClick={() => setQianStageIndex(index)}
                    className={`grid gap-3 rounded-2xl border p-4 text-left transition sm:grid-cols-[5rem_8rem_1fr] sm:items-center ${
                      active ? "scale-[1.01] border-yellow-500/50 bg-yellow-500/15" : "border-stone-700 bg-black/20 hover:border-yellow-500/30"
                    }`}
                  >
                    <span className="text-sm text-stone-400">{source.hexagram} · {source.line}</span>
                    <span className={active ? "gold-text text-lg font-semibold" : "text-lg font-semibold text-stone-200"}>{stage.phrase}</span>
                    <span className="text-sm leading-6 text-stone-400">{stage.stage}：{stage.meaning}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
            <p className="text-sm text-stone-400">当前亮起</p>
            <p className="mt-4 text-sm gold-text">{activeSource.hexagram} · {activeSource.line} · {activeQianStage.stage}</p>
            <h2 className="mt-2 text-5xl font-semibold text-stone-50">{activeQianStage.phrase}</h2>
            <p className="mt-5 text-sm leading-8 text-stone-300">{activeQianStage.meaning}</p>
            <div className="mt-6 rounded-2xl border border-stone-700 bg-stone-950/50 p-5">
              <p className="text-sm gold-text">历史镜像</p>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                可搜索“袁世凯称帝前后”这类历史事件，观察人从蓄势、得势到过盛生悔的变化。这里不是给历史下唯一结论，
                而是借熟悉的人事，理解爻位如何提示进退。
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link href={hexagramUrl(activeSource.hexagram)} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-center text-sm text-yellow-100 hover:bg-yellow-500/25">
                查看完整卦
              </Link>
              <a
                href={searchUrl(activeQianStage.search)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-600 px-5 py-3 text-center text-sm text-stone-200 hover:border-yellow-500/40"
              >
                搜索相关人物与事件
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-700 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="gold-text text-sm tracking-[0.35em]">今日观爻</p>
              <h3 className="mt-2 text-2xl font-semibold">用几句脍炙人口的爻，先感受变化规律</h3>
            </div>
            <button
              type="button"
              onClick={() => setWisdomBatchIndex((current) => (current + 1) % wisdomBatches.length)}
              className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25"
            >
              刷新下一批爻
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {activeWisdomBatch.map((item) => {
              const source = yaoSources[item.phrase];
              const hasHexagramPage = source.hexagram !== "系辞传";

              return (
                <div key={item.phrase} className="rounded-2xl border border-stone-700 bg-stone-950/35 p-5">
                  <p className="text-xs text-stone-500">{source.hexagram} · {source.line}</p>
                  <p className="gold-text mt-2 text-lg font-semibold">{item.phrase}</p>
                  <p className="mt-3 text-sm font-semibold text-stone-100">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-400">{item.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hasHexagramPage ? (
                      <Link href={hexagramUrl(source.hexagram)} className="rounded-full border border-yellow-500/30 px-3 py-1 text-xs text-yellow-100 hover:bg-yellow-500/15">
                        查看完整卦
                      </Link>
                    ) : null}
                    <a href={searchUrl(item.search)} target="_blank" rel="noreferrer" className="rounded-full border border-stone-600 px-3 py-1 text-xs text-stone-300 hover:border-yellow-500/35">
                      搜索人事
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-stone-700 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold gold-text">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SelectGua({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="grid gap-3 text-stone-300">
      <div className="flex items-center justify-between gap-3">
        <p>{label}</p>
        <p className="text-xs gold-text">{trigrams.find((item) => item.number === value)?.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {trigrams.map((trigram) => {
          const active = trigram.number === value;

          return (
            <motion.button
              key={trigram.number}
              type="button"
              onClick={() => onChange(trigram.number)}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border p-3 text-left transition ${
                active ? "border-yellow-400/70 bg-yellow-500/15 shadow-lg shadow-yellow-950/20" : "border-stone-700 bg-stone-950/35 hover:border-yellow-500/35"
              }`}
            >
              <span className="text-xs text-stone-500">{trigram.number}</span>
              <span className={active ? "gold-text ml-2 text-sm font-semibold" : "ml-2 text-sm font-semibold text-stone-200"}>{trigram.name}</span>
              <span className="mt-1 block text-xs text-stone-500">{trigram.nature}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
