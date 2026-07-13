import type { ReactNode } from "react";
import { PressableButton, PressableLink } from "@/components/MotionPrimitives";

const baseClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-500/15 px-6 py-3 font-medium text-yellow-100 shadow-lg shadow-yellow-950/30 hover:border-yellow-300/70 hover:bg-yellow-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300/60 disabled:cursor-not-allowed disabled:opacity-60";

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <PressableLink href={href} className={baseClass}>
      {children}
    </PressableLink>
  );
}

export function ActionButton({ children, onClick, disabled = false }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <PressableButton onClick={onClick} disabled={disabled} className={baseClass}>
      {children}
    </PressableButton>
  );
}
