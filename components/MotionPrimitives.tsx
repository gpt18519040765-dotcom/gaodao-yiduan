"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const MotionLink = motion.create(Link);

export const softEnter = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const staggerChildren = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

export function MotionCard({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={softEnter}
      initial="hidden"
      animate="show"
      whileHover={{ y: -3, borderColor: "rgba(215, 173, 87, 0.42)" }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PressableLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <MotionLink
      href={href}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={className}
    >
      {children}
    </MotionLink>
  );
}

export function PressableButton({ children, className = "", ...props }: HTMLMotionProps<"button"> & { children: ReactNode }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
