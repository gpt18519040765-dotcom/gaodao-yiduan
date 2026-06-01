"use client";

import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Shell } from "@/components/Shell";

export default function Home() {
  return (
    <Shell>
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl place-items-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="ritual-card relative w-full max-w-3xl overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-14"
        >
          <div className="absolute left-1/2 top-8 h-28 w-px bg-gradient-to-b from-yellow-200/0 via-yellow-300/60 to-yellow-200/0" />
          <p className="gold-text mb-5 tracking-[0.55em]">东方易理 · 当下观照</p>
          <h1 className="text-5xl font-semibold tracking-[0.2em] text-stone-50 sm:text-7xl">高导易断</h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-stone-300 sm:text-xl">
            以易理为镜，辅助判断当下处境
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PrimaryButton href="/divination">开始起卦</PrimaryButton>
            <PrimaryButton href="/learn">八卦学习</PrimaryButton>
          </div>
          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-3 text-xs text-stone-500">
            <span>静心</span>
            <span className="gold-text">分蓍</span>
            <span>观象</span>
          </div>
        </motion.div>
      </section>
    </Shell>
  );
}
