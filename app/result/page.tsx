"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { PressableButton, PressableLink } from "@/components/MotionPrimitives";
import { Shell } from "@/components/Shell";
import { HexagramIcon, TrigramIcon } from "@/components/TrigramIcon";
import { getHexagramTranslation, getLineTranslation } from "@/data/gaodao-translations";
import { getTrigramVisual } from "@/data/gua";
import { getPlainHexagramSummary, getPlainLineSummary } from "@/data/plain-reading";
import { readingWeights, trimOriginalText } from "@/data/reading";
import { divinationTopics, getTopicDescription } from "@/data/topics";
import { DivinationDraft, DivinationResult, enrichDivination, getGenderLabel } from "@/lib/divination";
import { buildLearningRecommendations } from "@/lib/learning-recommendations";
import { buildReadingContext } from "@/lib/reading-context";

const topics = divinationTopics.map((topic) => topic.label);
const currentDraftKey = "gaodao-current-divination";
const reflectionKeyPrefix = "gaodao-result-reflection:";

type BaihuaReadingPayload = {
  primary: { text: string; sourceNote: string } | null;
  moving: {
    marker: string;
    text: string;
    caseText?: string;
    sourceNote: string;
    topicReading?: { matchedTopic: string; text: string };
    topicReadings?: Record<string, { matchedTopic: string; text: string }>;
  } | null;
  changed: { text: string; sourceNote: string } | null;
};

function buildInitialConclusion(result: DivinationResult, activeTopic: string, movingSummary?: string, topicReading?: { matchedTopic: string; text: string }) {
  const questionText = result.question ? `所问之事：“${result.question}”。` : "";
  const primary = getPlainHexagramSummary(result.hexagramName);
  const changed = getPlainHexagramSummary(result.changedHexagramName);
  const movingBasis = topicReading
    ? `动爻第 ${result.movingLine} 爻取《白话高岛易断》对应事项「${topicReading.matchedTopic}」：${topicReading.text}`
    : movingSummary
      ? `动爻第 ${result.movingLine} 爻未找到完全对应事项，暂按爻位通断：${movingSummary}`
      : `动爻第 ${result.movingLine} 爻是本次主要变化点。`;

  return `${questionText}本卦「${result.hexagramName}」先定当前局面：${primary}${movingBasis}变卦「${result.changedHexagramName}」看后势：${changed}`;
}

function buildActionAdvice(result: DivinationResult, activeTopic: string, movingSummary?: string, topicReading?: { matchedTopic: string; text: string }) {
  const basis = topicReading?.text ?? movingSummary ?? getPlainHexagramSummary(result.hexagramName);
  return `先按「${activeTopic}」处理最紧要的一步。第 ${result.movingLine} 爻为主要变化点，宜把行动收束到一个可验证的小动作：确认关键人、关键条件与下一次推进时机。${basis}`;
}

function buildRiskWarning(result: DivinationResult, activeTopic: string, movingSummary?: string) {
  const changed = getPlainHexagramSummary(result.changedHexagramName);
  return `风险在于只看眼前情绪而忽略后势。「${result.changedHexagramName}」提示事情会继续变化，${activeTopic}需留出回旋空间；若信息不足，先查证、再承诺。${movingSummary ?? changed}`;
}

function subscribeToStoredDraft(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredDraftSnapshot() {
  return localStorage.getItem(currentDraftKey);
}

function formatResultTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "时间待确认";

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeBaihuaDisplay(text: string) {
  return text
    .replace(/交辞/g, "爻辞")
    .replace(/占交/g, "占爻")
    .replace(/([初二三四五六上九])交/g, "$1爻")
    .replace(/([初二三四五六上九])爻/g, "$1爻")
    .replace(/原文占例仍需逐条精校，当前版本先供页面通顺展示和后续人工校对。?/g, "")
    .replace(/当前版本先供页面通顺展示和后续人工校对。?/g, "")
    .trim();
}

function removeCaseSection(text: string) {
  const caseMarkers = ["[活断实例]", "【活断实例】", "活断实例", "[占例]", "【占例】", "占例"];
  const indexes = caseMarkers.map((marker) => text.indexOf(marker)).filter((index) => index > 0);
  if (indexes.length === 0) return text;
  return text.slice(0, Math.min(...indexes)).trim();
}

export default function ResultPage() {
  const [topic, setTopic] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [baihuaReading, setBaihuaReading] = useState<BaihuaReadingPayload | null>(null);
  const [reflection, setReflection] = useState("");
  const [reflectionSavedAt, setReflectionSavedAt] = useState("");
  const draftSnapshot = useSyncExternalStore(subscribeToStoredDraft, getStoredDraftSnapshot, () => null);
  const draft = useMemo(() => (draftSnapshot ? (JSON.parse(draftSnapshot) as DivinationDraft) : null), [draftSnapshot]);
  const result: DivinationResult | null = useMemo(() => (draft ? enrichDivination(draft) : null), [draft]);
  const activeTopic = topic || result?.topic || topics[0];
  const movingPlain = useMemo(
    () => (result ? getPlainLineSummary(result.movingLineText, activeTopic, result.hexagramName) : null),
    [result, activeTopic],
  );
  const readingContext = useMemo(() => (result ? buildReadingContext(result, activeTopic) : null), [result, activeTopic]);
  const learningRecommendations = useMemo(() => (result ? buildLearningRecommendations(result, activeTopic) : []), [result, activeTopic]);
  const guidance = useMemo(
    () => ({
      recommendations: learningRecommendations,
      actions: learningRecommendations.map((item, index) => ({
        id: `${item.lessonId}-${index}`,
        text: item.action,
        done: false,
      })),
    }),
    [learningRecommendations],
  );
  const primaryTranslation = useMemo(() => (result ? getHexagramTranslation(result.hexagramName) : undefined), [result]);
  const movingTranslation = useMemo(() => (result ? getLineTranslation(result.hexagramName, result.movingLine) : undefined), [result]);
  const changedTranslation = useMemo(() => (result ? getHexagramTranslation(result.changedHexagramName) : undefined), [result]);
  const initialConclusion = useMemo(
    () => (result ? buildInitialConclusion(result, activeTopic, movingPlain?.summary, baihuaReading?.moving?.topicReading) : ""),
    [result, activeTopic, movingPlain, baihuaReading],
  );
  const otherTopicReadings = useMemo(
    () =>
      result
        ? divinationTopics
            .filter((item) => item.label !== activeTopic)
            .map((item) => ({
              ...item,
              matchedTopic: baihuaReading?.moving?.topicReadings?.[item.label]?.matchedTopic,
              reading: baihuaReading?.moving?.topicReadings?.[item.label]?.text ?? getPlainLineSummary(result.movingLineText, item.label, result.hexagramName).summary,
              source: baihuaReading?.moving?.topicReadings?.[item.label] ? "《白话高岛易断》原文" : "规则摘要",
            }))
        : [],
    [result, activeTopic, baihuaReading],
  );

  useEffect(() => {
    if (!result) return;
    const params = new URLSearchParams({
      primary: result.hexagramName,
      changed: result.changedHexagramName,
      line: String(result.movingLine),
      topic: activeTopic,
    });

    fetch(`/api/baihua-reading?${params.toString()}`)
      .then((response) => response.json())
      .then((payload: BaihuaReadingPayload) => setBaihuaReading(payload))
      .catch(() => setBaihuaReading(null));
  }, [result, activeTopic]);

  useEffect(() => {
    if (!result) return;
    const savedReflection = localStorage.getItem(`${reflectionKeyPrefix}${result.createdAt}`);
    if (!savedReflection) {
      queueMicrotask(() => {
        setReflection("");
        setReflectionSavedAt("");
      });
      return;
    }

    const payload = JSON.parse(savedReflection) as { text?: string; updatedAt?: string };
    queueMicrotask(() => {
      setReflection(payload.text ?? "");
      setReflectionSavedAt(payload.updatedAt ?? "");
    });
  }, [result]);

  function saveReflection() {
    if (!result) return;
    const updatedAt = new Date().toISOString();
    localStorage.setItem(`${reflectionKeyPrefix}${result.createdAt}`, JSON.stringify({ text: reflection.trim(), updatedAt }));
    setReflectionSavedAt(updatedAt);
  }

  async function saveRecord() {
    if (!result || !readingContext) return;
    setSaving(true);
    setSaveMessage("");

    const response = await fetch("/api/divination-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: activeTopic,
        question: result.question,
        gender: result.gender,
        result,
        modelPrompt: readingContext.modelPrompt,
        guidance,
        userReflection: reflection.trim(),
      }),
    });
    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setSaveMessage(payload.error ?? "保存失败。");
      return;
    }

    setSaved(true);
    setSaveMessage("已保存");
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
              <ResultOverview
                result={result}
                activeTopic={activeTopic}
                initialConclusion={initialConclusion}
                actionAdvice={buildActionAdvice(result, activeTopic, movingPlain?.summary, baihuaReading?.moving?.topicReading)}
                riskWarning={buildRiskWarning(result, activeTopic, movingPlain?.summary)}
                resultTime={formatResultTime(result.createdAt)}
                onTopicChange={(value) => {
                  setTopic(value);
                  setSaved(false);
                  setSaveMessage("");
                }}
              />

              <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }} className="mt-8 grid gap-5">
                <ReadingPanel
                  label="本卦 · 30%"
                  title={`${result.hexagramName}（第 ${result.primaryText?.kingWenNumber ?? result.kingWenNumber} 卦）`}
                  plainText={primaryTranslation?.modernText ?? getPlainHexagramSummary(result.hexagramName)}
                  baihuaText={baihuaReading?.primary?.text}
                  note="先读本卦，判断事情的基本局面。"
                  matchedTopic={activeTopic}
                />
                <ReadingPanel
                  label="动爻 · 51%"
                  title={`${result.movingLine} 爻动`}
                  plainText={
                    movingTranslation
                      ? `${movingTranslation.modernText} 分类角度：${getTopicDescription(activeTopic)}`
                      : movingPlain?.summary
                  }
                  baihuaText={baihuaReading?.moving?.text}
                  caseBaihuaText={baihuaReading?.moving?.caseText}
                  casePlainText={movingTranslation?.caseModern}
                  note="动爻权重最高，优先看应事点、风险点和行动建议。"
                  matchedTopic={activeTopic}
                  emphasized
                />
                <ReadingPanel
                  label="变卦 · 19%"
                  title={result.changedHexagramName}
                  plainText={changedTranslation?.modernText ?? getPlainHexagramSummary(result.changedHexagramName)}
                  baihuaText={baihuaReading?.changed?.text}
                  note="最后读变卦，看事情后续会往哪里转。"
                  matchedTopic={activeTopic}
                />
              </motion.div>

              <details className="mt-8 rounded-[1.5rem] border border-stone-700 bg-stone-950/35 p-6">
                <summary className="cursor-pointer text-lg font-semibold gold-text">查看其他方面的占断结论</summary>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {otherTopicReadings.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-stone-700 bg-black/20 p-4">
                      <p className="text-sm gold-text">{item.label}</p>
                      <p className="mt-1 text-xs text-stone-500">{item.description}</p>
                      <p className="mt-3 text-xs text-stone-500">
                        {item.source}
                        {item.matchedTopic ? ` · 匹配：${item.matchedTopic}` : ""}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-stone-300">{item.reading}</p>
                    </div>
                  ))}
                </div>
              </details>

              {result.specialReadings.length > 0 ? (
                <div className="mt-8 grid gap-5">
                  {result.specialReadings.map((reading) => (
                    <section key={reading.id} className="rounded-[1.5rem] border border-yellow-500/30 bg-yellow-500/10 p-6">
                      <p className="text-sm text-stone-400">特殊读法</p>
                      <h3 className="mt-2 text-2xl font-semibold">{reading.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-stone-300">{reading.condition}</p>
                      <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
                        <p className="text-sm gold-text">白话译写</p>
                        <p className="mt-2 text-sm text-stone-400">原文：{reading.original}</p>
                        <p className="mt-2 text-sm leading-7 text-stone-200">{reading.plainText}</p>
                      </div>
                    </section>
                  ))}
                </div>
              ) : null}

              <section className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
                <p className="text-sm text-stone-400">下一步学习与行动</p>
                <h3 className="mt-2 text-2xl font-semibold">别只看结果，顺手修正一次判断</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {learningRecommendations.map((item) => (
                    <Link key={item.lessonId} href={`/learn/${item.lessonId}`} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 hover:border-yellow-500/45">
                      <p className="text-sm gold-text">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-stone-300">{item.reason}</p>
                      <p className="mt-4 border-t border-yellow-500/20 pt-3 text-sm leading-7 text-stone-200">{item.action}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <div className="mt-6 rounded-[1.5rem] border border-yellow-500/20 bg-stone-950/40 p-6">
                <p className="text-sm text-stone-400">大模型辅助整理</p>
                <h3 className="mt-2 text-xl font-semibold gold-text">{readingContext?.headline}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {readingContext?.weightedSummary.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-stone-700 bg-black/20 p-4">
                      <p className="text-sm text-stone-400">{item.label} · {item.weight}%</p>
                      <p className="mt-2 text-sm leading-7 text-stone-200">{item.summary}</p>
                    </div>
                  ))}
                </div>
                <details className="mt-5 rounded-2xl border border-stone-700 bg-black/20 p-4">
                  <summary className="cursor-pointer text-sm gold-text">展开分析依据</summary>
                  <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-stone-300">{readingContext?.modelPrompt}</pre>
                </details>
              </div>

              <section className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-stone-400">我的理解与后续印证</p>
                    <h3 className="mt-2 text-xl font-semibold gold-text">先写下此刻的判断，日后回来看是否应验</h3>
                  </div>
                  <p className="text-xs leading-6 text-stone-500">
                    起卦时间：{formatResultTime(result.createdAt)}
                    {reflectionSavedAt ? ` · 保存于 ${formatResultTime(reflectionSavedAt)}` : ""}
                  </p>
                </div>
                <textarea
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  rows={5}
                  maxLength={800}
                  placeholder="例如：我认为这卦提醒我要先等对方明确态度，不宜马上推进；一周后再回来印证。"
                  className="input-field mt-5 resize-none leading-7"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-stone-500">{reflection.length}/800，保存记录时会一并提交。</p>
                  <PressableButton onClick={saveReflection} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2.5 text-sm text-yellow-100 hover:bg-yellow-500/25">
                    保存我的理解
                  </PressableButton>
                </div>
              </section>

              <div className="mt-8 flex flex-col gap-4 rounded-[1.5rem] border border-stone-700 bg-stone-950/30 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-stone-400">保存记录</p>
                  <p className="mt-1 text-sm text-stone-300">保存时会带上所问事项、事情类型和本次卦象分析。</p>
                </div>
                <PressableButton onClick={saveRecord} disabled={saving} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-yellow-100 hover:bg-yellow-500/25 disabled:opacity-60">
                  {saving ? "保存中..." : saved ? "已保存" : "保存本次问事"}
                </PressableButton>
              </div>
              {saveMessage ? <p className="mt-3 text-sm text-stone-300">{saveMessage}</p> : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <PressableLink href="/divination" className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-center text-yellow-100 hover:bg-yellow-500/25">
                  再问一事
                </PressableLink>
                <PressableLink href="/account" className="rounded-full border border-stone-600 bg-stone-950/60 px-6 py-3 text-center text-stone-100 hover:border-yellow-500/40">
                  查看我的记录
                </PressableLink>
              </div>
            </>
          )}
        </motion.div>
      </section>
    </Shell>
  );
}

function ReadingPanel({
  label,
  title,
  plainText,
  caseBaihuaText,
  casePlainText,
  baihuaText,
  note,
  matchedTopic,
  emphasized = false,
}: {
  label: string;
  title: string;
  plainText?: string;
  caseBaihuaText?: string;
  casePlainText?: string;
  baihuaText?: string;
  note: string;
  matchedTopic?: string;
  emphasized?: boolean;
}) {
  const mainText = baihuaText
    ? trimOriginalText(normalizeBaihuaDisplay(removeCaseSection(baihuaText)), emphasized ? 1300 : 900)
    : plainText;
  const caseText = caseBaihuaText ?? casePlainText ?? "";

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 18, scale: 0.985 }, show: { opacity: 1, y: 0, scale: 1 } }}
      whileHover={{ y: -3, borderColor: emphasized ? "rgba(250, 204, 21, 0.55)" : "rgba(215, 173, 87, 0.38)" }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className={`rounded-[1.5rem] border p-5 sm:p-6 ${emphasized ? "border-yellow-500/40 bg-yellow-500/10 shadow-lg shadow-yellow-950/20" : "border-stone-700 bg-stone-950/35"}`}
    >
      <p className="text-sm text-stone-400">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-stone-300">{note}</p>
      {matchedTopic ? (
        <p className="mt-3 inline-flex rounded-full border border-yellow-500/25 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-100">
          匹配分类：{matchedTopic}
        </p>
      ) : null}
      {mainText ? (
        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
          <p className="text-sm gold-text">白话文</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-200">{mainText}</p>
        </div>
      ) : null}
      {caseBaihuaText || casePlainText ? (
        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-sm gold-text">占例白话</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-200">{trimOriginalText(normalizeBaihuaDisplay(caseText), 900)}</p>
        </div>
      ) : null}
    </motion.section>
  );
}

function ResultOverview({
  result,
  activeTopic,
  initialConclusion,
  actionAdvice,
  riskWarning,
  resultTime,
  onTopicChange,
}: {
  result: DivinationResult;
  activeTopic: string;
  initialConclusion: string;
  actionAdvice: string;
  riskWarning: string;
  resultTime: string;
  onTopicChange: (value: string) => void;
}) {
  const upper = getTrigramVisual(result.upperNumber);
  const lower = getTrigramVisual(result.lowerNumber);

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
        <motion.div whileHover={{ y: -3 }} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 sm:p-5">
          <p className="text-sm text-stone-400">本卦</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">{result.hexagramName}</h2>
              <p className="mt-2 text-sm text-stone-300">
                {upper.name}为{upper.nature}在上，{lower.name}为{lower.nature}在下
              </p>
            </div>
            <HexagramIcon upperNumber={result.upperNumber} lowerNumber={result.lowerNumber} compact />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-700 bg-black/20 p-4">
              <p className="text-xs text-stone-500">上卦</p>
              <div className="mt-2">
                <TrigramIcon number={result.upperNumber} size="sm" />
              </div>
            </div>
            <div className="rounded-2xl border border-stone-700 bg-black/20 p-4">
              <p className="text-xs text-stone-500">下卦</p>
              <div className="mt-2">
                <TrigramIcon number={result.lowerNumber} size="sm" />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-stone-700 bg-stone-950/40 p-3">
              <p className="text-stone-500">动爻</p>
              <p className="mt-1 gold-text text-lg font-semibold">第 {result.movingLine} 爻</p>
            </div>
            <div className="rounded-2xl border border-stone-700 bg-stone-950/40 p-3">
              <p className="text-stone-500">变卦</p>
              <p className="mt-1 gold-text text-lg font-semibold">{result.changedHexagramName}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-stone-700 bg-stone-950/35 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-stone-400">所问事项</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">{result.question || "未填写具体问题。"}</p>
                {result.gender !== "unknown" ? (
                  <p className="mt-2 text-xs text-stone-500">性别：{getGenderLabel(result.gender)}</p>
                ) : null}
              </div>
              <label className="grid min-w-44 gap-2 text-sm text-stone-300">
                事情类型
                <select
                  value={activeTopic}
                  onChange={(event) => onTopicChange(event.target.value)}
                  className="rounded-full border border-yellow-500/30 bg-stone-950 px-4 py-2.5 text-stone-100 outline-none"
                >
                  {topics.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm gold-text">初步结论</p>
              <p className="text-xs text-stone-500">起卦时间：{resultTime}</p>
            </div>
            <p className="mt-3 text-sm leading-8 text-stone-100">{initialConclusion}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-sm text-emerald-100">行动建议</p>
              <p className="mt-3 text-sm leading-7 text-stone-200">{actionAdvice}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
              <p className="text-sm text-amber-100">风险提示</p>
              <p className="mt-3 text-sm leading-7 text-stone-200">{riskWarning}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {readingWeights.map((part, index) => (
              <motion.div
                key={part.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + index * 0.06 }}
                className="rounded-2xl border border-stone-700 bg-stone-950/50 p-4"
              >
                <p className="text-sm text-stone-400">{part.label}</p>
                <p className="mt-1 text-2xl font-semibold gold-text">{part.weight}%</p>
                <p className="mt-2 text-xs leading-5 text-stone-400">{part.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
