"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { trackLeadSubmit } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyContactFormProps {
  slug: string;
}

type Tab = "info" | "visit";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PropertyContactForm({ slug }: PropertyContactFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  /* ---- Info form state ---- */
  const [infoName, setInfoName] = useState("");
  const [infoEmail, setInfoEmail] = useState("");
  const [infoPhone, setInfoPhone] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  /* ---- Visit form state ---- */
  const [visitName, setVisitName] = useState("");
  const [visitEmail, setVisitEmail] = useState("");
  const [visitPhone, setVisitPhone] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitNotes, setVisitNotes] = useState("");

  /* ---- Shared state ---- */
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---- Styles ---- */
  const inputClass = cn(
    "w-full rounded-lg border border-border px-3 py-2.5 text-sm",
    "focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary",
    "transition-colors bg-white"
  );

  const labelClass = "block text-sm font-medium text-text mb-1";

  /* ---- Handlers ---- */
  const resetMessages = () => {
    setSuccess(null);
    setError(null);
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch(`/api/properties/${slug}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: infoName,
          email: infoEmail,
          phone: infoPhone || undefined,
          message: infoMessage || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante l'invio");
      }

      setSuccess("Richiesta inviata con successo! Ti contatteremo al più presto.");
      trackLeadSubmit(slug, "info_request");
      setInfoName("");
      setInfoEmail("");
      setInfoPhone("");
      setInfoMessage("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore durante l'invio. Riprova.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch(`/api/properties/${slug}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: visitName,
          buyerEmail: visitEmail,
          buyerPhone: visitPhone,
          scheduledAt: visitDate,
          notes: visitNotes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante la prenotazione");
      }

      setSuccess("Visita prenotata con successo! Riceverai una conferma via email.");
      trackLeadSubmit(slug, "visit_request");
      setVisitName("");
      setVisitEmail("");
      setVisitPhone("");
      setVisitDate("");
      setVisitNotes("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore durante la prenotazione. Riprova.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    resetMessages();
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* ---- Tabs ---- */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => handleTabChange("info")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors text-center",
            activeTab === "info"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-text-muted hover:text-text hover:bg-bg-soft"
          )}
        >
          Richiedi Informazioni
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("visit")}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors text-center",
            activeTab === "visit"
              ? "text-primary border-b-2 border-primary bg-primary/5"
              : "text-text-muted hover:text-text hover:bg-bg-soft"
          )}
        >
          Prenota Visita
        </button>
      </div>

      <div className="p-5">
        {/* ---- Success message ---- */}
        {success && (
          <div className="mb-4 rounded-lg bg-success/5 border border-success/20 p-3 text-sm text-success flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* ---- Error message ---- */}
        {error && (
          <div className="mb-4 rounded-lg bg-error/5 border border-error/20 p-3 text-sm text-error flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* ---- Tab 1: Info request form ---- */}
        {activeTab === "info" && (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label htmlFor="info-name" className={labelClass}>
                Nome *
              </label>
              <input
                id="info-name"
                type="text"
                required
                value={infoName}
                onChange={(e) => setInfoName(e.target.value)}
                placeholder="Il tuo nome"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="info-email" className={labelClass}>
                Email *
              </label>
              <input
                id="info-email"
                type="email"
                required
                value={infoEmail}
                onChange={(e) => setInfoEmail(e.target.value)}
                placeholder="la.tua@email.it"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="info-phone" className={labelClass}>
                Telefono
              </label>
              <input
                id="info-phone"
                type="tel"
                value={infoPhone}
                onChange={(e) => setInfoPhone(e.target.value)}
                placeholder="+39 123 456 7890"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="info-message" className={labelClass}>
                Messaggio
              </label>
              <textarea
                id="info-message"
                rows={3}
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                placeholder="Scrivi la tua richiesta..."
                className={cn(inputClass, "resize-none")}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white",
                "hover:bg-primary/85 transition-colors shadow-sm",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Invio in corso..." : "Invia richiesta"}
            </button>
          </form>
        )}

        {/* ---- Tab 2: Visit booking form ---- */}
        {activeTab === "visit" && (
          <form onSubmit={handleVisitSubmit} className="space-y-4">
            <div>
              <label htmlFor="visit-name" className={labelClass}>
                Nome *
              </label>
              <input
                id="visit-name"
                type="text"
                required
                value={visitName}
                onChange={(e) => setVisitName(e.target.value)}
                placeholder="Il tuo nome"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="visit-email" className={labelClass}>
                Email *
              </label>
              <input
                id="visit-email"
                type="email"
                required
                value={visitEmail}
                onChange={(e) => setVisitEmail(e.target.value)}
                placeholder="la.tua@email.it"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="visit-phone" className={labelClass}>
                Telefono *
              </label>
              <input
                id="visit-phone"
                type="tel"
                required
                value={visitPhone}
                onChange={(e) => setVisitPhone(e.target.value)}
                placeholder="+39 123 456 7890"
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="visit-date" className={labelClass}>
                Data e ora preferita *
              </label>
              <input
                id="visit-date"
                type="datetime-local"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className={inputClass}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="visit-notes" className={labelClass}>
                Note
              </label>
              <textarea
                id="visit-notes"
                rows={2}
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Eventuali preferenze o domande..."
                className={cn(inputClass, "resize-none")}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white",
                "hover:bg-accent/85 transition-colors shadow-sm",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Prenotazione in corso..." : "Prenota visita"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
