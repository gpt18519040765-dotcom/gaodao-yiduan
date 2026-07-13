"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { lessons } from "@/data/learn-course";

type AccountUser = {
  id: string;
  name: string;
  email: string;
  profile: {
    gender: string;
    age: number;
    province: string;
    city: string;
    district: string;
    industry: string;
  };
  createdAt: string;
};

type AccountRecord = {
  id: string;
  question: string;
  topic: string;
  savedAt: string;
  result: {
    hexagramName: string;
    movingLine: number;
    changedHexagramName: string;
  };
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [records, setRecords] = useState<AccountRecord[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => setUser(payload?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/divination-records")
      .then(async (response) => {
        if (!response.ok) return { records: [] };
        return response.json();
      })
      .then((payload) => setRecords(payload.records ?? []));
    fetch("/api/learning-progress")
      .then(async (response) => {
        if (!response.ok) return { progress: { completedLessonIds: [] } };
        return response.json();
      })
      .then((payload) => setCompletedLessons(payload.progress?.completedLessonIds ?? []));
  }, [user]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <Shell>
      <section className="mx-auto max-w-4xl py-12">
        <div className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">个人中心</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">账户资料</h1>

          {loading ? <p className="mt-8 text-stone-300">正在整理你的记录...</p> : null}

          {!loading && !user ? (
            <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-black/20 p-6 text-stone-300">
              <h2 className="text-2xl font-semibold text-stone-50">尚未登录</h2>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                登录后可查看你的问事记录、目标记录和个人信息。体验版记录保存在当前浏览器。
              </p>
              <Link href="/login" className="mt-5 inline-flex rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-yellow-100 hover:bg-yellow-500/25">
                去登录
              </Link>
            </div>
          ) : null}

          {user ? (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Info label="姓名" value={user.name} />
                <Info label="邮箱" value={user.email} />
                <Info label="性别" value={user.profile.gender} />
                <Info label="年龄" value={`${user.profile.age}`} />
                <Info label="地区" value={`${user.profile.province} ${user.profile.city} ${user.profile.district}`} />
                <Info label="行业" value={user.profile.industry} />
              </div>
              <button onClick={logout} className="mt-8 rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-yellow-100 hover:bg-yellow-500/25">
                退出登录
              </button>

              <section className="mt-10 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">学易进度</h2>
                    <p className="mt-2 text-sm text-stone-400">
                      已完成 {completedLessons.length} / {lessons.length} 节
                    </p>
                  </div>
                  <Link href="/learn" className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-center text-sm text-yellow-100 hover:bg-yellow-500/25">
                    继续学习
                  </Link>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-800">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${Math.round((completedLessons.length / lessons.length) * 100)}%` }} />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {lessons.slice(0, 4).map((lesson) => (
                    <Link key={lesson.id} href={`/learn/${lesson.id}`} className="rounded-2xl border border-stone-700 bg-stone-950/35 p-4 hover:border-yellow-500/35">
                      <p className="text-sm text-stone-500">{lesson.stage} · {lesson.duration}</p>
                      <p className="mt-2 font-semibold text-stone-100">{lesson.title}</p>
                      <p className={completedLessons.includes(lesson.id) ? "gold-text mt-2 text-sm" : "mt-2 text-sm text-stone-500"}>
                        {completedLessons.includes(lesson.id) ? "已完成" : "待学习"}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mt-10">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold">我的占卜记录</h2>
                  <span className="text-sm text-stone-400">{records.length} 条</span>
                </div>
                <div className="mt-5 grid gap-4">
                  {records.length === 0 ? (
                    <p className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5 text-stone-300">还没有保存记录。</p>
                  ) : (
                    records.map((record) => (
                      <div key={record.id} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5">
                        <p className="text-sm text-stone-400">{record.topic} · {new Date(record.savedAt).toLocaleString("zh-CN")}</p>
                        {record.question ? <p className="mt-2 text-sm leading-6 text-stone-300">所问：{record.question}</p> : null}
                        <p className="mt-2 text-xl font-semibold">
                          {record.result.hexagramName} · {record.result.movingLine} 爻动 · 之 {record.result.changedHexagramName}
                        </p>
                        <Link href={`/records/${record.id}`} className="gold-text mt-3 inline-block text-sm underline">
                          查看详情
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5">
      <p className="text-sm text-stone-400">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
