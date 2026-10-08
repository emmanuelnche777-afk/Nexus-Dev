"use client";

export type BrowserTranslationStatus = "idle" | "loading" | "ready" | "unsupported" | "error";

type Translator = { translate: (text: string) => Promise<string> };
type TranslatorMonitor = EventTarget & { addEventListener: (type: "downloadprogress", listener: EventListener) => void };
type TranslatorConstructor = {
  create: (options: {
    sourceLanguage: "en";
    targetLanguage: "fr";
    monitor?: (monitor: TranslatorMonitor) => void;
  }) => Promise<Translator>;
};

declare global {
  interface Window {
    Translator?: TranslatorConstructor;
  }
}

let translatorPromise: Promise<Translator> | null = null;
let translationStatus: BrowserTranslationStatus = "idle";
const statusListeners = new Set<(status: BrowserTranslationStatus) => void>();
const translationCache = new Map<string, string>();
const pendingTranslations = new Map<string, Promise<string>>();

function updateStatus(status: BrowserTranslationStatus) {
  translationStatus = status;
  for (const listener of statusListeners) listener(status);
}

export function getBrowserTranslationStatus(): BrowserTranslationStatus {
  return translationStatus;
}

export function subscribeBrowserTranslationStatus(
  listener: (status: BrowserTranslationStatus) => void
): () => void {
  statusListeners.add(listener);
  listener(translationStatus);
  return () => statusListeners.delete(listener);
}

export function prepareBrowserTranslator(): Promise<Translator> {
  if (translatorPromise) return translatorPromise;
  if (typeof window === "undefined" || !window.Translator) {
    updateStatus("unsupported");
    return Promise.reject(new Error("This browser does not support the Chrome Translator API."));
  }

  updateStatus("loading");
  translatorPromise = window.Translator.create({
    sourceLanguage: "en",
    targetLanguage: "fr",
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", () => updateStatus("loading"));
    },
  }).then((translator) => {
    updateStatus("ready");
    return translator;
  }).catch((error: unknown) => {
    translatorPromise = null;
    updateStatus("error");
    throw error;
  });

  return translatorPromise;
}

export async function translateEnglishToFrench(text: string): Promise<string> {
  const source = text.trim();
  if (!source) return text;
  const cached = translationCache.get(source);
  if (cached) return cached;
  const pending = pendingTranslations.get(source);
  if (pending) return pending;

  const translation = prepareBrowserTranslator().then((translator) => translator.translate(source)).then((result) => {
    const translated = result.trim() || source;
    if (translationCache.size >= 3000) translationCache.clear();
    translationCache.set(source, translated);
    return translated;
  }).catch((error: unknown) => {
    updateStatus("error");
    throw error;
  }).finally(() => {
    pendingTranslations.delete(source);
  });
  pendingTranslations.set(source, translation);
  return translation;
}
