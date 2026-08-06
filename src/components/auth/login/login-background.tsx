"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { loginPalette, loginTheme } from "./theme";

interface LoginBackgroundProps {
  children: React.ReactNode;
}

const particles = [
  { id: 1, top: "12%", left: "14%", delay: 0.2, duration: 8 },
  { id: 2, top: "22%", left: "82%", delay: 1.1, duration: 10 },
  { id: 3, top: "46%", left: "8%", delay: 0.8, duration: 12 },
  { id: 4, top: "58%", left: "76%", delay: 1.5, duration: 9 },
  { id: 5, top: "78%", left: "18%", delay: 1.8, duration: 11 },
  { id: 6, top: "84%", left: "65%", delay: 0.5, duration: 13 },
];

export function LoginBackground({ children }: LoginBackgroundProps) {
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 34, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Image
          src={loginTheme.imageUrl}
          alt="Igreja reunida em culto de adoracao"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <div className={`absolute inset-0 ${loginPalette.overlay}`} />
      <div className={`absolute inset-0 ${loginPalette.mist}`} />
      <div className={`absolute inset-0 ${loginPalette.vignette}`} />
      <div className="absolute inset-0 backdrop-blur-[1.2px]" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white/22"
          style={{ top: particle.top, left: particle.left }}
          animate={{ y: [0, -8, 0], opacity: [0.16, 0.35, 0.16] }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-12 px-5 py-10 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-16 lg:px-12">
        {children}
      </div>
    </main>
  );
}
