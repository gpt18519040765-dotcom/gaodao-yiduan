import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-stone-300 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="gold-text tracking-[0.35em] hover:text-yellow-200 active:scale-95">
          高导易断
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link href="/divination" className="rounded-full px-2 py-1 hover:text-yellow-200 active:scale-95">问事</Link>
          <Link href="/learn" className="rounded-full px-2 py-1 hover:text-yellow-200 active:scale-95">学易</Link>
          <Link href="/goals" className="rounded-full px-2 py-1 hover:text-yellow-200 active:scale-95">目标</Link>
          <Link href="/account" className="rounded-full px-2 py-1 hover:text-yellow-200 active:scale-95">我的</Link>
          <Link href="/login" className="rounded-full px-2 py-1 hover:text-yellow-200 active:scale-95">登录</Link>
        </div>
      </nav>
      {children}
    </main>
  );
}
