"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList, GraduationCap, Handshake, Mail, Users, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";

type QueueKey = "contact" | "joiners" | "opportunities" | "mentees" | "mentors" | "partnerships" | "services";
type Queue = { key: QueueKey; title: string; href: string; icon: LucideIcon; description: string };

const QUEUES: Queue[] = [
  { key: "contact", title: "Contact inbox", href: "/admin/contact-inquiries", icon: Mail, description: "Messages waiting for a reply" },
  { key: "joiners", title: "Join Us requests", href: "/admin/joiners", icon: Users, description: "Pathway requests awaiting review" },
  { key: "opportunities", title: "Opportunity applications", href: "/admin/opportunity-applications", icon: ClipboardList, description: "Applications awaiting a decision" },
  { key: "mentees", title: "Mentee applications", href: "/admin/mentorship-applications", icon: GraduationCap, description: "Mentee requests awaiting review" },
  { key: "mentors", title: "Mentor / volunteer applications", href: "/admin/mentorship-inquiries", icon: Users, description: "Mentor and volunteer requests awaiting review" },
  { key: "partnerships", title: "Partnerships", href: "/admin/partnerships", icon: Handshake, description: "Partnership requests still in progress" },
  { key: "services", title: "Tech Hub service requests", href: "/admin/service-inquiries", icon: Building2, description: "New and in progress service requests" },
];

export default function RequestsOverviewPage() {
  const [queues, setQueues] = useState<Partial<Record<QueueKey, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/requests/summary", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load requests");
        return response.json();
      })
      .then((data) => setQueues(data.queues ?? {}))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const visibleQueues = QUEUES.filter((queue) => Object.hasOwn(queues, queue.key));
  const waiting = visibleQueues.reduce((sum, queue) => {
    // Mentor and volunteer pathways also appear in the broader Join Us inbox.
    if (queue.key === "mentors" && queues.joiners !== undefined) return sum;
    return sum + (queues[queue.key] ?? 0);
  }, 0);

  if (loading) return <LoadingState />;

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-nexus-navy">Requests overview</h1>
        <p className="mt-1 text-sm text-nexus-navy/70">Track requests assigned to the departments you can manage.</p>
      </header>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Request counts could not be loaded. Refresh the page or open a queue directly.
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-nexus-navy/10 bg-white p-5" aria-label="Requests awaiting review">
            <p className="text-sm text-nexus-navy/60">Requests awaiting review or response</p>
            <p className="mt-1 text-3xl font-bold text-nexus-navy">{waiting}</p>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Request queues">
            {visibleQueues.map((queue) => (
              <Link key={queue.key} href={queue.href} className="group rounded-xl border border-nexus-navy/10 bg-white p-5 transition hover:border-nexus-cyan/40 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-nexus-cyan/10 p-2"><queue.icon className="h-5 w-5 text-nexus-cyan" /></span>
                    <h2 className="font-semibold text-nexus-navy">{queue.title}</h2>
                  </div>
                  <ArrowRight className="h-4 w-4 text-nexus-cyan transition group-hover:translate-x-1" />
                </div>
                <p className="mt-4 text-sm text-nexus-navy/60">
                  {queue.key === "mentors" && queues.joiners !== undefined ? "These requests are also included in Join Us requests" : queue.description}
                </p>
                <p className="mt-3 text-2xl font-bold text-nexus-navy">{queues[queue.key] ?? 0}</p>
                <p className="text-xs text-nexus-navy/50">open items</p>
              </Link>
            ))}
          </section>
          {visibleQueues.length === 0 && (
            <p className="rounded-lg border border-nexus-navy/10 bg-white p-5 text-sm text-nexus-navy/70">There are no request queues assigned to your account.</p>
          )}
        </>
      )}
    </main>
  );
}
