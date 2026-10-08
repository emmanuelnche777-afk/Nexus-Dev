"use client";

import { resolveVideoUrl } from "@/lib/video-url";

type VideoPlayerProps = {
  src: string;
  title: string;
  className?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  onError?: () => void;
};

export default function VideoPlayer({
  src,
  title,
  className = "h-full w-full",
  poster,
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  playsInline = true,
  preload = "metadata",
  onError,
}: VideoPlayerProps) {
  const resolved = resolveVideoUrl(src);
  if (!resolved) return null;

  if (resolved.kind === "embed") {
    return (
      <iframe
        src={resolved.url}
        title={title}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    );
  }

  return (
    <video
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      poster={poster}
      onError={onError}
    >
      <source src={resolved.url} type={resolved.mimeType} />
      Your browser cannot play this video format.
    </video>
  );
}
