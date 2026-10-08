"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";


interface SocialPost {
  id: string;
  platform: "twitter" | "linkedin" | "instagram" | "facebook";
  title: string;
  content: string;
  mediaUrl?: string;
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  tags?: string[];
  createdAt: string;
  createdBy?: string;
}

export default function SocialMediaPublisher() {
  const pathname = usePathname();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/social-media", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [pathname]);

  const handlePublish = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, status: "published", publishedAt: new Date().toISOString() } : p
      )
    );
    fetch(`/api/admin/social-media`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id, status: "published", publishedAt: new Date().toISOString() }),
    });
  };

  const handleSchedule = (id: string, date: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id ? { ...p, status: "scheduled", scheduledAt: date } : p
      )
    );
    fetch(`/api/admin/social-media`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id, status: "scheduled", scheduledAt: date }),
    });
  };

  if (loading) {
    return <div className="h-20 w-20 animate-spin rounded-full border-2 border-nexus-cyan border-t-transparent" />;
  }

  const getPlatformLabel = (platform: SocialPost["platform"]) => {
    const labels: Record<SocialPost["platform"], string> = {
      twitter: "Twitter",
      linkedin: "LinkedIn",
      instagram: "Instagram",
      facebook: "Facebook",
    };
    return labels[platform];
  };

  return (
    <div className="bg-nexus-white p-6 rounded-lg border border-nexus-cyan/20">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-nexus-dark">Social Media Publishing</h2>
        <Link
          href="/admin/social-media/new"
          className="flex items-center gap-2 rounded-md bg-nexus-cyan px-4 py-2 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright"
        >
          <MessageCircle className="h-4 w-4" /> New Post
        </Link>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          fetch("/api/admin/social-media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: formData.get("platform") || "twitter",
              title: formData.get("title") || "",
              content: formData.get("content") || "",
              mediaUrl: formData.get("mediaUrl") || undefined,
              status:
                formData.get("status") as
                  | "draft"
                  | "scheduled"
                  | "published"
                  | "failed" || "draft",
              scheduledAt: formData.get("scheduledAt") || undefined,
              tags:
                formData.get("tags")
                  ? formData.get("tags")!.toString().split(",").map((t) => t.trim()).filter((t) => t)
                  : undefined,
            }),
          });
          alert("Post created!");
        }}
      >
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-nexus-dark">Platform</label>
            <select
              name="platform"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark focus:focus:border-nexus-cyan"
            >
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-dark">Title</label>
            <input
              type="text"
              name="title"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan"
              placeholder="Post title"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-nexus-dark">Content</label>
            <textarea
              name="content"
              rows={3}
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark resize-none outline-none focus:focus:border-nexus-cyan"
              placeholder="What's on your mind?"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-dark">Media URL</label>
            <input
              type="url"
              name="mediaUrl"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-nexus-dark">Status</label>
            <select
              name="status"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark focus:focus:border-nexus-cyan"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-dark">Scheduled At</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan"
              placeholder="2024-01-15T20:00:00"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-nexus-dark">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            className="w-full rounded-md border border-nexus-navy/20 bg-nexus-gray px-3 py-2 text-sm text-nexus-dark outline-none focus:focus:border-nexus-cyan"
            placeholder="#education #nexus #admin"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-nexus-cyan px-4 py-2.5 text-sm font-medium text-white transition hover:bg-nexus-cyan-bright mt-3"
        >
          Create Post
        </button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold text-nexus-dark mb-3">Posts</h3>
        <div className="overflow-x-auto rounded-lg border border-nexus-cyan/20">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-nexus-cyan/10">
                <th className="text-left text-xs font-medium text-nexus-gray/60 py-3">Platform</th>
                <th className="text-left text-xs font-medium text-nexus-gray/60 py-3">Title</th>
                <th className="text-left text-xs font-medium text-nexus-gray/60 py-3">Status</th>
                <th className="text-left text-xs font-medium text-nexus-gray/60 py-3">Scheduled</th>
                <th className="text-left text-xs font-medium text-nexus-gray/60 py-3">Published</th>
                <th className="text-left text-xs font-medium text-nexus-gray/60 py-3 width-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-nexus-navy/50">
                    No posts found
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-nexus-cyan/10">
                    <td className="py-4 text-nexus-navy/70 text-xs">
                      {getPlatformLabel(post.platform)}
                    </td>
                    <td className="py-4 font-medium text-nexus-dark">{post.title}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.status === "draft"
                            ? "bg-nexus-gray/10 text-nexus-gray"
                            : post.status === "scheduled"
                            ? "bg-nexus-cyan/10 text-nexus-cyan"
                            : post.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 text-nexus-navy/70 text-xs">
                      {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 text-nexus-navy/70 text-xs">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-1.5">
                        {post.status !== "published" && (
                          <button
                            onClick={() => handlePublish(post.id)}
                            className="hover:text-nexus-cyan text-sm"
                            title="Publish"
                          >
                            ✓
                          </button>
                        )}
                        {post.status !== "scheduled" && post.status !== "published" && (
                          <button
                            onClick={() => handleSchedule(post.id, new Date(Date.now() + 86400000).toISOString().split("T")[0])}
                            className="hover:text-nexus-cyan text-sm"
                            title="Schedule"
                          >
                            📅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}