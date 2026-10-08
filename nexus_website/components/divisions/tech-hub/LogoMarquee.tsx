"use client";

import { ReactNode } from "react";

type LogoMarqueeProps = {
  children: ReactNode[];
  speed?: number;
  className?: string;
};

export default function LogoMarquee({
  children,
  speed = 30,
  className = "",
}: LogoMarqueeProps) {
  const duplicated = [...children, ...children, ...children];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex"
        style={{
          width: "max-content",
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {duplicated.map((child, i) => (
          <div key={i} className="flex-shrink-0 pr-6">
            {child}
          </div>
        ))}
      </div>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(0); }
          }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
