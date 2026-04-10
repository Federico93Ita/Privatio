"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyStage {
  key: string;
  label: string;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface Agency {
  id?: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  logoUrl?: string | null;
  tagline?: string | null;
  specializations?: string[];
  uniqueSellingPoints?: string[];
  responseTimeHours?: number | null;
  profileCompletedAt?: string | null;
}

interface Lead {
  id: string;
  name: string;
  date: string;
  message: string;
}

interface Visit {
  id: string;
  date: string;
  buyerName: string;
  status: "pending" | "confirmed";
}

interface ZoneAgency {
  id: string;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  rating: number;
  tagline?: string | null;
  specializations?: string[];
  uniqueSellingPoints?: string[];
  responseTimeHours?: number | null;
  city?: string | null;
  phone?: string | null;
  plan: string;
  activeProperties: number;
  profileCompleted: boolean;
}

interface DashboardData {
  property: {
    id: string;
    slug: string;
    title: string;
    address: string;
    currentStage: string;
    status: string;
  } | null;
  stats: {
    views: number;
    infoRequests: number;
    scheduledVisits: number;
    daysOnline: number;
  };
  agency: Agency | null;
  recentLeads: Lead[];
  upcomingVisits: Visit[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAGES: PropertyStage[] = [
  { key: "inserted", label: "Inserito" },
  { key: "review", label: "In Revisione" },
  { key: "published", label: "Pubblicato" },
  { key: "negotiation", label: "In Trattativa" },
  { key: "sold", label: "Venduto" },
];

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-border/50 ${className ?? ""}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-8 w-64" />
      <SkeletonBlock className="h-32 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>
      <SkeletonBlock className="h-40 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-48" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline Icons                                                       */
/* ------------------------------------------------------------------ */

function EyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ProgressBar({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full">
      {/* Mobile: vertical list */}
      <div className="sm:hidden space-y-3">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? "bg-success text-white"
                    : isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-border text-text-muted"
                }`}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  isCurrent ? "font-medium text-primary" : isCompleted ? "text-text" : "text-text-muted"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center gap-0">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isLast = idx === STAGES.length - 1;

          return (
            <div key={stage.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isCompleted
                      ? "bg-success text-white"
                      : isCurrent
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-border text-text-muted"
                  }`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-center text-xs leading-tight ${
                    isCurrent ? "font-medium text-primary" : "text-text-muted"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 w-8 lg:w-12 ${
                    isCompleted ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: DashboardData["stats"] }) {
  const cards: StatCard[] = [
    { label: "Visualizzazioni", value: stats.views, icon: <EyeIcon /> },
    { label: "Richieste Info", value: stats.infoRequests, icon: <MailIcon /> },
    { label: "Visite Programmate", value: stats.scheduledVisits, icon: <CalendarIcon /> },
    { label: "Giorni Online", value: stats.daysOnline, icon: <ClockIcon /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-text-muted">{card.icon}</span>
          </div>
          <p className="text-2xl font-medium text-text sm:text-3xl">{card.value}</p>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

function AgencyCard({ agency }: { agency: Agency | null }) {
  if (!agency) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-primary-dark">Agenzie Disponibili</h3>
        <div className="flex items-center gap-3 text-text-muted">
          <SpinnerIcon />
          <p className="text-sm">Consulta le agenzie partner disponibili nella tua zona e contatta quella che preferisci.</p>
        </div>
      </div>
    );
  }

  const usp = (agency.uniqueSellingPoints || []).slice(0, 3);
  const spec = (agency.specializations || []).slice(0, 3);
  const hasRichProfile = !!agency.profileCompletedAt && !!agency.id;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-medium text-primary-dark">Agenzia Partner</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {agency.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className="h-12 w-12 rounded-full object-contain bg-white border border-border"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {agency.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text truncate">{agency.name}</p>
            {agency.tagline && (
              <p className="text-xs text-text-muted truncate">{agency.tagline}</p>
            )}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < agency.rating} />
              ))}
              <span className="ml-1 text-xs text-text-muted">{agency.rating}/5</span>
            </div>
          </div>
        </div>
        {usp.length > 0 && (
          <ul className="space-y-1 text-sm text-text">
            {usp.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">✓</span>
                <span className="line-clamp-1">{p}</span>
              </li>
            ))}
          </ul>
        )}
        {spec.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {spec.map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {agency.responseTimeHours && (
          <p className="text-xs text-text-muted">
            ⚡ Risponde entro {agency.responseTimeHours}h
          </p>
        )}
        <div className="space-y-1.5 text-sm text-text-muted">
          <p className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {agency.phone}
          </p>
          <p className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {agency.email}
          </p>
        </div>
        {hasRichProfile && (
          <Link
            href={`/dashboard/venditore/agenzie/${agency.id}`}
            className="mt-2 inline-flex items-center justify-center w-full rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition"
          >
            Vedi profilo completo →
          </Link>
        )}
      </div>
    </div>
  );
}

function RecentLeads({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-primary-dark">Attivit&agrave; Recente</h3>
        <p className="text-sm text-text-muted">Nessuna richiesta ricevuta.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-medium text-primary-dark">Attivit&agrave; Recente</h3>
      <ul className="divide-y divide-border">
        {leads.map((lead) => (
          <li key={lead.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text">{lead.name}</p>
                <p className="mt-0.5 truncate text-xs text-text-muted">{lead.message}</p>
              </div>
              <span className="shrink-0 text-xs text-text-muted">{lead.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpcomingVisits({ visits }: { visits: Visit[] }) {
  if (visits.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-primary-dark">Prossime Visite</h3>
        <p className="text-sm text-text-muted">Nessuna visita in programma.</p>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "In Attesa", className: "bg-accent/10 text-accent" },
    confirmed: { label: "Confermata", className: "bg-success/10 text-success" },
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-lg font-medium text-primary-dark">Prossime Visite</h3>
      <ul className="space-y-3">
        {visits.map((visit) => {
          const badge = statusConfig[visit.status] ?? statusConfig.pending;
          return (
            <li
              key={visit.id}
              className="flex items-center justify-between rounded-lg border border-border bg-bg-soft p-3"
            >
              <div>
                <p className="text-sm font-medium text-text">{visit.buyerName}</p>
                <p className="mt-0.5 text-xs text-text-muted">{visit.date}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ZoneAgenciesList({
  propertySlug,
  onChosen,
}: {
  propertySlug: string;
  onChosen: () => void;
}) {
  const [agencies, setAgencies] = useState<ZoneAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${propertySlug}/agencies`)
      .then((r) => r.json())
      .then((d) => setAgencies(d.agencies || []))
      .catch(() => setError("Errore nel caricamento agenzie"))
      .finally(() => setLoading(false));
  }, [propertySlug]);

  const handleChoose = async (agencyId: string) => {
    if (choosing) return;
    setChoosing(agencyId);
    setError(null);
    try {
      const res = await fetch(`/api/properties/${propertySlug}/choose-agency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nella scelta");
        return;
      }
      onChosen();
    } catch {
      setError("Errore di connessione");
    } finally {
      setChoosing(null);
    }
  };

  const planLabels: Record<string, string> = {
    PREMIUM: "Premium",
    URBANA: "Urbana",
    BASE: "Base",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-primary-dark">
          Agenzie nella tua zona
        </h3>
        <div className="flex items-center gap-3 text-text-muted">
          <SpinnerIcon />
          <p className="text-sm">Caricamento agenzie...</p>
        </div>
      </div>
    );
  }

  if (agencies.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-medium text-primary-dark">
          Agenzie nella tua zona
        </h3>
        <p className="text-sm text-text-muted">
          Al momento non ci sono agenzie partner attive nella tua zona.
          Entro 48 ore dalla pubblicazione, le agenzie disponibili potranno contattarti direttamente.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-2 text-lg font-medium text-primary-dark">
        Scegli un&apos;agenzia partner
      </h3>
      <p className="mb-4 text-sm text-text-muted">
        Seleziona l&apos;agenzia che preferisci. Ricever&agrave; le informazioni del tuo immobile
        e ti contatter&agrave; per organizzare un sopralluogo.
      </p>
      {error && (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {agencies.map((agency) => (
          <div
            key={agency.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-bg-soft p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {agency.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agency.logoUrl}
                  alt={agency.name}
                  className="h-12 w-12 shrink-0 rounded-full object-contain bg-white border border-border"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {agency.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text truncate">{agency.name}</p>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {planLabels[agency.plan] || agency.plan}
                  </span>
                </div>
                {agency.tagline && (
                  <p className="text-xs text-text-muted truncate">{agency.tagline}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} filled={i < agency.rating} />
                    ))}
                    <span className="ml-1 text-xs text-text-muted">{agency.rating}/5</span>
                  </div>
                  {agency.responseTimeHours && (
                    <span className="text-xs text-text-muted">
                      · Risponde entro {agency.responseTimeHours}h
                    </span>
                  )}
                </div>
                {agency.specializations && agency.specializations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agency.specializations.slice(0, 3).map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:self-center">
              {agency.slug && (
                <a
                  href={`/agenzia/${agency.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  Vedi profilo
                </a>
              )}
              <button
                onClick={() => handleChoose(agency.id)}
                disabled={choosing !== null}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {choosing === agency.id ? (
                  <span className="flex items-center gap-2">
                    <SpinnerIcon /> Invio...
                  </span>
                ) : (
                  "Scegli questa agenzia"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white px-6 py-16 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-text-muted" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <h3 className="mb-2 text-lg font-medium text-primary-dark">
        Non hai ancora inserito un immobile.
      </h3>
      <p className="mb-6 max-w-sm text-sm text-text-muted">
        Inserisci il tuo immobile per iniziare a ricevere richieste da acquirenti interessati.
      </p>
      <Link
        href="/vendi"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Inserisci il tuo immobile
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function SellerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/dashboard/seller");
        if (!res.ok) throw new Error("Errore nel caricamento dei dati.");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Errore nel caricamento dei dati."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout role="seller">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark sm:text-3xl">
            La tua Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Monitora lo stato del tuo immobile e le attivit&agrave; in corso.
          </p>
        </div>

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-error/30 bg-error/5 p-5 text-center">
            <p className="text-sm font-medium text-error">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-primary underline hover:no-underline"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* Empty State */}
            {!data.property && <EmptyState />}

            {/* Property exists */}
            {data.property && (
              <>
                {/* Status Card */}
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-medium text-primary-dark">
                      {data.property.title}
                    </h2>
                    <p className="text-sm text-text-muted">{data.property.address}</p>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <ProgressBar currentStage={data.property.currentStage} />
                  </div>
                </div>

                {/* Stats Row */}
                <StatsGrid stats={data.stats} />

                {/* Agency: show chooser if no assignment, card if assigned */}
                {data.agency ? (
                  <AgencyCard agency={data.agency} />
                ) : data.property.slug ? (
                  <ZoneAgenciesList
                    propertySlug={data.property.slug}
                    onChosen={() => window.location.reload()}
                  />
                ) : (
                  <AgencyCard agency={null} />
                )}

                {/* Recent Activity + Upcoming Visits */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <RecentLeads leads={data.recentLeads} />
                  <UpcomingVisits visits={data.upcomingVisits} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
