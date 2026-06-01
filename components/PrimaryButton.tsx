import Link from "next/link";
import type { ReactNode } from "react";

const baseClass =
  "inline-flex items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 font-medium text-yellow-100 shadow-lg shadow-yellow-950/30 hover:-translate-y-0.5 hover:border-yellow-300/70 hover:bg-yellow-500/25";

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={baseClass}>
      {children}
    </Link>
  );
}

export function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={baseClass}>
      {children}
    </button>
  );
}
