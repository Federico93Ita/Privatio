"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDateTime } from "@/lib/utils";

function buildCalendarUrl(visit: { scheduledAt: string; property: { title: string }; buyerName: string }) {
  const start = new Date(visit.scheduledAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Visita: ${visit.property.title}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Visita immobile con ${visit.buyerName}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/dashboard/seller")
      .then((r) => {
        if (!r.ok) throw new Error("Errore nel caricamento");
        return r.json();
      })
      .then((data) => {
        const propertyTitle = data.property?.title || "Immobile";
        const allVisits = (data.allVisits || []).map((v: any) => ({
          ...v,
          property: { title: propertyTitle },
        }));
        setVisits(allVisits);
      })
      .catch(() => setFetchError("Errore nel caricamento delle visite. Riprova."))
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
    PENDING: "bg-accent/10 text-accent",
    CONFIRMED: "bg-success/10 text-success",
    COMPLETED: "bg-primary/10 text-primary",
    CANCELLED: "bg-error/10 text-error",
  };

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Visite Programmate</h1>

        {fetchError && !loading && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-5 text-center">
            <p className="text-sm font-medium text-error">{fetchError}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-medium text-primary underline hover:no-underline">Riprova</button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {[{ id: "ALL", label: "Tutte" }, { id: "PENDING", label: "In Attesa" }, { id: "CONFIRMED", label: "Confermate" }, { id: "COMPLETED", label: "Completate" }, { id: "CANCELLED", label: "Annullate" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id ? "bg-primary text-white" : "bg-white text-text-muted border border-border hover:bg-bg-soft"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-border">
            <p className="text-text-muted">Nessuna visita programmata.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVisits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-xl p-5 border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-primary-dark">{visit.property.title}</p>
                    <p className="text-sm text-text-muted mt-1">
                      <span className="font-medium text-primary">{formatDateTime(visit.scheduledAt)}</span>
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      Acquirente: {visit.buyerName} — {visit.buyerPhone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[visit.status] || "bg-bg-soft text-text-muted"}`}>
                      {statusLabels[visit.status] || visit.status}
                    </span>
                    <a
                      href={buildCalendarUrl(visit)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-text-muted border border-border rounded-lg hover:bg-bg-soft transition-colors"
                      title="Aggiungi a Google Calendar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Calendario
                    </a>
                  </div>
                </div>
                {visit.notes && <p className="text-sm text-text-muted mt-2 italic">{visit.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
