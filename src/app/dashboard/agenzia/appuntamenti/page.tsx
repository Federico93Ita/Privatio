"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDateTime } from "@/lib/utils";

export default function AgencyAppointmentsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/dashboard/agency")
      .then((r) => {
        if (!r.ok) throw new Error("Errore nel caricamento");
        return r.json();
      })
      .then((data) => {
        const allVisits = (data.agency?.assignments || []).flatMap((a: any) =>
          (a.property.visits || []).map((v: any) => ({ ...v, propertyTitle: a.property.title, propertyCity: a.property.city }))
        );
        allVisits.sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setVisits(allVisits);
      })
      .catch(() => setFetchError("Errore nel caricamento degli appuntamenti. Riprova."))
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirm(visitId: string, status: string) {
    try {
      const res = await fetch(`/api/visits/${visitId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status } : v)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = filter === "ALL" ? visits : visits.filter((v) => v.status === filter);
  const statusLabels: Record<string, string> = { PENDING: "In Attesa", CONFIRMED: "Confermata", COMPLETED: "Completata", CANCELLED: "Annullata" };
  const statusColors: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", CONFIRMED: "bg-green-100 text-green-700", COMPLETED: "bg-blue-100 text-blue-700", CANCELLED: "bg-red-100 text-red-700" };

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a1f44]">Calendario Visite</h1>

        {fetchError && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm font-medium text-red-600">{fetchError}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-semibold text-[#0e8ff1] underline hover:no-underline">Riprova</button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {[{ id: "ALL", label: "Tutte" }, { id: "PENDING", label: "In Attesa" }, { id: "CONFIRMED", label: "Confermate" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id ? "bg-[#0e8ff1] text-white" : "bg-white text-[#64748b] border border-[#e2e8f0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[#f8fafc] rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] text-center">
            <p className="text-[#64748b]">Nessuna visita programmata.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((visit: any) => (
              <div key={visit.id} className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#0e8ff1] font-semibold">{formatDateTime(visit.scheduledAt)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[visit.status]}`}>
                        {statusLabels[visit.status]}
                      </span>
                    </div>
                    <p className="font-medium text-[#0a1f44]">{visit.propertyTitle}</p>
                    <p className="text-sm text-[#64748b]">{visit.propertyCity}</p>
                    <p className="text-sm text-[#64748b] mt-1">
                      Acquirente: {visit.buyerName} — {visit.buyerPhone} — {visit.buyerEmail}
                    </p>
                  </div>
                  {visit.status === "PENDING" && (
                    <div className="flex gap-2 self-start">
                      <button
                        onClick={() => handleConfirm(visit.id, "CONFIRMED")}
                        className="px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
                      >
                        Conferma
                      </button>
                      <button
                        onClick={() => handleConfirm(visit.id, "CANCELLED")}
                        className="px-4 py-2 bg-white text-[#ef4444] border border-[#ef4444] rounded-lg text-sm font-medium hover:bg-[#ef4444]/5 transition-colors"
                      >
                        Annulla
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
