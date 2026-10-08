"use client";

import { PointerEvent, ReactNode, useEffect, useRef } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  max?: number;
};

export default function TiltCard({
  children,
  className = "",
  max = 8,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.matchMedia("(pointer: fine)").matches;
  }, []);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabledRef.current) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`th-tilt ${className}`}
    >
      {children}
    </div>
  );
}
