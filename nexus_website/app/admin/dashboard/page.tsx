"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Map,
  UserPlus,
  Handshake,
  BookOpen,
  Calendar,
  Bell,
  ArrowRight,
} from "lucide-react";

type Stat = {
  label: string;
  value: number | string;
  href: string;
  icon: React.ReactNode;
  color: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ action: string; item: string; time: string }[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [blogRes, journeyRes, inquiriesRes] = await Promise.all([
          fetch("/api/admin/content/blog", { cache: "no-store" }),
          fetch("/api/admin/content/journey", { cache: "no-store" }),
          fetch("/api/admin/inquiries/list", { cache: "no-store" }),
        ]);

        const blog = await blogRes.json().catch(() => ({ posts: [] }));
        const journey = await journeyRes.json().catch(() => ({ entries: [] }));
        const inquiries = await inquiriesRes.json().catch(() => ({ inquiries: [] }));

        const pendingApplications = inquiries.applications?.filter((a: { status?: string }) => a.status === "new" || !a.status).length || 0;
        const pendingPartners = inquiries.partners?.filter((p: { status?: string }) => p.status === "new" || !p.status).length || 0;

        setStats([
          {
            label: "Blog Posts",
            value: blog.posts?.length || 0,
            href: "/admin/content/blog",
            icon: <FileText className="h-5 w-5" />,
            color: "text-blue-400",
          },
          {
            label: "Journey Entries",
            value: journey.entries?.length || 0,
            href: "/admin/content/journey",
            icon: <Map className="h-5 w-5" />,
            color: "text-green-400",
          },
          {
            label: "Pending Applications",
            value: pendingApplications,
            href: "/admin/inquiries",
            icon: <UserPlus className="h-5 w-5" />,
            color: "text-amber-400",
          },
          {
            label: "Partner Inquiries",
            value: pendingPartners,
            href: "/admin/inquiries",
            icon: <Handshake className="h-5 w-5" />,
            color: "text-purple-400",
          },
          {
            label: "Active Opportunities",
            value: 0,
            href: "/admin/content/opportunities",
            icon: <BookOpen className="h-5 w-5" />,
            color: "text-orange-400",
          },
          {
            label: "Active Cohorts",
            value: 0,
            href: "/admin/academy",
            icon: <Calendar className="h-5 w-5" />,
            color: "text-pink-400",
          },
          {
            label: "Unread Notifications",
            value: 0,
            href: "/admin/dashboard",
            icon: <Bell className="h-5 w-5" />,
            color: "text-red-400",
          },
        ]);

        const allInquiries = [
          ...(inquiries.inquiries || []).map((i: { type?: string; name?: string; date?: string }) => ({
            action: "Contact Form",
            item: i.name || "Unknown",
            time: i.date || "",
          })),
          ...(inquiries.applications || []).map((a: { type?: string; name?: string; date?: string }) => ({
            action: "Application",
            item: a.name || "Unknown",
            time: a.date || "",
          })),
          ...(inquiries.partners || []).map((p: { type?: string; name?: string; date?: string }) => ({
            action: "Partner Inquiry",
            item: p.name || "Unknown",
            time: p.date || "",
          })),
        ];

        allInquiries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivity(allInquiries.slice(0, 10));
      } catch {
        // Stats will show zeros on error
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nexus-dark">Dashboard</h1>
        <p className="mt-1 text-sm text-nexus-navy">
          Welcome to the NEXUS Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border border-nexus-cyan/20 bg-white p-6 transition hover:border-nexus-cyan hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <span className="text-2xl font-bold text-nexus-dark">{stat.value}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-nexus-navy">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-nexus-cyan/20 bg-white p-6">
        <h2 className="text-lg font-bold text-nexus-dark">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-nexus-navy">No recent activity.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={`${activity.action}-${activity.item}-${i}`}
                className="flex items-center justify-between border-b border-nexus-navy/5 pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-nexus-dark">
                    {activity.action}: {activity.item}
                  </p>
                  <p className="text-xs text-nexus-navy/50">
                    {activity.time ? new Date(activity.time).toLocaleString() : "Unknown date"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-nexus-cyan/20 bg-white p-6">
        <h2 className="text-lg font-bold text-nexus-dark">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/content/blog/new"
            className="flex items-center justify-between rounded-md border border-nexus-cyan/20 p-4 transition hover:border-nexus-cyan"
          >
            <span className="text-sm font-medium text-nexus-dark">New Blog Post</span>
            <ArrowRight className="h-4 w-4 text-nexus-cyan" />
          </Link>
          <Link
            href="/admin/content/journey/new"
            className="flex items-center justify-between rounded-md border border-nexus-cyan/20 p-4 transition hover:border-nexus-cyan"
          >
            <span className="text-sm font-medium text-nexus-dark">New Journey Entry</span>
            <ArrowRight className="h-4 w-4 text-nexus-cyan" />
          </Link>
          <Link
            href="/admin/academy"
            className="flex items-center justify-between rounded-md border border-nexus-cyan/20 p-4 transition hover:border-nexus-cyan"
          >
            <span className="text-sm font-medium text-nexus-dark">Manage Academy</span>
            <ArrowRight className="h-4 w-4 text-nexus-cyan" />
          </Link>
          <Link
            href="/admin/inquiries"
            className="flex items-center justify-between rounded-md border border-nexus-cyan/20 p-4 transition hover:border-nexus-cyan"
          >
            <span className="text-sm font-medium text-nexus-dark">View Inquiries</span>
            <ArrowRight className="h-4 w-4 text-nexus-cyan" />
          </Link>
        </div>
      </div>
    </div>
  );
}
