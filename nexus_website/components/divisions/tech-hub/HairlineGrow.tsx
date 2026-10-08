"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type HairlineGrowProps = {
  className?: string;
  delay?: number;
  color?: string;
};

export default function HairlineGrow({
  className = "h-px w-full",
  delay = 0,
  color = "bg-nexus-cyan/30",
}: HairlineGrowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${color}`}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 1.2,
          delay: delay / 1000,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: "left center" }}
      />
    </div>
  );
}
