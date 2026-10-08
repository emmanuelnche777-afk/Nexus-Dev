"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, FileText, MessageSquare, TrendingUp } from "lucide-react";
import LoadingState from "@/components/admin/LoadingState";
import EmptyState from "@/components/admin/EmptyState";

interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  status: string;
  priority: string;
  createdAt: string;
  quoteAmount?: number | null;
  quoteCurrency?: string;
}

interface Contract {
  id: string;
  clientName: string;
  serviceType: string;
  status: string;
  contractType: string;
  sentAt?: string;
  signedAt?: string;
}

export default function TechHubDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const ordersRes = await fetch("/api/admin/service-orders", { cache: "no-store" });
      const ordersData = await ordersRes.json();
      const contractsRes = await fetch("/api/admin/tech-hub/contracts", { cache: "no-store" });
      const contractsData = await contractsRes.json();
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : []);
      setContracts(Array.isArray(contractsData.contracts) ? contractsData.contracts : []);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void load());
  }, []);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ClipboardList, color: "text-nexus-cyan" },
    { label: "New", value: orders.filter((o) => o.status === "new").length, icon: MessageSquare, color: "text-blue-500" },
    { label: "In Progress", value: orders.filter((o) => o.status === "in_progress").length, icon: TrendingUp, color: "text-cyan-500" },
    { label: "Completed", value: orders.filter((o) => o.status === "completed").length, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Unsigned Contracts", value: contracts.filter((c) => c.status === "sent" && !c.signedAt).length, icon: FileText, color: "text-amber-500" },
  ];

  if (loading) {
    return <LoadingState />;
  }

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const awaitingSignature = [...contracts]
    .filter((c) => c.status === "sent" && !c.signedAt)
    .sort((a, b) => new Date(b.sentAt || "").getTime() - new Date(a.sentAt || "").getTime())
    .slice(0, 10);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-nexus-navy">Tech Hub</h1>
        <p className="mt-1 text-sm text-nexus-navy/60">
          Manage tech hub services, client orders, contracts, and conversations.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-nexus-navy/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-nexus-navy">{stat.value}</div>
                <div className="text-xs text-nexus-navy/50">{stat.label}</div>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-nexus-navy">Recent orders</h2>
          <Link href="/admin/tech-hub/orders" className="text-xs font-semibold text-nexus-cyan hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Client service requests will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-nexus-navy/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-nexus-navy/10 text-xs uppercase tracking-wide text-nexus-navy/50">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-nexus-navy/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-nexus-navy">{order.clientName}</div>
                      <div className="text-xs text-nexus-navy/50">{order.clientEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-nexus-navy/80">{order.serviceType}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.status === "new"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "in_progress"
                          ? "bg-cyan-100 text-cyan-700"
                          : order.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : order.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-nexus-navy/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/tech-hub/orders/${order.id}`}
                        className="rounded bg-nexus-cyan/10 px-3 py-1.5 text-xs font-semibold text-nexus-cyan hover:bg-nexus-cyan hover:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-nexus-navy">Contracts awaiting signature</h2>
          <Link href="/admin/tech-hub/contracts" className="text-xs font-semibold text-nexus-cyan hover:underline">
            View all
          </Link>
        </div>
        {awaitingSignature.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No contracts awaiting signature"
            description="Sent contracts will appear here while awaiting client signature."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-nexus-navy/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-nexus-navy/10 text-xs uppercase tracking-wide text-nexus-navy/50">
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {awaitingSignature.map((contract) => (
                  <tr key={contract.id} className="border-b border-nexus-navy/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-nexus-navy">{contract.clientName}</div>
                      <div className="text-xs text-nexus-navy/50">{contract.serviceType}</div>
                    </td>
                    <td className="px-4 py-3 text-nexus-navy/80">{contract.serviceType}</td>
                    <td className="px-4 py-3 text-nexus-navy/70">{contract.contractType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">
                        Awaiting signature
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-nexus-navy/60">
                      {contract.sentAt ? new Date(contract.sentAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/tech-hub/contracts/${contract.id}`}
                        className="rounded bg-nexus-cyan/10 px-3 py-1.5 text-xs font-semibold text-nexus-cyan hover:bg-nexus-cyan hover:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
