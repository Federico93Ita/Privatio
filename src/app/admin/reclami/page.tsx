"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Complaint {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  userType: string;
  subject: string;
  description: string;
  status: "RECEIVED" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminReclamiPage() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`/api/admin/complaints${qs}`);
    if (res.ok) setItems((await res.json()).complaints || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [status]);

  async function update(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) load();
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#0B1D3A]">Reclami</h1>
          <a
            href="/api/admin/export/complaints"
            className="rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-white"
          >
            Esporta CSV
          </a>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value="">Tutti</option>
          <option value="RECEIVED">Ricevuti</option>
          <option value="IN_REVIEW">In revisione</option>
          <option value="RESOLVED">Risolti</option>
          <option value="CLOSED">Chiusi</option>
        </select>

        {loading ? (
          <p className="text-sm text-[#0B1D3A]/50">Caricamento…</p>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="rounded-xl border border-black/[0.06] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#0B1D3A]/50">
                      #{c.referenceNumber} · {c.userType} · {new Date(c.createdAt).toLocaleString("it-IT")}
                    </div>
                    <h3 className="mt-1 font-medium text-[#0B1D3A]">{c.subject}</h3>
                    <p className="mt-1 text-sm text-[#0B1D3A]/70">
                      {c.name} ({c.email})
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#0B1D3A]">{c.description}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === "RESOLVED" || c.status === "CLOSED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => update(c.id, { status: "IN_REVIEW" })}
                    className="rounded-lg border border-black/10 px-3 py-1"
                  >
                    In revisione
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt("Note di risoluzione?") || "";
                      update(c.id, { status: "RESOLVED", resolutionNote: note });
                    }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
                  >
                    Risolto
                  </button>
                  <button
                    onClick={() => update(c.id, { status: "CLOSED" })}
                    className="rounded-lg border border-black/10 px-3 py-1"
                  >
                    Chiudi
                  </button>
                </div>
                {c.resolutionNote && (
                  <p className="mt-2 text-xs text-[#0B1D3A]/60">Note: {c.resolutionNote}</p>
                )}
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-[#0B1D3A]/50">Nessun reclamo.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
