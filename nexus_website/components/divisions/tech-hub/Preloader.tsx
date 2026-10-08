"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DURATION = 1400;

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout>;

    if (reduce) {
      raf = requestAnimationFrame(() => setDone(true));
    } else {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(Math.round(eased * 100));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          exitTimer = setTimeout(() => setDone(true), 300);
        }
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="th-preloader pointer-events-none fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-nexus-dark/60 px-6 py-8 backdrop-blur-[2px] sm:px-10 sm:py-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading"
        >
          <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />

          <div className="relative z-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-nexus-cyan/70">
            <span>NEXUS://Tech-Hub</span>
            <span className="hidden sm:inline">Initializing</span>
          </div>

          <motion.div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-nexus-cyan/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          <div className="relative z-10 flex items-end justify-between">
            <div className="max-w-xs font-mono text-[11px] leading-relaxed tracking-wider text-nexus-gray/50">
              <p>booting experience…</p>
              <p className="mt-1 text-nexus-cyan/60">
                &gt; loading modules<span className="th-caret">_</span>
              </p>
            </div>
            <span className="font-mono text-6xl font-bold leading-none text-white tabular-nums sm:text-7xl lg:text-8xl">
              {progress}
              <span className="text-nexus-cyan-bright">%</span>
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-nexus-navy-deep/80">
            <div
              className="h-full origin-left bg-gradient-to-r from-nexus-cyan to-nexus-cyan-bright transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
