"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  agency: { id: string; name: string };
}

export default function AdminRecensioniPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = filter === "all" ? "" : `?filter=${filter}`;
    const res = await fetch(`/api/admin/reviews${qs}`);
    if (res.ok) setReviews((await res.json()).reviews || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function toggle(r: Review) {
    const reason = r.isHidden ? null : prompt("Motivo nascondimento?") || "";
    const res = await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hide: !r.isHidden, reason }),
    });
    if (res.ok) load();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare la recensione?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-[#0B1D3A]">Recensioni</h1>
        <div className="flex gap-2">
          {(["all", "visible", "hidden"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                filter === f ? "border-[#C9A84C] bg-[#C9A84C]/10 text-[#0B1D3A]" : "border-black/10"
              }`}
            >
              {f === "all" ? "Tutte" : f === "visible" ? "Visibili" : "Nascoste"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[#0B1D3A]/50">Caricamento…</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-black/[0.06] bg-white p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="text-xs text-[#0B1D3A]/50">
                    {r.user.name || r.user.email} → {r.agency.name} · {r.rating}★
                    {r.isHidden && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                        NASCOSTA
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#0B1D3A]">{r.comment || "(senza commento)"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggle(r)} className="text-xs text-[#C9A84C] hover:underline">
                    {r.isHidden ? "Mostra" : "Nascondi"}
                  </button>
                  <button onClick={() => remove(r.id)} className="text-xs text-red-600 hover:underline">
                    Elimina
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-[#0B1D3A]/50">Nessuna recensione.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
