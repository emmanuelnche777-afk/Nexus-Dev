"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  FileText,
  Save,
  X as XIcon,
  ExternalLink,
  Eye,
} from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";
import AdminModal from "@/components/admin/AdminModal";
import BlogContentEditor, {
  parseBlogContent,
  serializeBlogContent,
  type BlogEditorBlock,
} from "@/components/admin/BlogContentEditor";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content?: unknown;
  contentFr?: unknown;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

interface BlogContentBlock {
  type: string;
  level?: number;
  content?: string;
  items?: string[];
}

type BlogFormData = {
  slug: string;
  title: string;
  excerpt: string;
  content: BlogEditorBlock[];
  contentFr: BlogEditorBlock[];
  author: string;
  coverImage: string;
  tags: string;
  published: boolean;
};

const emptyForm: BlogFormData = {
  slug: "",
  title: "",
  excerpt: "",
  content: [],
  contentFr: [],
  author: "",
  coverImage: "",
  tags: "",
  published: true,
};

function tagsToString(tags: unknown): string {
  if (Array.isArray(tags)) return tags.join(", ");
  return "";
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetch("/api/admin/content/blog");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function openEdit(post: BlogPost) {
    setEditingPost(post);
    try {
      const res = await fetch(`/api/admin/content/blog/${post.slug}`);
      if (res.ok) {
        const full = await res.json();
        setFormData({
          slug: full.slug,
          title: full.title,
          excerpt: full.excerpt || "",
          content: parseBlogContent(full.content),
          contentFr: parseBlogContent(full.contentFr),
          author: full.author || "",
          coverImage: full.coverImage || "",
          tags: tagsToString(full.tags),
          published: full.published !== false,
        });
      } else {
        setFormData({
          ...emptyForm,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
        });
      }
    } catch {
      setFormData({
        ...emptyForm,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
      });
    }
    setShowModal(true);
  }

  function openCreate() {
    setEditingPost(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    setSaving(true);
    try {
      const payload = {
        slug: formData.slug,
        title: formData.title,
        excerpt: formData.excerpt,
        content: serializeBlogContent(formData.content),
        contentFr: serializeBlogContent(formData.contentFr),
        author: formData.author,
        coverImage: formData.coverImage,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: formData.published,
      };
      const url = editingPost
        ? `/api/admin/content/blog/${editingPost.slug}`
        : "/api/admin/content/blog";
      const method = editingPost ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setShowModal(false);
      setEditingPost(null);
      setFormData(emptyForm);
      await loadPosts();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/content/blog/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  }

  async function openView(post: BlogPost) {
    try {
      const res = await fetch(`/api/admin/content/blog/${post.slug}`);
      if (res.ok) {
        const full = await res.json();
        setViewingPost(full);
      } else {
        setViewingPost(post);
      }
    } catch {
      setViewingPost(post);
    }
  }

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.published !== false) ||
      (statusFilter === "draft" && p.published === false);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-nexus-navy">Blog Posts</h1>
            <p className="mt-1 text-sm text-nexus-navy/70">
              Manage blog posts and articles (EN + FR)
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexus-navy/40" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-nexus-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-nexus-navy placeholder:text-nexus-navy/40 focus:border-nexus-cyan focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
          className="rounded-lg border border-nexus-navy/10 bg-white px-3 py-2.5 text-sm text-nexus-navy focus:border-nexus-cyan focus:outline-none"
        >
          <option value="all">All posts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        {loading ? (
          <LoadingState label="Loading posts..." />
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={posts.length === 0 ? "No blog posts yet" : "No posts match your filters"}
            description={
              posts.length === 0
                ? "Click 'New Post' to write your first one. Supports EN and FR translations."
                : "Try a different search or filter."
            }
          />
        ) : (
          <div className="divide-y divide-nexus-navy/10">
            {filteredPosts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-nexus-navy">{post.title}</p>
                      {post.published === false && (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-nexus-navy/70">{post.excerpt}</p>
                    <p className="text-xs text-nexus-navy/50">/{post.slug}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => openView(post)}
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="View public page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => openEdit(post)}
                    className="rounded-md p-2 text-nexus-navy/60 hover:bg-nexus-navy/5 hover:text-nexus-navy"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingPost ? "Edit Post" : "New Post"}
        description="Write and organize your article with simple content blocks."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!!editingPost}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none disabled:bg-nexus-gray/40 disabled:text-nexus-navy/60"
                placeholder="my-post-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-navy">Excerpt</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
              placeholder="One or two sentences shown on blog index"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Cover Image URL</label>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="/images/blog/my-post.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-navy">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="mt-1 w-full rounded-lg border border-nexus-navy/10 bg-white px-3 py-2 text-sm focus:border-nexus-cyan focus:outline-none"
                placeholder="ai, careers, engineering"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-nexus-navy">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-nexus-navy/20 text-nexus-cyan focus:ring-nexus-cyan"
            />
            Published (visible on public site)
          </label>
          <BlogContentEditor
            title="Article body (English)"
            description="Add headings and paragraphs, then arrange them in the order you want."
            blocks={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
          <BlogContentEditor
            title="Article body (French, optional)"
            description="Add a French version of the article body if you have one."
            blocks={formData.contentFr}
            onChange={(contentFr) => setFormData({ ...formData, contentFr })}
          />

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex items-center gap-1.5 rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy transition hover:bg-nexus-navy/5"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editingPost ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </AdminModal>

      {viewingPost && (
        <PostPreviewModal post={viewingPost} onClose={() => setViewingPost(null)} />
      )}
    </div>
  );
}

function PostPreviewModal({
  post,
  onClose,
}: {
  post: BlogPost;
  onClose: () => void;
}) {
  const blocks = Array.isArray(post.content) ? post.content : [];
  return (
    <AdminModal
      open
      onClose={onClose}
      title="Post Preview"
      description={`/${post.slug} • ${post.published === false ? "Draft" : "Published"}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="aspect-video w-full rounded-lg object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-nexus-navy">{post.title}</h2>
          <p className="mt-2 text-sm text-nexus-navy/70">{post.excerpt}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-nexus-navy/55">
            {post.author && <span>By {post.author}</span>}
            {post.createdAt && (
              <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
            )}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <span>• {post.tags.join(", ")}</span>
            )}
          </div>
        </div>
        <div className="space-y-3 rounded-md border border-nexus-navy/10 bg-nexus-gray/20 p-4">
          {blocks.length === 0 ? (
            <p className="text-sm text-nexus-navy/60 italic">No content blocks.</p>
          ) : (
            blocks.map((block: BlogContentBlock, i: number) => {
              if (block.type === "heading" || block.type === "h2" || block.type === "h3") {
                const level = block.type === "h2" ? 2 : block.type === "h3" ? 3 : block.level === 2 ? 2 : 3;
                if (level === 2) {
                  return (
                    <h2 key={i} className="font-bold text-nexus-navy">
                      {block.content}
                    </h2>
                  );
                }
                return (
                  <h3 key={i} className="font-bold text-nexus-navy">
                    {block.content}
                  </h3>
                );
              }
              if (block.type === "code") {
                return (
                  <pre
                    key={i}
                    className="overflow-x-auto rounded-md bg-nexus-dark p-3 text-xs text-nexus-cyan-bright"
                  >
                    <code>{block.content}</code>
                  </pre>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="border-l-4 border-nexus-cyan pl-3 italic text-nexus-navy/80"
                  >
                    {block.content}
                  </blockquote>
                );
              }
              if (block.type === "list" && Array.isArray(block.items)) {
                return (
                  <ul key={i} className="ml-5 list-disc text-sm text-nexus-navy">
                    {block.items.map((item: string, j: number) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-sm text-nexus-navy">
                  {block.content}
                </p>
              );
            })
          )}
        </div>
        <div className="flex justify-end border-t border-nexus-navy/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-nexus-navy/10 px-4 py-2 text-sm font-medium text-nexus-navy hover:bg-nexus-navy/5"
          >
            Close
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
