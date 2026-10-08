"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import OrderDetail, { TechHubServiceOrder } from "@/components/admin/tech-hub/OrderDetail";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [paramsId, setParamsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setParamsId(p.id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params]);

  async function handleDraftContract(order: TechHubServiceOrder) {
    try {
      const res = await fetch("/api/admin/tech-hub/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (res.ok && data.contract?.id) {
        router.push("/admin/tech-hub/contracts");
      } else {
        alert(data.error || "Failed to draft contract");
      }
    } catch {
      alert("Failed to draft contract");
    }
  }

  async function handleStartConversation(order: TechHubServiceOrder) {
    try {
      const res = await fetch("/api/admin/tech-hub/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (res.ok && data.conversation?.id) {
        router.push(`/admin/tech-hub/messaging/${data.conversation.id}`);
      } else {
        alert(data.error || "Failed to start conversation");
      }
    } catch {
      alert("Failed to start conversation");
    }
  }

  if (!paramsId || loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nexus-cyan" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/tech-hub/orders"
          className="mb-2 inline-flex items-center gap-1 text-sm text-nexus-navy/60 hover:text-nexus-cyan"
        >
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <h1 className="text-2xl font-bold text-nexus-navy">Order details</h1>
        <p className="text-sm text-nexus-navy/60">Review client request, contact the client, and draft a contract.</p>
      </div>

      <OrderDetail
        orderId={paramsId}
        onDraftContract={handleDraftContract}
        onStartConversation={handleStartConversation}
        emptyStateTitle="Order not found"
        emptyStateDescription="The requested order could not be loaded or does not exist."
      />
    </div>
  );
}
