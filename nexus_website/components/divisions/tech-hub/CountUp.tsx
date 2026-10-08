"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

type CountUpProps = {
  end: number;
  suffix?: string;
  className?: string;
  duration?: number;
};

export default function CountUp({
  end,
  suffix = "",
  className = "",
  duration = 2,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, end, duration]);

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {value}
      {suffix}
    </motion.span>
  );
}
