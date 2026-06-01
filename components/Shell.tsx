import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between text-sm text-stone-300">
        <Link href="/" className="gold-text tracking-[0.35em] hover:text-yellow-200">
          高导易断
        </Link>
        <div className="flex gap-4">
          <Link href="/divination" className="hover:text-yellow-200">起卦</Link>
          <Link href="/learn" className="hover:text-yellow-200">八卦学习</Link>
        </div>
      </nav>
      {children}
    </main>
  );
}
