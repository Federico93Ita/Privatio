"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDateTime } from "@/lib/utils";

interface Visit {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  property: { title: string };
}

export default function SellerVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/dashboard/seller")
      .then((r) => r.json())
      .then((data) => {
        const propertyTitle = data.property?.title || "Immobile";
        const allVisits = (data.allVisits || []).map((v: any) => ({
          ...v,
          property: { title: propertyTitle },
        }));
        setVisits(allVisits);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredVisits = filter === "ALL" ? visits : visits.filter((v) => v.status === filter);
  const statusLabels: Record<string, string> = {
    PENDING: "In Attesa",
    CONFIRMED: "Confermata",
    COMPLETED: "Completata",
    CANCELLED: "Annullata",
  };
  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a1f44]">Visite Programmate</h1>

        <div className="flex gap-2 flex-wrap">
          {[{ id: "ALL", label: "Tutte" }, { id: "PENDING", label: "In Attesa" }, { id: "CONFIRMED", label: "Confermate" }, { id: "COMPLETED", label: "Completate" }, { id: "CANCELLED", label: "Annullate" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id ? "bg-[#0e8ff1] text-white" : "bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#f8fafc] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e2e8f0]">
            <p className="text-[#64748b]">Nessuna visita programmata.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVisits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0a1f44]">{visit.property.title}</p>
                    <p className="text-sm text-[#64748b] mt-1">
                      <span className="font-medium text-[#0e8ff1]">{formatDateTime(visit.scheduledAt)}</span>
                    </p>
                    <p className="text-sm text-[#64748b] mt-1">
                      Acquirente: {visit.buyerName} — {visit.buyerPhone}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${statusColors[visit.status] || "bg-gray-100 text-gray-700"}`}>
                    {statusLabels[visit.status] || visit.status}
                  </span>
                </div>
                {visit.notes && <p className="text-sm text-[#64748b] mt-2 italic">{visit.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
