"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { JOURNEY_STATS } from "@/lib/journey";

function CountUpStat({
  end,
  suffix,
  label,
  delay,
}: {
  end: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  return (
    <div ref={ref} className="relative flex flex-col justify-center">
      <div className="flex items-baseline gap-1.5">
        <motion.span
          className="font-mono text-3xl font-bold text-nexus-cyan-bright lg:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {isInView ? end : 0}
        </motion.span>
        {suffix && (
          <span className="font-mono text-2xl font-bold text-nexus-cyan-bright lg:text-3xl">
            {suffix}
          </span>
        )}
      </div>
      <h3 className="mt-1 text-sm font-semibold text-white">{label}</h3>
    </div>
  );
}

export default function JourneyStats() {
  const { t } = useLanguage();
  const jp = t.journeyPage;

  const labels = [
    jp.stat1Label,
    jp.stat2Label,
    jp.stat3Label,
    jp.stat4Label,
  ];

  return (
    <div className="relative z-20 mx-auto -mt-14 max-w-5xl px-4 sm:px-6">
      <div className="rounded-2xl border border-nexus-cyan/30 bg-nexus-navy-deep/90 p-6 shadow-2xl backdrop-blur-md lg:p-8">
        <div className="grid gap-6 md:grid-cols-4 md:gap-0">
          {JOURNEY_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`relative flex flex-col justify-center ${
                i === 0 ? "md:pr-6" : i < 3 ? "md:px-6" : "md:pl-6"
              }`}
            >
              {i > 0 && (
                <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 md:block">
                  <div className="h-14 w-px bg-gradient-to-b from-transparent via-nexus-cyan/40 to-transparent" />
                </div>
              )}
              <CountUpStat
                end={stat.value}
                suffix={stat.suffix}
                label={labels[i]}
                delay={0.1 + i * 0.12}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
