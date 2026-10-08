export type ResolvedVideoUrl =
  | { kind: "embed"; url: string }
  | { kind: "file"; url: string; mimeType: string };

const MEDIA_MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
};

function isAllowedHttpsUrl(url: URL): boolean {
  return url.protocol === "https:" ||
    (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
}

export function resolveVideoUrl(rawValue: string): ResolvedVideoUrl | null {
  const raw = rawValue.trim();
  if (!raw) return null;

  if (raw.startsWith("/")) {
    const rawPath = raw.split(/[?#]/, 1)[0];
    let decodedPath: string;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch {
      return null;
    }
    if (!decodedPath.startsWith("/videos/") || /[\\\0]/.test(decodedPath) || decodedPath.split("/").includes("..")) return null;
    const pathname = decodedPath.toLowerCase();
    const extension = Object.keys(MEDIA_MIME_TYPES).find((ext) => pathname.endsWith(ext));
    return extension ? { kind: "file", url: raw, mimeType: MEDIA_MIME_TYPES[extension] } : null;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!isAllowedHttpsUrl(url) || url.username || url.password) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) {
    const videoId = host === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts|v|live)\/([^/]+)/)?.[1];
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
    return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${videoId}` };
  }

  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const videoId = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1];
    if (!videoId) return null;
    const embed = new URL(`https://player.vimeo.com/video/${videoId}`);
    const privacyHash = url.searchParams.get("h") || url.pathname.match(/\/\d+\/([a-f\d]+)/i)?.[1];
    if (privacyHash) embed.searchParams.set("h", privacyHash);
    return { kind: "embed", url: embed.toString() };
  }

  const extension = Object.keys(MEDIA_MIME_TYPES).find((ext) => url.pathname.toLowerCase().endsWith(ext));
  return extension ? { kind: "file", url: url.toString(), mimeType: MEDIA_MIME_TYPES[extension] } : null;
}

export function validateVideoUrl(rawValue: unknown): string | null {
  if (rawValue == null || rawValue === "") return null;
  if (typeof rawValue !== "string") throw new Error("Video URL must be text.");
  const resolved = resolveVideoUrl(rawValue);
  if (!resolved) {
    throw new Error("Enter a YouTube or Vimeo video link, or an MP4, WebM, or OGG video file URL.");
  }
  if (process.env.NODE_ENV === "production") {
    try {
      const url = new URL(rawValue.trim());
      if (["localhost", "127.0.0.1"].includes(url.hostname)) {
        throw new Error("Localhost video links cannot be used on the public site.");
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Localhost video")) throw error;
    }
  }
  return rawValue.trim();
}
