"use client";

import { useState } from "react";

export default function AgenzieRegistrationForm() {
  const [form, setForm] = useState({
    agencyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    province: "",
    agentCount: "",
    message: "",
  });
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
        <h3 className="text-xl font-medium text-primary-dark">Richiesta inviata!</h3>
        <p className="mt-2 text-text-muted">Ti contatteremo entro 24 ore lavorative per procedere con l&apos;attivazione.</p>
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

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Città *</label>
          <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Provincia *</label>
          <input type="text" required maxLength={2} value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value.toUpperCase() })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">N. agenti</label>
          <input type="number" min={1} value={form.agentCount} onChange={(e) => setForm({ ...form, agentCount: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text">Messaggio</label>
        <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary/85 disabled:opacity-50">
        {submitting ? "Invio in corso..." : "Invia richiesta"}
      </button>
    </form>
  );
}
