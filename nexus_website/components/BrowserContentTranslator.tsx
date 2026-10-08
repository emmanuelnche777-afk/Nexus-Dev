"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  getBrowserTranslationStatus,
  prepareBrowserTranslator,
  subscribeBrowserTranslationStatus,
  translateEnglishToFrench,
  type BrowserTranslationStatus,
} from "@/lib/browser-translator";

type OriginalText = { source: string; translated?: string; inFlight?: boolean };

export default function BrowserContentTranslator() {
  const { language } = useLanguage();
  const [status, setStatus] = useState<BrowserTranslationStatus>(getBrowserTranslationStatus());

  useEffect(() => subscribeBrowserTranslationStatus(setStatus), []);

  useEffect(() => {
    const tracked = new WeakMap<Text, OriginalText>();
    const trackedNodes = new Set<Text>();
    let stopped = false;

    const restoreEnglish = () => {
      for (const node of trackedNodes) {
        const record = tracked.get(node);
        if (record && node.isConnected && record.translated && node.data === record.translated) {
          node.data = record.source;
        }
        trackedNodes.delete(node);
      }
    };

    const translateMarkedText = async (root: ParentNode) => {
      if (language !== "fr" || stopped) return;
      const elements: Element[] = [];
      if (root instanceof Element && root.matches("[data-browser-translate='true']")) elements.push(root);
      root.querySelectorAll("[data-browser-translate='true']").forEach((element) => elements.push(element));

      for (const element of elements) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const textNode = node as Text;
          const current = textNode.data;
          if (!current.trim()) continue;

          let record = tracked.get(textNode);
          if (record?.translated && current !== record.translated) {
            record.source = current;
            record.translated = undefined;
          } else if (!record) {
            record = { source: current };
            tracked.set(textNode, record);
            trackedNodes.add(textNode);
          }
          if (!record || record.translated || record.inFlight) continue;

          record.inFlight = true;
          try {
            const translated = await translateEnglishToFrench(record.source);
            if (stopped || !textNode.isConnected) continue;
            if (textNode.data === record.source) {
              record.translated = translated;
              textNode.data = translated;
            }
          } catch {
            // Keep the source text visible when Chrome translation is unavailable.
          } finally {
            record.inFlight = false;
          }
        }
      }
    };

    if (language === "fr") {
      void prepareBrowserTranslator().then(() => translateMarkedText(document)).catch(() => {});
    } else {
      restoreEnglish();
    }

    const observer = new MutationObserver((mutations) => {
      if (language !== "fr" || stopped) return;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element || node instanceof DocumentFragment) void translateMarkedText(node);
            else if (node instanceof Text) {
              const parent = node.parentElement?.closest("[data-browser-translate='true']");
              if (parent) void translateMarkedText(parent);
            }
          });
          mutation.removedNodes.forEach((node) => {
            if (!(node instanceof Element) && !(node instanceof DocumentFragment)) {
              if (node instanceof Text) trackedNodes.delete(node);
              return;
            }
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let removedText: Node | null;
            while ((removedText = walker.nextNode())) trackedNodes.delete(removedText as Text);
          });
        } else if (mutation.type === "characterData") {
          const parent = mutation.target.parentElement?.closest("[data-browser-translate='true']");
          if (parent) void translateMarkedText(parent);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      stopped = true;
      observer.disconnect();
      if (language === "fr") restoreEnglish();
    };
  }, [language]);

  if (language !== "fr" || status === "ready" || status === "idle") return null;

  const message = status === "loading"
    ? "Preparing French translation in Chrome. The first use may download language data."
    : status === "unsupported"
      ? "Your browser does not support live translation. Some admin-managed content may remain in English."
      : "Chrome could not prepare live translation. Some admin-managed content may remain in English.";

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900" role="status">
      {message}
    </div>
  );
}
