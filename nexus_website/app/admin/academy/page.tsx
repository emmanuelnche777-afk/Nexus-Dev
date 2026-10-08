"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { GraduationCap, BookOpen, Users, ArrowRight, TrendingUp } from "lucide-react";

interface Program {
  id: string;
  slug: string;
  title: string;
  durationWeeks: number;
  price: number;
  currency: string;
}

interface Cohort {
  id: string;
  programSlug: string;
  name: string;
  status: string;
  currentStudents: number;
  maxStudents: number;
}

export default function AcademyAdminPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/programs").then((r) => r.json()),
      fetch("/api/admin/cohorts").then((r) => r.json()),
    ])
      .then(([progs, coh]) => {
        setPrograms(Array.isArray(progs) ? progs : progs.programs || []);
        setCohorts(Array.isArray(coh) ? coh : coh.cohorts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCohorts = cohorts.filter((c) => c.status === "open").length;
  const totalStudents = cohorts.reduce((sum, c) => sum + c.currentStudents, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-nexus-navy">Academy Management</h1>
        <p className="mt-1 text-sm text-nexus-navy">
          Manage programs, cohorts, and academy operations
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-nexus-cyan/10 p-2">
              <BookOpen className="h-5 w-5 text-nexus-cyan" />
            </div>
            <div>
              <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : programs.length}</p>
              <p className="text-xs text-nexus-navy">Programs</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : cohorts.length}</p>
              <p className="text-xs text-nexus-navy">Cohorts</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : totalStudents}</p>
              <p className="text-xs text-nexus-navy">Total Students</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-nexus-navy/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-nexus-navy">{loading ? "…" : openCohorts}</p>
              <p className="text-xs text-nexus-navy">Open Cohorts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/admin/academy/programs"
          className="group rounded-xl border border-nexus-navy/10 bg-white p-6 transition hover:border-nexus-cyan/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-nexus-navy">Programs</h3>
              <p className="mt-1 text-sm text-nexus-navy">
                Manage academy programs, curriculum, and pricing
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-nexus-cyan transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          href="/admin/academy/cohorts"
          className="group rounded-xl border border-nexus-navy/10 bg-white p-6 transition hover:border-nexus-cyan/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-nexus-navy">Cohorts</h3>
              <p className="mt-1 text-sm text-nexus-navy">
                Manage cohort schedules, capacity, and enrollment
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-nexus-cyan transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Recent Cohorts */}
      <div className="rounded-xl border border-nexus-navy/10 bg-white">
        <div className="border-b border-nexus-navy/10 px-6 py-4">
          <h2 className="font-semibold text-nexus-navy">Recent Cohorts</h2>
        </div>
        <div className="divide-y divide-nexus-navy/10">
          {loading ? (
            <p className="px-6 py-8 text-sm text-nexus-navy/60">Loading cohorts...</p>
          ) : cohorts.length === 0 ? (
            <p className="px-6 py-8 text-sm text-nexus-navy/60">No cohorts yet.</p>
          ) : cohorts.slice(0, 5).map((cohort) => {
            const program = programs.find((p) => p.slug === cohort.programSlug);
            return (
              <div
                key={cohort.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-nexus-navy">{cohort.name}</p>
                  <p className="text-sm text-nexus-navy">
                    {program?.title || cohort.programSlug}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cohort.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : cohort.status === "upcoming"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cohort.status}
                  </span>
                  <p className="mt-1 text-xs text-nexus-navy">
                    {cohort.currentStudents}/{cohort.maxStudents} students
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
