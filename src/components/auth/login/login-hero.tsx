"use client";

import { motion } from "framer-motion";

import { loginTheme } from "./theme";

export function LoginHero() {
  return (
    <section className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
      <motion.h1
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl"
      >
        {loginTheme.heroTitle}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-200/92 sm:text-base lg:mx-0"
      >
        {loginTheme.heroDescription}
      </motion.p>
    </section>
  );
}
