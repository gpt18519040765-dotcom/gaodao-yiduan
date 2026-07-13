"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/divination", label: "问事" },
  { href: "/learn", label: "学易" },
  { href: "/goals", label: "目标" },
  { href: "/account", label: "我的" },
  { href: "/login", label: "登录" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-stone-300 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="gold-text tracking-[0.35em] hover:text-yellow-200 active:scale-95">
          高导易断
        </Link>
        <div className="flex flex-wrap gap-1.5 sm:gap-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 active:scale-95 ${
                  active ? "bg-yellow-500/15 text-yellow-100" : "hover:bg-yellow-500/10 hover:text-yellow-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </main>
  );
}
