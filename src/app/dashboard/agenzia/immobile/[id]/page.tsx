"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  getPropertyTypeLabel,
  getStatusLabel,
  getStatusColor,
} from "@/lib/utils";

const STATUS_FLOW = [
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "UNDER_CONTRACT",
  "SOLD",
] as const;

function getNextStatuses(current: string): string[] {
  const allowed: Record<string, string[]> = {
    DRAFT: ["PENDING_REVIEW"],
    PENDING_REVIEW: ["PUBLISHED", "DRAFT"],
    PUBLISHED: ["UNDER_CONTRACT", "WITHDRAWN"],
    UNDER_CONTRACT: ["SOLD", "PUBLISHED"],
    SOLD: [],
    WITHDRAWN: ["DRAFT"],
  };
  return allowed[current] || [];
}

const statusActionLabels: Record<string, string> = {
  DRAFT: "Riporta a Bozza",
  PENDING_REVIEW: "Avvia Sopralluogo",
  PUBLISHED: "Pubblica Annuncio",
  UNDER_CONTRACT: "Avvia Trattativa",
  SOLD: "Segna come Venduto",
  WITHDRAWN: "Ritira Annuncio",
};

export default function AgencyPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [property, setProperty] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "visite" | "leads" | "contratto">("info");
  const [visitAction, setVisitAction] = useState<string | null>(null);

  async function fetchProperty() {
    try {
      const res = await fetch(`/api/dashboard/agency/property/${id}`);
      if (!res.ok) {
        setError("Immobile non trovato o non autorizzato.");
        return;
      }
      const data = await res.json();
      setProperty(data.property);
      setAssignment(data.assignment);
    } catch {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperty();
  }, [id]);

  async function handleStatusChange(newStatus: string) {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/dashboard/agency/property/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setProperty((prev: any) => ({ ...prev, status: data.property.status, publishedAt: data.property.publishedAt }));
      }
    } catch {
      // silent fail
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleVisitConfirm(visitId: string, status: "CONFIRMED" | "CANCELLED") {
    setVisitAction(visitId);
    try {
      await fetch(`/api/visits/${visitId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchProperty();
    } catch {
      // silent fail
    } finally {
      setVisitAction(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="agency">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#f8fafc] rounded-lg animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout role="agency">
        <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] text-center">
          <h2 className="text-lg font-semibold text-[#0a1f44] mb-2">
            {error || "Immobile non trovato"}
          </h2>
          <Link href="/dashboard/agenzia" className="text-[#0e8ff1] hover:underline text-sm">
            Torna alla Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const nextStatuses = getNextStatuses(property.status);
  const pendingVisits = property.visits?.filter((v: any) => v.status === "PENDING") || [];
  const confirmedVisits = property.visits?.filter((v: any) => v.status === "CONFIRMED") || [];
  const completedVisits = property.visits?.filter((v: any) => v.status === "COMPLETED" || v.status === "CANCELLED") || [];

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/agenzia" className="text-sm text-[#0e8ff1] hover:underline mb-2 inline-block">
              &larr; Torna alla Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#0a1f44]">{property.title}</h1>
            <p className="text-[#64748b]">{property.address}, {property.city} ({property.province})</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
              {getStatusLabel(property.status)}
            </span>
            <span className="text-2xl font-bold text-[#0e8ff1]">{formatPrice(property.price)}</span>
          </div>
        </div>

        {/* Status pipeline */}
        <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
          <h3 className="text-sm font-semibold text-[#0a1f44] mb-3">Pipeline Stato</h3>
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {STATUS_FLOW.map((s, i) => {
              const isActive = property.status === s;
              const isPast = STATUS_FLOW.indexOf(property.status) > i;
              return (
                <div key={s} className="flex items-center">
                  {i > 0 && (
                    <div className={`w-8 h-0.5 ${isPast ? "bg-[#0e8ff1]" : "bg-[#e2e8f0]"}`} />
                  )}
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      isActive
                        ? "bg-[#0e8ff1] text-white"
                        : isPast
                        ? "bg-[#0e8ff1]/10 text-[#0e8ff1]"
                        : "bg-[#f8fafc] text-[#94a3b8]"
                    }`}
                  >
                    {getStatusLabel(s)}
                  </div>
                </div>
              );
            })}
          </div>
          {nextStatuses.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusUpdating}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    s === "SOLD" || s === "PUBLISHED"
                      ? "bg-[#0e8ff1] text-white hover:bg-[#0a1f44]"
                      : s === "WITHDRAWN"
                      ? "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20"
                      : "bg-[#f8fafc] text-[#1e293b] border border-[#e2e8f0] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {statusUpdating ? "..." : statusActionLabels[s] || getStatusLabel(s)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#e2e8f0]">
          {[
            { id: "info" as const, label: "Dettagli" },
            { id: "visite" as const, label: `Visite (${property._count?.visits || 0})` },
            { id: "leads" as const, label: `Richieste (${property._count?.leads || 0})` },
            { id: "contratto" as const, label: "Contratto" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-[#0e8ff1] text-[#0e8ff1]"
                  : "border-transparent text-[#64748b] hover:text-[#0a1f44]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property details */}
            <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] space-y-4">
              <h3 className="font-semibold text-[#0a1f44]">Informazioni Immobile</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#64748b]">Tipologia</span>
                  <p className="font-medium text-[#0a1f44]">{getPropertyTypeLabel(property.type)}</p>
                </div>
                <div>
                  <span className="text-[#64748b]">Superficie</span>
                  <p className="font-medium text-[#0a1f44]">{property.surface} m&sup2;</p>
                </div>
                <div>
                  <span className="text-[#64748b]">Locali</span>
                  <p className="font-medium text-[#0a1f44]">{property.rooms}</p>
                </div>
                <div>
                  <span className="text-[#64748b]">Bagni</span>
                  <p className="font-medium text-[#0a1f44]">{property.bathrooms}</p>
                </div>
                {property.floor !== null && (
                  <div>
                    <span className="text-[#64748b]">Piano</span>
                    <p className="font-medium text-[#0a1f44]">{property.floor}{property.totalFloors ? ` / ${property.totalFloors}` : ""}</p>
                  </div>
                )}
                {property.energyClass && (
                  <div>
                    <span className="text-[#64748b]">Classe Energetica</span>
                    <p className="font-medium text-[#0a1f44]">{property.energyClass}</p>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <span className="text-[#64748b]">Anno Costruzione</span>
                    <p className="font-medium text-[#0a1f44]">{property.yearBuilt}</p>
                  </div>
                )}
                <div>
                  <span className="text-[#64748b]">CAP</span>
                  <p className="font-medium text-[#0a1f44]">{property.cap}</p>
                </div>
              </div>
              {/* Features */}
              <div className="flex flex-wrap gap-2 pt-2">
                {property.hasGarage && <span className="px-2.5 py-1 bg-[#f0f9ff] text-[#0e8ff1] text-xs rounded-full">Garage</span>}
                {property.hasGarden && <span className="px-2.5 py-1 bg-[#f0f9ff] text-[#0e8ff1] text-xs rounded-full">Giardino</span>}
                {property.hasBalcony && <span className="px-2.5 py-1 bg-[#f0f9ff] text-[#0e8ff1] text-xs rounded-full">Balcone</span>}
                {property.hasElevator && <span className="px-2.5 py-1 bg-[#f0f9ff] text-[#0e8ff1] text-xs rounded-full">Ascensore</span>}
              </div>
              {property.description && (
                <div className="pt-2">
                  <span className="text-[#64748b] text-sm">Descrizione</span>
                  <p className="text-sm text-[#1e293b] mt-1 whitespace-pre-line">{property.description}</p>
                </div>
              )}
            </div>

            {/* Seller info + assignment info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                <h3 className="font-semibold text-[#0a1f44] mb-3">Venditore</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Nome</span>
                    <span className="text-[#0a1f44] font-medium">{property.seller?.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Email</span>
                    <a href={`mailto:${property.seller?.email}`} className="text-[#0e8ff1] hover:underline">
                      {property.seller?.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Telefono</span>
                    <a href={`tel:${property.seller?.phone}`} className="text-[#0e8ff1] hover:underline">
                      {property.seller?.phone || "—"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                <h3 className="font-semibold text-[#0a1f44] mb-3">Assegnazione</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Data assegnazione</span>
                    <span className="text-[#0a1f44]">{assignment ? formatDate(assignment.assignedAt) : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Giorni dall&apos;assegnazione</span>
                    <span className="text-[#0a1f44] font-medium">
                      {assignment ? Math.floor((Date.now() - new Date(assignment.assignedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Visualizzazioni</span>
                    <span className="text-[#0a1f44] font-medium">{property.viewCount}</span>
                  </div>
                  {property.publishedAt && (
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Pubblicato il</span>
                      <span className="text-[#0a1f44]">{formatDate(property.publishedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              {property.photos?.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0a1f44] mb-3">Foto ({property.photos.length})</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {property.photos.map((photo: any, i: number) => (
                      <div key={photo.id || i} className="aspect-square rounded-lg overflow-hidden bg-[#f8fafc]">
                        <img
                          src={photo.url}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "visite" && (
          <div className="space-y-4">
            {/* Pending visits */}
            {pendingVisits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#f59e0b] mb-2">In Attesa ({pendingVisits.length})</h3>
                <div className="space-y-2">
                  {pendingVisits.map((visit: any) => (
                    <div key={visit.id} className="bg-white rounded-xl p-4 border border-[#f59e0b]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#0a1f44]">{visit.buyerName}</p>
                        <p className="text-sm text-[#64748b]">{formatDateTime(visit.scheduledAt)}</p>
                        <div className="flex gap-3 text-xs text-[#64748b] mt-1">
                          <a href={`mailto:${visit.buyerEmail}`} className="text-[#0e8ff1] hover:underline">{visit.buyerEmail}</a>
                          {visit.buyerPhone && <a href={`tel:${visit.buyerPhone}`} className="text-[#0e8ff1] hover:underline">{visit.buyerPhone}</a>}
                        </div>
                        {visit.notes && <p className="text-xs text-[#64748b] mt-1">{visit.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVisitConfirm(visit.id, "CONFIRMED")}
                          disabled={visitAction === visit.id}
                          className="px-3 py-1.5 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-50"
                        >
                          Conferma
                        </button>
                        <button
                          onClick={() => handleVisitConfirm(visit.id, "CANCELLED")}
                          disabled={visitAction === visit.id}
                          className="px-3 py-1.5 bg-[#ef4444]/10 text-[#ef4444] rounded-lg text-sm font-medium hover:bg-[#ef4444]/20 transition-colors disabled:opacity-50"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed visits */}
            {confirmedVisits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#10b981] mb-2">Confermate ({confirmedVisits.length})</h3>
                <div className="space-y-2">
                  {confirmedVisits.map((visit: any) => (
                    <div key={visit.id} className="bg-white rounded-xl p-4 border border-[#e2e8f0]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#0a1f44]">{visit.buyerName}</p>
                          <p className="text-sm text-[#64748b]">{formatDateTime(visit.scheduledAt)}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Confermata</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past visits */}
            {completedVisits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#64748b] mb-2">Passate ({completedVisits.length})</h3>
                <div className="space-y-2">
                  {completedVisits.map((visit: any) => (
                    <div key={visit.id} className="bg-white rounded-xl p-4 border border-[#e2e8f0] opacity-70">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-[#0a1f44]">{visit.buyerName}</p>
                          <p className="text-sm text-[#64748b]">{formatDateTime(visit.scheduledAt)}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          visit.status === "COMPLETED" ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"
                        }`}>
                          {visit.status === "COMPLETED" ? "Completata" : "Annullata"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.visits?.length === 0 && (
              <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] text-center">
                <p className="text-[#64748b]">Nessuna visita programmata per questo immobile.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-3">
            {property.leads?.length > 0 ? (
              property.leads.map((lead: any) => (
                <div key={lead.id} className="bg-white rounded-xl p-4 border border-[#e2e8f0]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#0a1f44]">{lead.name}</p>
                      <div className="flex gap-3 text-sm text-[#64748b] mt-1">
                        <a href={`mailto:${lead.email}`} className="text-[#0e8ff1] hover:underline">{lead.email}</a>
                        {lead.phone && <a href={`tel:${lead.phone}`} className="text-[#0e8ff1] hover:underline">{lead.phone}</a>}
                      </div>
                      {lead.message && (
                        <p className="text-sm text-[#64748b] mt-2 bg-[#f8fafc] rounded-lg p-3">{lead.message}</p>
                      )}
                    </div>
                    <span className="text-xs text-[#94a3b8]">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] text-center">
                <p className="text-[#64748b]">Nessuna richiesta ricevuta per questo immobile.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "contratto" && (
          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
            {property.contract ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-[#0a1f44]">Contratto</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#64748b]">Tipo</span>
                    <p className="font-medium text-[#0a1f44]">{property.contract.type.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Durata</span>
                    <p className="font-medium text-[#0a1f44]">{property.contract.duration} giorni</p>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Firma Venditore</span>
                    <p className={`font-medium ${property.contract.sellerSigned ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
                      {property.contract.sellerSigned ? "Firmato" : "In attesa"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Firma Agenzia</span>
                    <p className={`font-medium ${property.contract.agencySigned ? "text-[#10b981]" : "text-[#f59e0b]"}`}>
                      {property.contract.agencySigned ? "Firmato" : "In attesa"}
                    </p>
                  </div>
                  {property.contract.signedAt && (
                    <div>
                      <span className="text-[#64748b]">Data firma</span>
                      <p className="font-medium text-[#0a1f44]">{formatDate(property.contract.signedAt)}</p>
                    </div>
                  )}
                  {property.contract.expiresAt && (
                    <div>
                      <span className="text-[#64748b]">Scadenza</span>
                      <p className="font-medium text-[#0a1f44]">{formatDate(property.contract.expiresAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#64748b] mb-4">Nessun contratto ancora creato per questo immobile.</p>
                <p className="text-sm text-[#94a3b8]">Il contratto viene generato quando l&apos;immobile passa allo stato &quot;In trattativa&quot;.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
