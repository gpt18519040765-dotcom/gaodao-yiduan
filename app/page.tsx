"use client";

import { motion } from "framer-motion";
import { MotionCard, PressableLink, softEnter, staggerChildren } from "@/components/MotionPrimitives";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Shell } from "@/components/Shell";

export default function Home() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl pt-10">
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
          <MotionCard className="rounded-[1.5rem] border border-yellow-500/20 bg-black/20 p-5 sm:p-6">
            <p className="gold-text text-sm tracking-[0.35em]">起卦之前</p>
            <h2 className="mt-3 text-2xl font-semibold">心有敬畏，先静后占</h2>
            <p className="mt-4 text-sm leading-8 text-stone-300">
              古代占卜讲究干净案台、焚香静心、独处安静房间，心中默念所问之事，全程静心梳理蓍草、分组算数，动作规整缓慢。
              现代简化版仅保留数理演算，不讲究香案仪式，但仍建议先把问题想清楚，再起一卦。
            </p>
          </MotionCard>

          <MotionCard className="rounded-[1.5rem] border border-stone-700 bg-stone-950/35 p-5 sm:p-6">
            <p className="gold-text text-sm tracking-[0.35em]">小常识</p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-stone-300">
              <li>古代一件事只占一卦，不反复起卦戏占。</li>
              <li>蓍草流程繁琐，后世逐渐简化为铜钱摇卦，民间铜钱卦更普及。</li>
              <li>蓍草占卜属于传统民俗文化，仅作文化参考，不能作为现实决策依据。</li>
            </ul>
          </MotionCard>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-6xl place-items-center py-12">
        <motion.div
          variants={softEnter}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="ritual-card relative w-full max-w-3xl overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-14 sm:py-14"
        >
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="absolute left-1/2 top-8 h-28 w-px origin-top bg-gradient-to-b from-yellow-200/0 via-yellow-300/60 to-yellow-200/0"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.15 }}
            className="pointer-events-none absolute inset-x-10 top-10 h-36 rounded-full border border-yellow-500/10 bg-yellow-500/5 blur-2xl"
          />
          <p className="gold-text mb-5 tracking-[0.55em]">东方易理 · 当下观照</p>
          <motion.h1
            initial={{ opacity: 0, letterSpacing: "0.32em" }}
            animate={{ opacity: 1, letterSpacing: "0.2em" }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="text-4xl font-semibold text-stone-50 sm:text-7xl"
          >
            高导易断
          </motion.h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-stone-300 sm:text-xl">
            以易理为镜，辅助判断当下处境
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PrimaryButton href="/divination">开始问事</PrimaryButton>
            <PrimaryButton href="/goals">梳理目标</PrimaryButton>
          </div>
          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-3 text-xs text-stone-500">
            <span>静心</span>
            <span className="gold-text">分蓍</span>
            <span>观象</span>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl pb-16">
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
          <HomeModule href="/divination" title="问事" text="短期发问，按本卦、动爻、变卦整理局面，提醒风险与下一步行动。" />
          <HomeModule href="/learn" title="学易" text="学习卦理和变化规律，用长期理解减少冲动、贪念和误判。" />
          <HomeModule href="/goals" title="目标" text="把人生目标拆成阶段路径，结合记录复盘，形成长期陪伴。" />
        </motion.div>
      </section>
    </Shell>
  );
}

function HomeModule({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <PressableLink href={href} className="rounded-2xl border border-yellow-500/20 bg-black/20 p-5 hover:border-yellow-500/45 hover:bg-yellow-500/10">
      <p className="gold-text text-lg font-semibold">{title}</p>
      <p className="mt-3 text-sm leading-7 text-stone-300">{text}</p>
    </PressableLink>
  );
}
