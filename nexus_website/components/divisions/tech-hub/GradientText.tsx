"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type GradientTextProps = {
  children: string;
  className?: string;
  role?: "display" | "heading";
};

export default function GradientText({
  children,
  className = "",
  role = "display",
}: GradientTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const backgroundPosition = useTransform(
    scrollYProgress,
    [0, 1],
    ["0% 50%", "100% 50%"]
  );

  return (
    <div ref={ref} aria-label={children}>
      <span className="sr-only">{children}</span>
      <motion.div
        className={className}
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--nexus-cyan), var(--nexus-cyan-bright), var(--nexus-white), var(--nexus-cyan))",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "300% 100%",
          backgroundPosition,
        }}
        {...(role === "heading" ? { "aria-hidden": true } : {})}
      >
        {children}
      </motion.div>
    </div>
  );
}
