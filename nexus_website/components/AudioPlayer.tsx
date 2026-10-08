"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type AudioPlayerProps = {
  text: string;
  language: "en" | "fr";
};

function getSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

export default function AudioPlayer({ text, language }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported] = useState(getSpeechSupported);

  if (!supported) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "fr" ? "fr-FR" : "en-US";
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      title={isPlaying ? "Stop audio" : "Listen to response"}
      aria-label={isPlaying ? "Stop audio" : "Listen to response"}
      className="mt-1 flex items-center gap-1 text-xs text-nexus-cyan hover:text-nexus-cyan-bright transition"
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-3.5 w-3.5 animate-pulse" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5" />
          <span>Listen</span>
        </>
      )}
    </button>
  );
}
