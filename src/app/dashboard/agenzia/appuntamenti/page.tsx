"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDateTime } from "@/lib/utils";

function buildGoogleCalendarUrl(visit: { scheduledAt: string; propertyTitle: string; propertyCity: string; buyerName: string }) {
  const start = new Date(visit.scheduledAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Visita: ${visit.propertyTitle}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Visita immobile con ${visit.buyerName}\nImmobile: ${visit.propertyTitle}\nCittà: ${visit.propertyCity}`,
    location: visit.propertyCity,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

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
  const statusColors: Record<string, string> = { PENDING: "bg-accent/10 text-accent", CONFIRMED: "bg-success/10 text-success", COMPLETED: "bg-primary/10 text-primary", CANCELLED: "bg-error/10 text-error" };

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Calendario Visite</h1>

        {fetchError && !loading && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-5 text-center">
            <p className="text-sm font-medium text-error">{fetchError}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-medium text-primary underline hover:no-underline">Riprova</button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {[{ id: "ALL", label: "Tutte" }, { id: "PENDING", label: "In Attesa" }, { id: "CONFIRMED", label: "Confermate" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id ? "bg-primary text-white" : "bg-white text-text-muted border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-bg-soft rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-border text-center">
            <p className="text-text-muted">Nessuna visita programmata.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((visit: any) => (
              <div key={visit.id} className="bg-white rounded-xl p-5 border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary font-semibold">{formatDateTime(visit.scheduledAt)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[visit.status]}`}>
                        {statusLabels[visit.status]}
                      </span>
                    </div>
                    <p className="font-medium text-primary-dark">{visit.propertyTitle}</p>
                    <p className="text-sm text-text-muted">{visit.propertyCity}</p>
                    <p className="text-sm text-text-muted mt-1">
                      Acquirente: {visit.buyerName} — {visit.buyerPhone} — {visit.buyerEmail}
                    </p>
                  </div>
                  <div className="flex gap-2 self-start flex-wrap">
                    {visit.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleConfirm(visit.id, "CONFIRMED")}
                          className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success/85 transition-colors"
                        >
                          Conferma
                        </button>
                        <button
                          onClick={() => handleConfirm(visit.id, "CANCELLED")}
                          className="px-4 py-2 bg-white text-error border border-error rounded-lg text-sm font-medium hover:bg-error/5 transition-colors"
                        >
                          Annulla
                        </button>
                      </>
                    )}
                    <a
                      href={buildGoogleCalendarUrl(visit)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-text-muted border border-border rounded-lg text-sm font-medium hover:bg-bg-soft transition-colors"
                      title="Aggiungi a Google Calendar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Calendario
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
