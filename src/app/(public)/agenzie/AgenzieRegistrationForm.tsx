"use client";

import { useState } from "react";
import ZonePreferenceSelector, {
  type ZonePreference,
} from "@/components/agency/ZonePreferenceSelector";

export default function AgenzieRegistrationForm() {
  const [form, setForm] = useState({
    agencyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    agentCount: "",
    message: "",
  });
  const [preferredZones, setPreferredZones] = useState<ZonePreference[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          agentCount: form.agentCount ? parseInt(form.agentCount) : undefined,
          preferredZones: preferredZones.length > 0 ? preferredZones : undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Errore durante l'invio.");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg className="h-8 w-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-primary-dark">Sei in lista!</h3>
        <p className="mt-2 text-text-muted">
          La tua richiesta &egrave; stata ricevuta. Ti contatteremo per riservare la tua zona.
        </p>
        {preferredZones.length > 0 && (
          <p className="mt-2 text-sm text-text-muted">
            Hai indicato <strong>{preferredZones.length} {preferredZones.length === 1 ? "zona" : "zone"}</strong> di interesse.
            Verranno riservate per te all&apos;apertura delle iscrizioni.
          </p>
        )}
        <p className="mt-3 text-sm text-text-muted">
          Riceverai una <strong>email di conferma</strong> all&apos;indirizzo indicato.
          Quando apriremo le iscrizioni nella tua zona, sarai tra i primi a essere contattato.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Tempi di risposta: entro 24 ore lavorative.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-white p-8 shadow-sm">
      {error && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Nome agenzia *</label>
          <input type="text" required value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Nome e cognome *</label>
          <input type="text" required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Telefono *</label>
          <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
      </div>

      {/* Indirizzo sede */}
      <div>
        <label className="mb-1 block text-sm font-medium text-text">Indirizzo sede</label>
        <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Via Roma 1"
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Città *</label>
          <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Provincia *</label>
          <input type="text" required maxLength={2} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value.toUpperCase() })}
            placeholder="MI"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">N. agenti</label>
          <input type="number" min={1} value={form.agentCount} onChange={(e) => setForm({ ...form, agentCount: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
      </div>

      {/* Zone preference selector — appears when province is filled */}
      <ZonePreferenceSelector
        province={form.province}
        selectedZones={preferredZones}
        onSelectionChange={setPreferredZones}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-text">Messaggio</label>
        <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/85 disabled:opacity-50">
        {submitting ? "Invio in corso..." : "Entra in lista d'attesa"}
      </button>
    </form>
  );
}
