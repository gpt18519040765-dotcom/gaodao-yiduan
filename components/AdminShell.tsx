import Link from "next/link";
import type { ReactNode } from "react";

const adminNav = [
  { label: "总览", href: "#overview" },
  { label: "用户", href: "#users" },
  { label: "占卜记录", href: "#records" },
  { label: "咨询", href: "#consultations" },
  { label: "内容", href: "#content" },
  { label: "设置", href: "#settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#080806] text-stone-100">
      <header className="border-b border-yellow-500/15 bg-black/20 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="gold-text text-xs tracking-[0.35em]">高导易断</p>
            <h1 className="mt-1 text-xl font-semibold">后台管理</h1>
          </div>
          <Link href="/" className="rounded-full border border-yellow-500/30 px-4 py-2 text-sm text-stone-300 hover:text-yellow-200">
            返回前台
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-[1.25rem] border border-yellow-500/15 bg-stone-950/50 p-4 lg:sticky lg:top-6 lg:h-fit">
          <nav className="grid gap-2 text-sm">
            {adminNav.map((item) => (
              <a key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-stone-300 hover:bg-yellow-500/10 hover:text-yellow-100">
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}
