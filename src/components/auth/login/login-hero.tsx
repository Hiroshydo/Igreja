"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { loginTheme } from "./theme";

export function LoginHero() {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % loginTheme.heroTitles.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  const headline = loginTheme.heroTitles[headlineIndex] ?? loginTheme.heroTitles[0];

  return (
    <section className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.h1
            key={headline}
            initial={{ opacity: 0, y: 16, filter: "blur(7px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="text-4xl font-light leading-[1.06] tracking-[-0.03em] text-white drop-shadow-[0_16px_26px_rgba(0,0,0,0.32)] sm:text-5xl lg:text-6xl"
          >
            {headline}
          </motion.h1>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.7 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 h-[2px] w-40 origin-left rounded-full bg-gradient-to-r from-[#c7a04a] via-[#e6d3a3] to-transparent"
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.16 }}
        className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-200/94 sm:text-base lg:mx-0"
      >
        {loginTheme.heroDescription}
      </motion.p>
    </section>
  );
}
