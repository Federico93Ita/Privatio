"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AgencyDashboardPage() {
  const [agency, setAgency] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/dashboard/agency")
      .then((r) => {
        if (!r.ok) throw new Error("Errore nel caricamento");
        return r.json();
      })
      .then((data) => {
        setAgency(data.agency);
        setStats(data.stats);
      })
      .catch(() => setFetchError("Errore nel caricamento dei dati. Riprova."))
      .finally(() => setLoading(false));
  }, []);

  const statusLabels: Record<string, string> = {
    DRAFT: "Da Contattare",
    PENDING_REVIEW: "Sopralluogo",
    PUBLISHED: "Pubblicato",
    UNDER_CONTRACT: "Trattativa",
    SOLD: "Venduto",
  };
  const statusColors: Record<string, string> = {
    DRAFT: "bg-bg-soft text-text-muted",
    PENDING_REVIEW: "bg-accent/10 text-accent",
    PUBLISHED: "bg-success/10 text-success",
    UNDER_CONTRACT: "bg-primary/10 text-primary",
    SOLD: "bg-primary/10 text-primary",
  };

  const assignments = agency?.assignments || [];
  const filtered = statusFilter === "ALL"
    ? assignments
    : assignments.filter((a: any) => a.property.status === statusFilter);

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Dashboard Agenzia</h1>

        {fetchError && !loading && (
          <div className="rounded-xl border border-error/20 bg-error/5 p-5 text-center">
            <p className="text-sm font-medium text-error">{fetchError}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm font-medium text-primary underline hover:no-underline">Riprova</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !agency && !fetchError ? (
          <div className="bg-white rounded-xl p-8 border border-border text-center">
            <h3 className="text-lg font-medium text-primary-dark mb-2">Agenzia non trovata</h3>
            <p className="text-text-muted">Il tuo profilo agenzia non è ancora configurato.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Immobili Attivi", value: stats?.activeProperties || 0, color: "text-primary" },
                { label: "Vendite Completate", value: stats?.completedSales || 0, color: "text-success" },
                { label: "Visite in Programma", value: stats?.pendingVisits || 0, color: "text-accent" },
                { label: "Valutazione", value: agency.rating ? `${agency.rating}/5` : "N/D", color: "text-primary-dark" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-border">
                  <p className="text-sm text-text-muted">{stat.label}</p>
                  <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Subscription banner */}
            {!agency.isActive && (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-primary-dark">Abbonamento non attivo</h3>
                  <p className="text-sm text-text-muted">Attiva un piano per iniziare a ricevere immobili.</p>
                </div>
                <a
                  href="/dashboard/agenzia/fatturazione"
                  className="px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/85 transition-colors"
                >
                  Attiva Piano
                </a>
              </div>
            )}

            {/* Pipeline */}
            <div>
              <h2 className="text-lg font-medium text-primary-dark mb-4">Pipeline Immobili</h2>
              <div className="flex gap-2 flex-wrap mb-4">
                {[
                  { id: "ALL", label: "Tutti" },
                  { id: "DRAFT", label: "Da Contattare" },
                  { id: "PENDING_REVIEW", label: "Sopralluogo" },
                  { id: "PUBLISHED", label: "Pubblicato" },
                  { id: "UNDER_CONTRACT", label: "Trattativa" },
                  { id: "SOLD", label: "Venduto" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === tab.id
                        ? "bg-primary text-white"
                        : "bg-white text-text-muted border border-border hover:bg-bg-soft"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-border text-center">
                  <p className="text-text-muted">Nessun immobile in questa categoria.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((assignment: any) => {
                    const p = assignment.property;
                    const daysSince = Math.floor(
                      (Date.now() - new Date(assignment.assignedAt).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={assignment.id} className="bg-white rounded-xl p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-primary-dark">{p.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status] || "bg-bg-soft text-text-muted"}`}>
                              {statusLabels[p.status] || p.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted">{p.city} ({p.province})</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-medium text-primary">{formatPrice(p.price)}</span>
                            <span className="text-text-muted">Venditore: {p.seller?.name || "—"}</span>
                            <span className="text-text-muted">{daysSince} giorni</span>
                          </div>
                        </div>
                        <a
                          href={`/dashboard/agenzia/immobile/${p.id}`}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors self-start"
                        >
                          Gestisci
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
