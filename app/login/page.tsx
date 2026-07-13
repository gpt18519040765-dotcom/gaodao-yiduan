"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "登录失败。");
      return;
    }

    router.push("/account");
  }

  return (
    <Shell>
      <section className="mx-auto max-w-xl py-12">
        <div className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">账户入口</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">登录</h1>
          <form onSubmit={submit} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm text-stone-300">
              邮箱
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" />
            </label>
            <label className="grid gap-2 text-sm text-stone-300">
              密码
              <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" />
            </label>
            {error ? <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</p> : null}
            <button disabled={submitting} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-yellow-100 hover:bg-yellow-500/25 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "登录中..." : "登录"}
            </button>
            <p className="text-sm text-stone-400">
              没有账户？
              <Link href="/register" className="gold-text ml-2 underline">去注册</Link>
            </p>
          </form>
        </div>
      </section>
    </Shell>
  );
}
