"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import AudioPlayer from "./AudioPlayer";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
  videos?: Array<{
    title: string;
    category: string;
    videoUrl: string;
    description?: string;
  }>;
  timestamp: Date;
};

type ChatMessageProps = {
  message: Message;
  language: "en" | "fr";
};

function safeMarkdownHref(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("#")) return href;
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return href;
  return null;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    const key = `${keyPrefix}-${tokenIndex++}`;
    if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("__") && token.endsWith("__"))) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-nexus-navy/10 px-1 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = linkMatch ? safeMarkdownHref(linkMatch[2].trim()) : null;
      if (linkMatch && href) {
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="font-medium text-nexus-cyan underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }
    cursor = index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function renderAssistantMarkdown(text: string): ReactNode[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: "ordered" | "unordered" | null = null;
  let blockIndex = 0;

  const renderLines = (content: string[], key: string) =>
    content.flatMap((line, index) => [
      ...(index > 0 ? [<br key={`${key}-br-${index}`} />] : []),
      ...renderInlineMarkdown(line, `${key}-${index}`),
    ]);
  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `paragraph-${blockIndex++}`;
    blocks.push(<p key={key} className="whitespace-pre-wrap leading-relaxed">{renderLines(paragraph, key)}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!listItems.length || !listType) return;
    const key = `list-${blockIndex++}`;
    const items = listItems.map((item, index) => (
      <li key={`${key}-item-${index}`}>{renderInlineMarkdown(item, `${key}-${index}`)}</li>
    ));
    blocks.push(listType === "ordered"
      ? <ol key={key} className="list-decimal space-y-1 pl-5">{items}</ol>
      : <ul key={key} className="list-disc space-y-1 pl-5">{items}</ul>);
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const heading = line.match(/^\s{0,3}(#{1,3})\s+(.+)$/);
    const listItem = line.match(/^\s*(?:([-*+])\s+|(\d+)[.)]\s+)(.+)$/);
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (heading) {
      flushParagraph();
      flushList();
      const key = `heading-${blockIndex++}`;
      const content = renderInlineMarkdown(heading[2], key);
      blocks.push(heading[1].length === 1
        ? <h3 key={key} className="text-base font-bold">{content}</h3>
        : <h4 key={key} className="text-sm font-bold">{content}</h4>);
      continue;
    }
    if (listItem) {
      flushParagraph();
      const nextType = listItem[2] ? "ordered" : "unordered";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push(listItem[3]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export default function ChatMessage({ message, language }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full gap-2.5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-navy text-nexus-cyan border border-nexus-cyan/30">
          <Image
            src="/images/logo/nexus-logo-sm.jpg"
            alt="NEXUS AI"
            width={24}
            height={24}
            className="rounded-full object-cover"
            unoptimized
          />
        </div>
      )}

      <div
        className={`group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser
            ? "bg-nexus-navy text-nexus-white rounded-br-none"
            : "bg-nexus-gray text-nexus-dark border border-nexus-cyan/20 rounded-bl-none"
        }`}
      >
        {message.imageUrl && (
          <div className="mb-2 relative h-40 w-full overflow-hidden rounded-lg border border-nexus-cyan/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt="Uploaded content"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {isUser
          ? <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          : <div className="space-y-2">{renderAssistantMarkdown(message.text)}</div>}

        {!isUser && message.videos && message.videos.length > 0 && (
          <div className="space-y-2 border-t border-nexus-cyan/20 pt-2">
            {message.videos.map((video, index) => {
              const href = safeMarkdownHref(video.videoUrl.trim());
              const external = href ? /^https?:\/\//i.test(href) : false;
              return (
                <div key={`${video.videoUrl}-${index}`} className="rounded-lg bg-white/70 p-2">
                  <p className="text-xs font-semibold">{video.title} <span className="font-normal text-nexus-navy/60">· {video.category}</span></p>
                  {video.description && <p className="mt-1 text-xs leading-relaxed">{video.description}</p>}
                  {href ? (
                    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
                      className="mt-1 inline-block break-all text-xs font-medium text-nexus-cyan underline underline-offset-2">
                      {language === "fr" ? "Regarder la vidéo" : "Watch video"}
                    </a>
                  ) : (
                    <p className="mt-1 break-all text-xs text-nexus-navy/70">{video.videoUrl}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isUser && message.text && (
          <div className="mt-1 flex items-center justify-between pt-1 border-t border-nexus-cyan/10">
            <AudioPlayer text={message.text} language={language} />
            <span className="text-[10px] text-nexus-navy/50">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}

        {isUser && (
          <div className="mt-1 text-right">
            <span className="text-[10px] text-nexus-gray/60">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
