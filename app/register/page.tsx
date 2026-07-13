"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  gender: "男" | "女" | "其他";
  age: string;
  province: string;
  city: string;
  district: string;
  industry: string;
};

const initialForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  gender: "男",
  age: "",
  province: "",
  city: "",
  district: "",
  industry: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age) }),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "注册失败。");
      return;
    }

    router.push("/account");
  }

  return (
    <Shell>
      <section className="mx-auto max-w-4xl py-12">
        <div className="ritual-card rounded-[2rem] p-6 sm:p-10">
          <p className="gold-text text-sm tracking-[0.4em]">账户资料</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">注册</h1>
          <form onSubmit={submit} className="mt-8 grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="姓名">
                <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} className="input-field" />
              </Field>
              <Field label="邮箱">
                <input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="input-field" />
              </Field>
              <Field label="密码">
                <input required minLength={8} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} className="input-field" />
              </Field>
              <Field label="性别">
                <select value={form.gender} onChange={(event) => updateField("gender", event.target.value as RegisterForm["gender"])} className="input-field">
                  <option>男</option>
                  <option>女</option>
                  <option>其他</option>
                </select>
              </Field>
              <Field label="年龄">
                <input required type="number" min={0} max={120} value={form.age} onChange={(event) => updateField("age", event.target.value)} className="input-field" />
              </Field>
              <Field label="行业">
                <input required value={form.industry} onChange={(event) => updateField("industry", event.target.value)} className="input-field" />
              </Field>
              <Field label="省">
                <input required value={form.province} onChange={(event) => updateField("province", event.target.value)} className="input-field" />
              </Field>
              <Field label="市">
                <input required value={form.city} onChange={(event) => updateField("city", event.target.value)} className="input-field" />
              </Field>
              <Field label="区/县">
                <input required value={form.district} onChange={(event) => updateField("district", event.target.value)} className="input-field" />
              </Field>
            </div>

            {error ? <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</p> : null}
            <button disabled={submitting} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 text-yellow-100 hover:bg-yellow-500/25 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "注册中..." : "创建账户"}
            </button>
            <p className="text-sm text-stone-400">
              已有账户？
              <Link href="/login" className="gold-text ml-2 underline">去登录</Link>
            </p>
          </form>
        </div>
      </section>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-stone-300">
      {label}
      {children}
    </label>
  );
}
