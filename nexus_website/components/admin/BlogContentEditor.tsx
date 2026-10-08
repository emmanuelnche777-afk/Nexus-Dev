"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export type BlogEditorBlockKind = "paragraph" | "heading" | "quote" | "list" | "preserved";

export type BlogEditorBlock = {
  id: string;
  kind: BlogEditorBlockKind;
  text: string;
  level?: 2 | 3;
  original?: unknown;
};

function createBlock(kind: BlogEditorBlockKind = "paragraph"): BlogEditorBlock {
  return { id: crypto.randomUUID(), kind, text: "" };
}

export function parseBlogContent(value: unknown): BlogEditorBlock[] {
  let blocks = value;
  if (typeof blocks === "string") {
    try {
      blocks = JSON.parse(blocks);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(blocks)) return [];

  return blocks.map((value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ...createBlock("preserved"), text: "", original: value };
    }

    const raw = value as Record<string, unknown>;
    const content = typeof raw.content === "string" ? raw.content : "";

    if (raw.type === "paragraph") {
      return { ...createBlock("paragraph"), text: content };
    }
    if (raw.type === "h2" || raw.type === "h3" || raw.type === "heading") {
      return {
        ...createBlock("heading"),
        text: content,
        level: raw.type === "h3" || raw.level === 3 ? 3 : 2,
      };
    }
    if (raw.type === "quote") {
      return { ...createBlock("quote"), text: content };
    }
    if (raw.type === "list" && Array.isArray(raw.items)) {
      return {
        ...createBlock("list"),
        text: raw.items.filter((item): item is string => typeof item === "string").join("\n"),
      };
    }

    return { ...createBlock("preserved"), text: "", original: value };
  });
}

export function serializeBlogContent(blocks: BlogEditorBlock[]): unknown[] {
  return blocks.flatMap((block) => {
    if (block.kind === "preserved") return [block.original];
    const content = block.text.trim();
    if (!content) return [];

    if (block.kind === "heading") {
      return [{ type: block.level === 3 ? "h3" : "h2", content }];
    }
    if (block.kind === "quote") return [{ type: "quote", content }];
    if (block.kind === "list") {
      const items = block.text.split("\n").map((item) => item.trim()).filter(Boolean);
      return items.length ? [{ type: "list", items }] : [];
    }
    return [{ type: "paragraph", content }];
  });
}

export default function BlogContentEditor({
  title,
  description,
  blocks,
  onChange,
}: {
  title: string;
  description: string;
  blocks: BlogEditorBlock[];
  onChange: (blocks: BlogEditorBlock[]) => void;
}) {
  function updateBlock(index: number, changes: Partial<BlogEditorBlock>) {
    onChange(blocks.map((block, blockIndex) =>
      blockIndex === index ? { ...block, ...changes } : block,
    ));
  }

  function moveBlock(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= blocks.length) return;
    const reordered = [...blocks];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  }

  return (
    <section className="space-y-3 rounded-lg border border-nexus-navy/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-nexus-navy">{title}</h3>
          <p className="mt-1 text-xs text-nexus-navy/60">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange([...blocks, createBlock("heading")])}
            className="inline-flex items-center gap-1 rounded-md border border-nexus-navy/15 px-2.5 py-1.5 text-xs font-medium text-nexus-navy hover:border-nexus-cyan"
          >
            <Plus className="h-3.5 w-3.5" /> Heading
          </button>
          <button
            type="button"
            onClick={() => onChange([...blocks, createBlock("paragraph")])}
            className="inline-flex items-center gap-1 rounded-md bg-nexus-cyan px-2.5 py-1.5 text-xs font-medium text-white hover:bg-nexus-cyan-bright"
          >
            <Plus className="h-3.5 w-3.5" /> Paragraph
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-md bg-nexus-gray/50 px-3 py-5 text-center text-sm text-nexus-navy/55">
          No article text yet. Add a heading or paragraph to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div key={block.id} className="rounded-md border border-nexus-navy/10 bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {block.kind === "preserved" ? (
                    <span className="text-xs font-medium text-amber-800">Existing special block</span>
                  ) : (
                    <select
                      value={block.kind}
                      onChange={(event) => updateBlock(index, {
                        kind: event.target.value as BlogEditorBlockKind,
                        original: undefined,
                      })}
                      aria-label={`Block ${index + 1} type`}
                      className="rounded border border-nexus-navy/15 bg-white px-2 py-1 text-xs text-nexus-navy"
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="heading">Heading</option>
                      <option value="quote">Quote</option>
                      <option value="list">Bullet list</option>
                    </select>
                  )}
                  {block.kind === "heading" && (
                    <select
                      value={block.level ?? 2}
                      onChange={(event) => updateBlock(index, { level: Number(event.target.value) as 2 | 3 })}
                      aria-label={`Heading ${index + 1} size`}
                      className="rounded border border-nexus-navy/15 bg-white px-2 py-1 text-xs text-nexus-navy"
                    >
                      <option value={2}>Section heading</option>
                      <option value={3}>Small heading</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move block ${index + 1} up`}
                    className="rounded p-1 text-nexus-navy/60 hover:bg-nexus-gray disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    aria-label={`Move block ${index + 1} down`}
                    className="rounded p-1 text-nexus-navy/60 hover:bg-nexus-gray disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(blocks.filter((_, blockIndex) => blockIndex !== index))}
                    aria-label={`Remove block ${index + 1}`}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {block.kind === "preserved" ? (
                <p className="text-xs text-amber-800">
                  This older block format will be kept as is when you save. Remove it only if you no longer need it.
                </p>
              ) : (
                <textarea
                  rows={block.kind === "heading" ? 2 : block.kind === "list" ? 5 : 4}
                  value={block.text}
                  onChange={(event) => updateBlock(index, { text: event.target.value })}
                  aria-label={`${block.kind === "heading" ? "Heading" : block.kind === "list" ? "One bullet per line" : block.kind === "quote" ? "Quote" : "Paragraph"} ${index + 1}`}
                  placeholder={block.kind === "list" ? "Write one bullet point per line" : block.kind === "heading" ? "Write a section heading" : block.kind === "quote" ? "Write a quote" : "Write your paragraph"}
                  className="w-full rounded-md border border-nexus-navy/10 px-3 py-2 text-sm leading-relaxed text-nexus-navy focus:border-nexus-cyan focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
