"use client";

import { useRef, type PointerEvent } from "react";

export default function SignaturePad({ onChange }: { onChange: (signature: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const p = point(event);
    if (!canvas || !context || !p) return;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(p.x, p.y);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.strokeStyle = "#172554";
    drawing.current = true;
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext("2d");
    const p = point(event);
    if (!context || !p) return;
    context.lineTo(p.x, p.y);
    context.stroke();
  }

  function stop() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        aria-label="Draw signature"
        className="w-full touch-none rounded-lg border border-slate-300 bg-white"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
      />
      <button type="button" onClick={clear} className="mt-2 text-sm text-slate-600 underline">Clear signature</button>
    </div>
  );
}
