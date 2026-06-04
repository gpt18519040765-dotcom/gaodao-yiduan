"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getLesson, lessons } from "@/data/learn-course";

const localProgressKey = "gaodao-learning-progress";

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const lesson = getLesson(params.id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [message, setMessage] = useState("学习进度会先保存在本机，登录后自动同步到账户。");

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
          setMessage("学习进度已同步到账户。");
        }
      })
      .catch(() => setMessage("学习进度已保存在本机，登录后可同步。"));
  }, []);

  async function toggleDone() {
    if (!lesson) return;
    const nextCompleted = completed.includes(lesson.id)
      ? completed.filter((item) => item !== lesson.id)
      : [...completed, lesson.id];

    setCompleted(nextCompleted);
    localStorage.setItem(localProgressKey, JSON.stringify(nextCompleted));

    const response = await fetch("/api/learning-progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedLessonIds: nextCompleted }),
    });
    setMessage(response.ok ? "学习进度已同步到账户。" : "学习进度已保存在本机，登录后可同步到账户。");
  }

  const currentIndex = lesson ? lessons.findIndex((item) => item.id === lesson.id) : -1;
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <Shell>
      <section className="mx-auto max-w-5xl py-12">
        {!lesson ? (
          <div className="ritual-card rounded-[2rem] p-8">
            <p className="gold-text text-sm tracking-[0.35em]">课程不存在</p>
            <h1 className="mt-3 text-3xl font-semibold">没有找到这节课</h1>
            <Link href="/learn" className="gold-text mt-6 inline-block underline">返回学易课程</Link>
          </div>
        ) : (
          <article className="ritual-card rounded-[2rem] p-6 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="gold-text text-sm tracking-[0.35em]">{lesson.stage} · {lesson.duration}</p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{lesson.title}</h1>
                <p className="mt-5 max-w-3xl leading-8 text-stone-300">{lesson.goal}</p>
              </div>
              <button
                type="button"
                onClick={toggleDone}
                className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-sm text-yellow-100 hover:bg-yellow-500/25"
              >
                {completed.includes(lesson.id) ? "已完成" : "标记完成"}
              </button>
            </div>

            <p className="mt-5 text-xs leading-6 text-stone-500">{message}</p>

            <section className="mt-8 border-t border-yellow-500/20 pt-6">
              <h2 className="text-xl font-semibold gold-text">详细讲解</h2>
              <div className="mt-5 grid gap-4">
                {lesson.detail.map((paragraph) => (
                  <p key={paragraph} className="rounded-2xl border border-stone-700 bg-black/20 p-5 text-sm leading-8 text-stone-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                <h2 className="text-lg font-semibold gold-text">练习</h2>
                <p className="mt-3 text-sm leading-7 text-stone-200">{lesson.practice}</p>
              </div>
              <div className="rounded-2xl border border-stone-700 bg-black/20 p-5">
                <h2 className="text-lg font-semibold gold-text">自问</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">{lesson.reflection}</p>
              </div>
            </section>

            <section className="mt-8 border-t border-stone-700 pt-6">
              <h2 className="text-xl font-semibold gold-text">核心要点</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-stone-300">
                {lesson.core.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/learn" className="rounded-full border border-stone-600 px-5 py-3 text-center text-sm text-stone-200 hover:border-yellow-500/40">
                返回课程
              </Link>
              <div className="flex flex-col gap-3 sm:flex-row">
                {previousLesson ? (
                  <Link href={`/learn/${previousLesson.id}`} className="rounded-full border border-stone-600 px-5 py-3 text-center text-sm text-stone-200 hover:border-yellow-500/40">
                    上一课
                  </Link>
                ) : null}
                {nextLesson ? (
                  <Link href={`/learn/${nextLesson.id}`} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-center text-sm text-yellow-100 hover:bg-yellow-500/25">
                    下一课
                  </Link>
                ) : (
                  <Link href="/divination" className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-3 text-center text-sm text-yellow-100 hover:bg-yellow-500/25">
                    去问一卦
                  </Link>
                )}
              </div>
            </div>
          </article>
        )}
      </section>
    </Shell>
  );
}
