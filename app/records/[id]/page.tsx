"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { formatTranslationBasis, getHexagramTranslation, getLineTranslation } from "@/data/gaodao-translations";
import { getPlainHexagramSummary, getPlainLineSummary } from "@/data/plain-reading";
import { trimOriginalText } from "@/data/reading";
import { buildLearningRecommendations } from "@/lib/learning-recommendations";
import type { DivinationGuidance, DivinationReview, GuidanceAction } from "@/lib/divination-record-store";
import type { StoredDivinationRecord } from "@/lib/divination-record-store";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<StoredDivinationRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [review, setReview] = useState({ actionTaken: "", outcome: "", reflection: "" });

  useEffect(() => {
    fetch(`/api/divination-records/${params.id}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          setError(payload.error ?? "读取记录失败。");
          return null;
        }
        return payload.record as StoredDivinationRecord;
      })
      .then((payload) => {
        setRecord(payload);
        if (payload?.review) {
          setReview({
            actionTaken: payload.review.actionTaken ?? "",
            outcome: payload.review.outcome ?? "",
            reflection: payload.review.reflection ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const movingPlain = record ? getPlainLineSummary(record.result.movingLineText, record.topic, record.result.hexagramName) : null;
  const primaryTranslation = record ? getHexagramTranslation(record.result.hexagramName) : undefined;
  const movingTranslation = record ? getLineTranslation(record.result.hexagramName, record.result.movingLine) : undefined;
  const changedTranslation = record ? getHexagramTranslation(record.result.changedHexagramName) : undefined;
  const effectiveGuidance = record ? record.guidance ?? buildGuidanceFromRecord(record) : undefined;

  async function regenerateAnalysis() {
    if (!record) return;
    setAnalyzing(true);
    setError("");
    const response = await fetch(`/api/divination-records/${record.id}/analysis`, { method: "POST" });
    const payload = await response.json();
    setAnalyzing(false);

    if (!response.ok) {
      setError(payload.error ?? "分析失败。");
      return;
    }

    setRecord(payload.record);
  }

  async function saveRecordPatch(payload: { guidance?: DivinationGuidance; review?: DivinationReview }) {
    if (!record) return;
    setSavingRecord(true);
    setSaveMessage("");
    const response = await fetch(`/api/divination-records/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setSavingRecord(false);

    if (!response.ok) {
      setSaveMessage(data.error ?? "保存失败。");
      return;
    }

    setRecord(data.record);
    setSaveMessage("已保存。");
  }

  function toggleAction(actionId: string) {
    if (!record || !effectiveGuidance) return;
    const nextGuidance = {
      ...effectiveGuidance,
      actions: effectiveGuidance.actions.map((action: GuidanceAction) =>
        action.id === actionId ? { ...action, done: !action.done } : action,
      ),
    };
    setRecord({ ...record, guidance: nextGuidance });
    void saveRecordPatch({ guidance: nextGuidance });
  }

  function saveReview() {
    void saveRecordPatch({
      review: {
        ...review,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <Shell>
      <section className="mx-auto max-w-5xl py-12">
        <div className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">占卜记录</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">记录详情</h1>

          {loading ? <p className="mt-8 text-stone-300">读取中...</p> : null}
          {!loading && error ? <p className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">{error}</p> : null}

          {record ? (
            <>
              <div className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
                <p className="text-sm text-stone-400">{record.topic} · {new Date(record.savedAt).toLocaleString("zh-CN")}</p>
                <h2 className="mt-2 text-3xl font-semibold">
                  {record.result.hexagramName} · {record.result.movingLine} 爻动 · 之 {record.result.changedHexagramName}
                </h2>
                {record.question ? (
                  <p className="mt-4 rounded-2xl border border-yellow-500/20 bg-black/20 p-4 text-sm leading-7 text-stone-300">
                    所问事项：{record.question}
                  </p>
                ) : null}
                <p className="mt-4 leading-8 text-stone-300">
                  {getPlainHexagramSummary(record.result.hexagramName)}
                  {movingPlain ? ` 动爻提示：${movingPlain.summary}` : ""}
                  变卦提示：{getPlainHexagramSummary(record.result.changedHexagramName)}
                </p>
              </div>

              <div className="mt-8 grid gap-5">
                <DetailPanel
                  label="本卦 · 30%"
                  title={record.result.hexagramName}
                  plainText={primaryTranslation?.modernText}
                  sourceNote={primaryTranslation ? formatTranslationBasis(primaryTranslation.basis) : undefined}
                  text={record.result.primaryText?.judgment}
                />
                <DetailPanel
                  label="动爻 · 51%"
                  title={`${record.result.movingLine} 爻动`}
                  plainText={movingTranslation?.modernText}
                  sourceNote={movingTranslation ? formatTranslationBasis(movingTranslation.basis) : undefined}
                  text={record.result.movingLineText?.original}
                  caseText={record.result.movingLineText?.caseText}
                  casePlainText={movingTranslation?.caseModern}
                  emphasized
                />
                <DetailPanel
                  label="变卦 · 19%"
                  title={record.result.changedHexagramName}
                  plainText={changedTranslation?.modernText}
                  sourceNote={changedTranslation ? formatTranslationBasis(changedTranslation.basis) : undefined}
                  text={record.result.changedText?.judgment}
                />
              </div>

              <section className="mt-8 rounded-[1.5rem] border border-yellow-500/30 bg-yellow-500/10 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-stone-400">大模型辅助分析</p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {record.analysis?.provider === "openai" ? "模型分析" : "规则分析"}
                    </h3>
                  </div>
                  <button onClick={regenerateAnalysis} disabled={analyzing} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25 disabled:cursor-not-allowed disabled:opacity-60">
                    {analyzing ? "分析中..." : "重新分析"}
                  </button>
                </div>
                {record.analysis ? (
                  <div className="mt-5 grid gap-4">
                    <AnalysisBlock label="简明判断" value={record.analysis.summary} />
                    <AnalysisBlock label="风险" value={record.analysis.risk} />
                    <AnalysisBlock label="机会" value={record.analysis.opportunity} />
                    <AnalysisBlock label="行动建议" value={record.analysis.action} />
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-stone-300">这条记录还没有分析结果，可以点击重新分析生成。</p>
                )}
              </section>

              <section className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
                <p className="text-sm text-stone-400">行动清单与复盘</p>
                <h3 className="mt-2 text-2xl font-semibold">把这一卦落到行为上</h3>
                {effectiveGuidance?.actions?.length ? (
                  <div className="mt-5 grid gap-3">
                    {effectiveGuidance.actions.map((action) => (
                      <label key={action.id} className="flex items-start gap-3 rounded-2xl border border-stone-700 bg-stone-950/35 p-4 text-sm leading-7 text-stone-300">
                        <input
                          type="checkbox"
                          checked={action.done}
                          onChange={() => toggleAction(action.id)}
                          className="mt-2 h-4 w-4 accent-yellow-400"
                        />
                        <span className={action.done ? "text-stone-500 line-through" : ""}>{action.text}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl border border-stone-700 bg-stone-950/35 p-4 text-sm text-stone-300">
                    暂无行动清单。
                  </p>
                )}

                <div className="mt-6 grid gap-4">
                  <ReviewField
                    label="我采取了什么行动"
                    value={review.actionTaken}
                    onChange={(value) => setReview((item) => ({ ...item, actionTaken: value }))}
                  />
                  <ReviewField
                    label="后续结果"
                    value={review.outcome}
                    onChange={(value) => setReview((item) => ({ ...item, outcome: value }))}
                  />
                  <ReviewField
                    label="我的复盘"
                    value={review.reflection}
                    onChange={(value) => setReview((item) => ({ ...item, reflection: value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={saveReview}
                  disabled={savingRecord}
                  className="mt-5 rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-sm text-yellow-100 hover:bg-yellow-500/25 disabled:opacity-60"
                >
                  {savingRecord ? "保存中..." : "保存复盘"}
                </button>
                {saveMessage ? <p className="mt-3 text-sm text-stone-400">{saveMessage}</p> : null}
              </section>

              <details className="mt-8 rounded-2xl border border-stone-700 bg-black/20 p-5">
                <summary className="cursor-pointer text-sm gold-text">模型分析上下文</summary>
                <pre className="mt-4 whitespace-pre-wrap text-xs leading-6 text-stone-300">{record.modelPrompt}</pre>
              </details>

              <Link href="/account" className="gold-text mt-8 inline-block underline">
                返回账户
              </Link>
            </>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

function buildGuidanceFromRecord(record: StoredDivinationRecord): DivinationGuidance {
  const recommendations = buildLearningRecommendations(record.result, record.topic);
  return {
    recommendations,
    actions: recommendations.map((item, index) => ({
      id: `${item.lessonId}-${index}`,
      text: item.action,
      done: false,
    })),
  };
}

function ReviewField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm gold-text">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="resize-none rounded-2xl border border-stone-700 bg-stone-950/60 p-4 text-sm leading-7 text-stone-100 outline-none focus:border-yellow-500/40"
      />
    </label>
  );
}

function AnalysisBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
      <p className="text-sm gold-text">{label}</p>
      <p className="mt-2 text-sm leading-7 text-stone-200">{value}</p>
    </div>
  );
}

function DetailPanel({
  label,
  title,
  plainText,
  sourceNote,
  text,
  caseText,
  casePlainText,
  emphasized = false,
}: {
  label: string;
  title: string;
  plainText?: string;
  sourceNote?: string;
  text?: string;
  caseText?: string;
  casePlainText?: string;
  emphasized?: boolean;
}) {
  return (
    <section className={`rounded-[1.5rem] border p-6 ${emphasized ? "border-yellow-500/40 bg-yellow-500/10" : "border-stone-700 bg-stone-950/35"}`}>
      <p className="text-sm text-stone-400">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
      {plainText ? (
        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
          <p className="text-sm gold-text">白话译写</p>
          {sourceNote ? <p className="mt-2 text-xs text-stone-500">依据：{sourceNote}</p> : null}
          <p className="mt-2 text-sm leading-7 text-stone-200">{plainText}</p>
        </div>
      ) : null}
      <p className="mt-4 text-sm leading-7 text-stone-300">{trimOriginalText(text ?? "", 900)}</p>
      {casePlainText ? (
        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <p className="text-sm gold-text">占例白话</p>
          <p className="mt-2 text-sm leading-7 text-stone-200">{casePlainText}</p>
        </div>
      ) : null}
      {caseText ? (
        <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
          <p className="text-sm gold-text">占例原文</p>
          <p className="mt-2 text-sm leading-7 text-stone-300">{trimOriginalText(caseText, 520)}</p>
        </div>
      ) : null}
    </section>
  );
}
