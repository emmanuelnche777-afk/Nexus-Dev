"use client";

import { KeyboardEvent, ReactNode, useState } from "react";

type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  className?: string;
};

export default function FlipCard({
  front,
  back,
  className = "",
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={handleKey}
      className={`th-flip ${flipped ? "flipped" : ""} cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-cyan-bright ${className}`}
    >
      <div className="th-flip-inner">
        <div className="th-flip-face th-flip-front">{front}</div>
        <div className="th-flip-face th-flip-back">{back}</div>
      </div>
    </div>
  );
}
