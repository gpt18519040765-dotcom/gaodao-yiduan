"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";

type AdminUser = {
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

type AdminRecord = {
  id: string;
  userId: string;
  question: string;
  topic: string;
  savedAt: string;
  result: {
    hexagramName: string;
    movingLine: number;
    changedHexagramName: string;
  };
};

type AdminSummary = {
  users: AdminUser[];
  records: AdminRecord[];
  consultations: {
    id: string;
    userId: string;
    source: string;
    phone: string;
    preferredTime: string;
    issue: string;
    createdAt: string;
  }[];
  stats: {
    userCount: number;
    recordCount: number;
    consultationCount: number;
    latestRecordAt: string | null;
  };
};

export default function AdminPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/summary")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          setError(payload.error ?? "无法访问后台。");
          return null;
        }
        return payload;
      })
      .then((payload) => setSummary(payload))
      .finally(() => setLoading(false));
  }, []);

  const userById = useMemo(() => new Map(summary?.users.map((user) => [user.id, user]) ?? []), [summary]);

  return (
    <AdminShell>
      <section>
        <div className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">后台</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">管理面板</h1>

          {loading ? <p className="mt-8 text-stone-300">读取中...</p> : null}
          {!loading && error ? <p className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">{error}</p> : null}

          {summary ? (
            <>
              <div id="overview" className="mt-8 grid gap-4 md:grid-cols-3">
                <Stat label="用户数" value={`${summary.stats.userCount}`} />
                <Stat label="占卜记录" value={`${summary.stats.recordCount}`} />
                <Stat label="咨询需求" value={`${summary.stats.consultationCount}`} />
              </div>

              <section id="users" className="mt-10 scroll-mt-8">
                <h2 className="text-2xl font-semibold">用户</h2>
                <div className="mt-5 overflow-hidden rounded-2xl border border-yellow-500/20">
                  <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr] gap-4 bg-yellow-500/10 p-4 text-sm text-stone-300">
                    <span>姓名</span>
                    <span>邮箱</span>
                    <span>地区</span>
                    <span>行业</span>
                  </div>
                  {summary.users.length === 0 ? (
                    <p className="p-4 text-stone-400">暂无用户。</p>
                  ) : (
                    summary.users.map((user) => (
                      <div key={user.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr] gap-4 border-t border-yellow-500/10 p-4 text-sm text-stone-200">
                        <span>{user.name} · {user.profile.gender} · {user.profile.age}</span>
                        <span>{user.email}</span>
                        <span>{user.profile.province} {user.profile.city} {user.profile.district}</span>
                        <span>{user.profile.industry}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section id="records" className="mt-10 scroll-mt-8">
                <h2 className="text-2xl font-semibold">占卜记录</h2>
                <div className="mt-5 grid gap-4">
                  {summary.records.length === 0 ? (
                    <p className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5 text-stone-300">暂无占卜记录。</p>
                  ) : (
                    summary.records.map((record) => {
                      const owner = userById.get(record.userId);
                      return (
                        <div key={record.id} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5">
                          <p className="text-sm text-stone-400">
                            {owner?.name ?? "未知用户"} · {record.topic} · {new Date(record.savedAt).toLocaleString("zh-CN")}
                          </p>
                          {record.question ? <p className="mt-2 text-sm leading-6 text-stone-300">所问：{record.question}</p> : null}
                          <p className="mt-2 text-xl font-semibold">
                            {record.result.hexagramName} · {record.result.movingLine} 爻动 · 之 {record.result.changedHexagramName}
                          </p>
                          <Link href={`/records/${record.id}`} className="gold-text mt-3 inline-block text-sm underline">
                            查看详情
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section id="consultations" className="mt-10 scroll-mt-8">
                <h2 className="text-2xl font-semibold">心理咨询需求</h2>
                <div className="mt-5 grid gap-4">
                  {summary.consultations.length === 0 ? (
                    <p className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5 text-stone-300">暂无咨询需求。</p>
                  ) : (
                    summary.consultations.map((item) => {
                      const owner = userById.get(item.userId);
                      return (
                        <div key={item.id} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5">
                          <p className="text-sm text-stone-400">
                            {owner?.name ?? "未知用户"} · {item.source} · {new Date(item.createdAt).toLocaleString("zh-CN")}
                          </p>
                          <p className="mt-2 text-sm text-stone-300">电话：{item.phone}</p>
                          <p className="mt-2 text-sm text-stone-300">期望时间：{item.preferredTime}</p>
                          <p className="mt-2 text-sm leading-7 text-stone-300">事情：{item.issue}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section id="content" className="mt-10 scroll-mt-8 rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-6">
                <p className="text-sm text-stone-400">内容</p>
                <h2 className="mt-2 text-2xl font-semibold">卦辞数据与白话校对</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  后续这里用于管理 64 卦、爻辞、占例、分类断语和白话译写。目前内容仍在代码和数据文件中维护。
                </p>
              </section>

              <section id="settings" className="mt-6 scroll-mt-8 rounded-[1.5rem] border border-stone-700 bg-stone-950/35 p-6">
                <p className="text-sm text-stone-400">设置</p>
                <h2 className="mt-2 text-2xl font-semibold">系统配置</h2>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  后续这里用于管理模型配置、会员策略、咨询入口和商业化配置。当前通过环境变量和本地 SQLite 运行。
                </p>
              </section>
            </>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
      <p className="text-sm text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold gold-text">{value}</p>
    </div>
  );
}
