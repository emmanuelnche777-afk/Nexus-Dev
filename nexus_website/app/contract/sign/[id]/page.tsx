"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SignaturePad from "@/components/SignaturePad";

interface ContractView {
  id: string;
  contractType: string;
  clientName: string;
  serviceType: string;
  totalAmount: number | null;
  currency: string;
  bodyText: string;
}

export default function ClientContractSignPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [contract, setContract] = useState<ContractView | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/contracts/${params.id}/sign?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load contract");
        if (!cancelled) setContract(data.contract);
      })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load contract"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params.id, token]);

  async function signContract() {
    if (!signature || !accepted) {
      setError("Draw your signature and confirm that you agree to the contract.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/contracts/${params.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, clientSignature: signature }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signature could not be saved");
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Signature could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-3xl font-bold text-slate-900">Review and sign your contract</h1>
      {loading ? <p className="mt-6">Loading secure contract link…</p> : null}
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {done && <p className="mt-5 rounded-lg bg-green-50 p-4 text-green-800">Your signature has been saved. NEXUS will review and add its authorized signature.</p>}
      {contract && !done && (
        <>
          <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{contract.contractType.replaceAll("-", " ")}</h2>
            <p className="mt-1 text-sm text-slate-600">For {contract.clientName} · {contract.serviceType}</p>
            <p className="mt-2 text-sm text-slate-600">Amount: {contract.totalAmount == null ? "To be agreed" : `${contract.totalAmount.toLocaleString()} ${contract.currency}`}</p>
            <article className="mt-6 max-h-[55vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-5 text-sm leading-6">{contract.bodyText}</article>
          </section>
          <section className="mt-6 rounded-xl border bg-white p-6">
            <h2 className="font-semibold">Client signature</h2>
            <p className="my-2 text-sm text-slate-600">Draw your signature in the box.</p>
            <SignaturePad onChange={setSignature} />
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>I have reviewed this contract and agree to sign it electronically.</span>
            </label>
            <button onClick={signContract} disabled={saving} className="mt-5 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50">
              {saving ? "Saving signature…" : "Sign contract"}
            </button>
          </section>
        </>
      )}
    </main>
  );
}
