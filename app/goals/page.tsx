"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ConsultationFloat } from "@/components/ConsultationFloat";
import { Shell } from "@/components/Shell";

type GoalMetric = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
};

type GoalFramework = {
  id: "smart" | "okr" | "woop" | "star" | "grow";
  name: string;
  useWhen: string;
  structure: string[];
  output: string;
};

type GoalAction = {
  id: string;
  horizon: string;
  text: string;
  done: boolean;
};

const initialMetrics: GoalMetric[] = [
  { id: "age", label: "年龄", current: 28, target: 35, unit: "岁" },
  { id: "education", label: "学历/能力", current: 60, target: 85, unit: "分" },
  { id: "assets", label: "资产", current: 20, target: 100, unit: "万" },
];

const localGoalPlanKey = "gaodao-goal-plan";

const frameworks: GoalFramework[] = [
  {
    id: "smart",
    name: "SMART",
    useWhen: "目标还比较虚，需要写清楚、量化和限定时间。",
    structure: ["明确具体", "可衡量", "可达成", "与人生主线相关", "有截止时间"],
    output: "输出一句清晰目标：在什么时间前，把哪个指标从多少提升到多少。",
  },
  {
    id: "okr",
    name: "OKR",
    useWhen: "目标较大，需要把方向和关键结果分开。",
    structure: ["Objective：一句方向", "Key Result 1：结果指标", "Key Result 2：结果指标", "Initiatives：本周行动"],
    output: "输出一个方向目标和 2-3 个可衡量关键结果。",
  },
  {
    id: "woop",
    name: "WOOP",
    useWhen: "知道想要什么，但容易拖延或被障碍打断。",
    structure: ["Wish：愿望", "Outcome：最好结果", "Obstacle：内外阻碍", "Plan：如果遇到阻碍，就采取什么动作"],
    output: "输出一条 if-then 执行计划。",
  },
  {
    id: "star",
    name: "STAR",
    useWhen: "需要复盘经验、建立信心，或把成功/失败案例讲清楚。",
    structure: ["Situation：当时处境", "Task：要解决的任务", "Action：采取的行动", "Result：得到的结果"],
    output: "输出一条基于事实的案例，用来证明自己做得到、也看清哪里需要调整。",
  },
  {
    id: "grow",
    name: "GROW",
    useWhen: "目标方向有了，但路径还不清楚，需要教练式追问。",
    structure: ["Goal：目标", "Reality：现实", "Options：选择", "Will：承诺动作"],
    output: "输出下一步承诺和备选路径。",
  },
];

const evidenceCases = [
  {
    title: "SMART：目标写清楚比口号更有用",
    source: "George T. Doran, Management Review, 1981",
    url: "https://openurl.ebsco.com/fulltext/gcd%3A6043491",
    text: "SMART 最早用于管理目标写作，核心不是玄学激励，而是让目标具体、可衡量、可分配、现实且有时间边界。适合把“我要变好”改成“90 天内完成 12 次主动社交并复盘”。",
  },
  {
    title: "WOOP：把障碍提前写出来",
    source: "Mental contrasting with implementation intentions meta-analysis",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8149892/",
    text: "WOOP 来自心理对比与执行意图。它不只想象好结果，还要求提前识别障碍并写 if-then 计划，适合拖延、反复中断和执行不稳的目标。",
  },
  {
    title: "OKR：大目标要拆成关键结果",
    source: "Google re:Work / Set goals with OKRs",
    url: "https://rework.withgoogle.com/intl/en/guides/set-goals-with-okrs",
    text: "OKR 常用于组织目标管理，价值在于把方向和衡量结果分开。个人目标也可借鉴：目标负责方向，关键结果负责检验，行动项负责本周推进。",
  },
  {
    title: "STAR：用事实案例建立信心",
    source: "常见行为面试与复盘框架",
    url: "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique",
    text: "STAR 的价值是把经历拆成处境、任务、行动和结果。用于人生目标时，它可以把“我不行”的感觉，改成“我曾经做成过什么、靠什么做成、下次怎么复用”。",
  },
];

export default function GoalsPage() {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [goalText, setGoalText] = useState("想建立稳定关系，并逐步走向成家。");
  const [frameworkId, setFrameworkId] = useState<GoalFramework["id"]>("smart");
  const [actions, setActions] = useState<GoalAction[]>([]);
  const [saveMessage, setSaveMessage] = useState("目标计划会先保存在本机，登录后可同步到账户。");
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCurrent, setNewCurrent] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const activeFramework = frameworks.find((item) => item.id === frameworkId) ?? frameworks[0];
  const plan = useMemo(() => buildPlan(goalText, metrics, activeFramework), [goalText, metrics, activeFramework]);
  const generatedActions = useMemo(() => buildActions(goalText, metrics, activeFramework), [goalText, metrics, activeFramework]);

  useEffect(() => {
    const localPlan = readLocalGoalPlan();
    if (localPlan) {
      queueMicrotask(() => {
        setGoalText(localPlan.goalText);
        setFrameworkId(localPlan.frameworkId);
        setMetrics(localPlan.metrics);
        setActions(localPlan.actions);
        setNotes(localPlan.notes);
      });
    } else {
      queueMicrotask(() => setActions(generatedActions));
    }

    fetch("/api/goal-plan")
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (!payload?.plan) return;
        setGoalText(payload.plan.goalText);
        setFrameworkId(payload.plan.frameworkId);
        setMetrics(payload.plan.metrics);
        setActions(payload.plan.actions);
        setNotes(payload.plan.notes);
        setSaveMessage("目标计划已从账户读取。");
      })
      .catch(() => setSaveMessage("目标计划已保存在本机，登录后可同步。"));
    // Initial hydration only; generated actions are used as default state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateMetric(id: string, key: "current" | "target", value: string) {
    const number = Number(value);
    setMetrics((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: Number.isFinite(number) ? number : 0 } : item)),
    );
  }

  function addMetric(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = Number(newCurrent);
    const target = Number(newTarget);
    if (!newLabel || !Number.isFinite(current) || !Number.isFinite(target)) return;
    setMetrics((items) => [
      ...items,
      { id: crypto.randomUUID(), label: newLabel, current, target, unit: newUnit || "项" },
    ]);
    setNewLabel("");
    setNewCurrent("");
    setNewTarget("");
    setNewUnit("");
  }

  function addNote() {
    setNotes((items) => [`${new Date().toLocaleString("zh-CN")}：${goalText}`, ...items]);
  }

  function regenerateActions() {
    setActions(generatedActions);
    setSaveMessage("已按当前目标和方法重新生成行动表，保存后生效。");
  }

  function toggleAction(id: string) {
    setActions((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  }

  async function saveGoalPlan() {
    const payload = { goalText, frameworkId, metrics, actions, notes };
    localStorage.setItem(localGoalPlanKey, JSON.stringify(payload));
    setSaving(true);
    const response = await fetch("/api/goal-plan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (response.ok) {
      setSaveMessage("目标计划已保存并同步到账户。");
    } else {
      setSaveMessage("目标计划已保存在本机。登录后可同步到账户。");
    }
  }

  return (
    <Shell>
      <section className="mx-auto max-w-6xl py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">长期陪伴</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">目标路径</h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-stone-300">
            把长期目标拆成现状、目标、差距和下一步。短期看一件事，长期看选择习惯、处境变化和行动节奏。
          </p>
          <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-7 text-stone-300">{saveMessage}</p>
            <button
              type="button"
              onClick={saveGoalPlan}
              disabled={saving}
              className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25 disabled:opacity-60"
            >
              {saving ? "保存中..." : "保存目标计划"}
            </button>
          </div>

          <label className="mt-8 grid gap-3 text-stone-300">
            人生目标
            <textarea value={goalText} onChange={(event) => setGoalText(event.target.value)} rows={3} className="input-field resize-none" />
          </label>

          <section className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
            <p className="text-sm text-stone-400">目标拆解方法</p>
            <h2 className="mt-2 text-2xl font-semibold">选择一种当前最合适的方法</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {frameworks.map((framework) => (
                <button
                  key={framework.id}
                  type="button"
                  onClick={() => setFrameworkId(framework.id)}
                  className={`rounded-2xl border p-4 text-left ${framework.id === frameworkId ? "border-yellow-500/45 bg-yellow-500/10" : "border-stone-700 bg-stone-950/35 hover:border-yellow-500/30"}`}
                >
                  <p className="gold-text font-semibold">{framework.name}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-400">{framework.useWhen}</p>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
              <div className="border-t border-stone-700 pt-4">
                <p className="text-sm gold-text">拆解结构</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-stone-300">
                  {activeFramework.structure.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="border-t border-stone-700 pt-4">
                <p className="text-sm gold-text">最终产出</p>
                <p className="mt-3 text-sm leading-7 text-stone-300">{activeFramework.output}</p>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-5">
            {metrics.map((metric) => (
              <MetricEditor key={metric.id} metric={metric} onChange={updateMetric} />
            ))}
          </div>

          <form onSubmit={addMetric} className="mt-8 grid gap-3 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-5 md:grid-cols-[1fr_120px_120px_100px_auto]">
            <input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="新增项目，如社交圈" className="input-field" />
            <input value={newCurrent} onChange={(event) => setNewCurrent(event.target.value)} placeholder="现状" className="input-field" />
            <input value={newTarget} onChange={(event) => setNewTarget(event.target.value)} placeholder="目标" className="input-field" />
            <input value={newUnit} onChange={(event) => setNewUnit(event.target.value)} placeholder="单位" className="input-field" />
            <button className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25">增加</button>
          </form>

          <section className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
            <p className="text-sm text-stone-400">AI 辅助拆分路径</p>
            <h2 className="mt-2 text-2xl font-semibold">{activeFramework.name} 阶段建议</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {plan.map((item) => (
                <div key={item.title} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-4">
                  <p className="gold-text text-sm">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-300">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-stone-400">落地行动表</p>
                <h2 className="mt-2 text-2xl font-semibold">把方法变成可执行动作</h2>
              </div>
              <button
                type="button"
                onClick={regenerateActions}
                className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25"
              >
                重新生成行动表
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {actions.map((action) => (
                <label key={action.id} className="grid gap-2 rounded-2xl border border-stone-700 bg-stone-950/35 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <span className="text-sm gold-text">{action.horizon}</span>
                  <span className={action.done ? "text-sm leading-7 text-stone-500 line-through" : "text-sm leading-7 text-stone-300"}>{action.text}</span>
                  <input type="checkbox" checked={action.done} onChange={() => toggleAction(action.id)} className="h-4 w-4 accent-yellow-400" />
                </label>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[1.5rem] border border-stone-700 bg-stone-950/35 p-6">
            <p className="text-sm text-stone-400">据实案例</p>
            <h2 className="mt-2 text-2xl font-semibold">案例给信心，但不承诺照搬有效</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {evidenceCases.map((item) => (
                <a key={item.title} href={item.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-stone-700 bg-black/20 p-5 hover:border-yellow-500/35">
                  <p className="gold-text text-sm">{item.title}</p>
                  <p className="mt-2 text-xs text-stone-500">{item.source}</p>
                  <p className="mt-3 text-sm leading-7 text-stone-300">{item.text}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[1.5rem] border border-stone-700 bg-stone-950/35 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-stone-400">编辑记录</p>
                <h2 className="mt-2 text-2xl font-semibold">阶段复盘</h2>
              </div>
              <button onClick={addNote} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25">
                保存当前记录
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {notes.length === 0 ? (
                <p className="text-sm text-stone-400">暂无记录。</p>
              ) : (
                notes.map((note) => <p key={note} className="rounded-2xl border border-stone-700 bg-black/20 p-4 text-sm text-stone-300">{note}</p>)
              )}
            </div>
          </section>

          <p className="mt-6 text-sm leading-7 text-stone-500">
            涉及严重心理困扰、医疗、法律、重大财务风险时，本系统只做文化参考和思路整理，应优先寻求专业帮助。
          </p>
        </motion.div>
      </section>
      <ConsultationFloat source="goals" />
    </Shell>
  );
}

function readLocalGoalPlan() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(localGoalPlanKey) ?? "null") as {
      goalText: string;
      frameworkId: GoalFramework["id"];
      metrics: GoalMetric[];
      actions: GoalAction[];
      notes: string[];
    } | null;
  } catch {
    return null;
  }
}

function MetricEditor({ metric, onChange }: { metric: GoalMetric; onChange: (id: string, key: "current" | "target", value: string) => void }) {
  const progress = metric.target === 0 ? 0 : Math.min(100, Math.max(0, (metric.current / metric.target) * 100));

  return (
    <div className="rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="gold-text text-lg font-semibold">{metric.label}</p>
          <p className="mt-1 text-sm text-stone-400">
            现状 {metric.current}{metric.unit} / 目标 {metric.target}{metric.unit}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={metric.current} onChange={(event) => onChange(metric.id, "current", event.target.value)} className="input-field" />
          <input value={metric.target} onChange={(event) => onChange(metric.id, "target", event.target.value)} className="input-field" />
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-stone-800">
        <div className="h-full rounded-full bg-yellow-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function buildPlan(goal: string, metrics: GoalMetric[], framework: GoalFramework) {
  const weakMetric = metrics
    .map((metric) => ({ ...metric, progress: metric.target === 0 ? 0 : metric.current / metric.target }))
    .sort((a, b) => a.progress - b.progress)[0];

  const base = {
    main: goal ? `当前主线是：${goal}` : "先写清楚真正想达成的目标，避免把临时情绪当长期方向。",
    weak: weakMetric ? `目前差距较明显的是「${weakMetric.label}」，先做能提升这个项目的小步骤。` : "先列出现状指标，再找最短板。",
  };

  if (framework.id === "okr") {
    return [
      { title: "Objective", text: base.main },
      { title: "Key Result", text: weakMetric ? `把「${weakMetric.label}」设成关键结果：从 ${weakMetric.current}${weakMetric.unit} 提升到 ${weakMetric.target}${weakMetric.unit}。` : "先选 2-3 个可衡量结果。" },
      { title: "Initiatives", text: "本周只定 1-3 个行动项，避免把 OKR 写成愿望清单。" },
    ];
  }

  if (framework.id === "woop") {
    return [
      { title: "Wish / Outcome", text: base.main },
      { title: "Obstacle", text: `${base.weak} 同时写出最可能打断你的障碍。` },
      { title: "Plan", text: "写成：如果遇到这个障碍，我就采取一个具体动作。" },
    ];
  }

  if (framework.id === "star") {
    return [
      { title: "Situation / Task", text: "先记录真实处境和这阶段要解决的任务，不美化、不夸大。" },
      { title: "Action", text: `${base.weak} 把行动写成自己确实做过、能复用的动作。` },
      { title: "Result", text: "记录结果证据，形成自己的成功案例库；失败案例也要写清学到了什么。" },
    ];
  }

  if (framework.id === "grow") {
    return [
      { title: "Goal", text: base.main },
      { title: "Reality / Options", text: `${base.weak} 至少列出两个可选路径。` },
      { title: "Will", text: "选一个 48 小时内能完成的小承诺。" },
    ];
  }

  return [
    { title: "Specific", text: base.main },
    { title: "Measurable", text: weakMetric ? `用「${weakMetric.label}」衡量进展：${weakMetric.current}${weakMetric.unit} / ${weakMetric.target}${weakMetric.unit}。` : "先补充一个可衡量指标。" },
    { title: "Time-bound", text: "给目标加时间边界，再每周复盘一次行动结果。" },
  ];
}

function buildActions(goal: string, metrics: GoalMetric[], framework: GoalFramework): GoalAction[] {
  const weakMetric = metrics
    .map((metric) => ({ ...metric, progress: metric.target === 0 ? 0 : metric.current / metric.target }))
    .sort((a, b) => a.progress - b.progress)[0];
  const metricText = weakMetric ? `围绕「${weakMetric.label}」推进一次小改善` : "补充一个可衡量指标";
  const goalText = goal || "当前目标";

  if (framework.id === "okr") {
    return [
      { id: "okr-week", horizon: "本周", text: `写出 1 个 Objective：${goalText}`, done: false },
      { id: "okr-30", horizon: "30 天", text: `设置 2 个 Key Results，其中一个必须对应「${weakMetric?.label ?? "核心指标"}」。`, done: false },
      { id: "okr-risk", horizon: "风险预案", text: "每周只保留 1-3 个行动项，避免目标过载。", done: false },
      { id: "okr-review", horizon: "复盘", text: "月底检查关键结果是否有数字变化，而不是只看努力感。", done: false },
    ];
  }

  if (framework.id === "woop") {
    return [
      { id: "woop-week", horizon: "本周", text: `写清 Wish 和 Outcome：${goalText}`, done: false },
      { id: "woop-30", horizon: "30 天", text: "找出最常出现的阻碍，并做一次 if-then 计划演练。", done: false },
      { id: "woop-risk", horizon: "风险预案", text: `如果「${metricText}」被打断，就改用一个更小动作继续。`, done: false },
      { id: "woop-review", horizon: "复盘", text: "记录阻碍出现时，自己是否真的执行了 if-then 计划。", done: false },
    ];
  }

  if (framework.id === "star") {
    return [
      { id: "star-week", horizon: "本周", text: "记录一个真实处境：发生了什么、自己要解决什么。", done: false },
      { id: "star-30", horizon: "30 天", text: "积累 3 条 STAR 案例，形成自己的信心证据。", done: false },
      { id: "star-risk", horizon: "风险预案", text: "案例必须基于事实结果，不把愿望包装成成果。", done: false },
      { id: "star-review", horizon: "复盘", text: "每条案例都写清 Situation、Task、Action、Result。", done: false },
    ];
  }

  if (framework.id === "grow") {
    return [
      { id: "grow-week", horizon: "本周", text: `明确 Goal，并写出现实 Reality：${goalText}`, done: false },
      { id: "grow-30", horizon: "30 天", text: "列出至少 2 条 Options，并选择一条持续执行。", done: false },
      { id: "grow-risk", horizon: "风险预案", text: "当原路径不通时，立刻切换到第二路径，不停在纠结里。", done: false },
      { id: "grow-review", horizon: "复盘", text: "每周写一次 Will：下周具体承诺什么。", done: false },
    ];
  }

  return [
    { id: "smart-week", horizon: "本周", text: `把目标写成 SMART 句式：${goalText}`, done: false },
    { id: "smart-30", horizon: "30 天", text: `${metricText}，并记录至少 4 次进展。`, done: false },
    { id: "smart-risk", horizon: "风险预案", text: "如果目标不可达，先缩小范围，不直接放弃。", done: false },
    { id: "smart-review", horizon: "复盘", text: "每周检查目标是否仍具体、可衡量、有时间边界。", done: false },
  ];
}
