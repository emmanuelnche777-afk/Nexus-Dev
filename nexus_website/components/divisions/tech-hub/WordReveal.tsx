"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type WordRevealProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
};

export default function WordReveal({
  text,
  className = "",
  wordClassName = "",
  staggerDelay = 0.06,
}: WordRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`overflow-hidden ${className}`} aria-label={text}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.26em] last:mr-0">
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: "115%" }}
            animate={isInView ? { y: "0%" } : { y: "115%" }}
            transition={{
              duration: 0.85,
              delay: 0.25 + i * staggerDelay,
              ease: [0.65, 0.05, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
