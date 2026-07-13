"use client";

import { FormEvent, useState } from "react";

export function ConsultationFloat({ source }: { source: string }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [issue, setIssue] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const response = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, phone, preferredTime, issue }),
    });
    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error ?? "提交失败。");
      return;
    }

    setPhone("");
    setPreferredTime("");
    setIssue("");
    setMessage("已提交，后台可见。");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="mb-3 w-[min(22rem,calc(100vw-3rem))] rounded-2xl border border-yellow-500/25 bg-stone-950 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="gold-text text-sm">心理咨询</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">留下电话、时间和事情，仅本人及后台可见。</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-stone-400 hover:text-yellow-200">关闭</button>
          </div>

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="联系电话" className="input-field" />
            <input value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} placeholder="想要的咨询时间" className="input-field" />
            <textarea value={issue} onChange={(event) => setIssue(event.target.value)} rows={3} placeholder="想咨询的事情" className="input-field resize-none" />
            {message ? <p className="text-xs leading-5 text-stone-300">{message}</p> : null}
            <button disabled={submitting} className="rounded-full border border-yellow-500/40 bg-yellow-500/15 px-5 py-2 text-sm text-yellow-100 hover:bg-yellow-500/25 disabled:opacity-60">
              {submitting ? "提交中..." : "提交咨询需求"}
            </button>
          </form>
        </div>
      ) : null}

      <button type="button" onClick={() => setOpen((current) => !current)} className="rounded-full border border-yellow-500/40 bg-yellow-500 px-5 py-3 text-sm font-semibold text-stone-950 shadow-xl hover:bg-yellow-300">
        咨询
      </button>
    </div>
  );
}
