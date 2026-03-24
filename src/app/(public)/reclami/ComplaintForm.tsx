"use client";

import { useState } from "react";

export default function ComplaintForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    userType: "",
    subject: "",
    description: "",
    privacyConsent: false,
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: "success"; referenceNumber: string } | { type: "error" } | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    setErrors({});

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ type: "success", referenceNumber: data.referenceNumber });
        setForm({ name: "", email: "", userType: "", subject: "", description: "", privacyConsent: false });
      } else {
        if (data.details) setErrors(data.details);
        setResult({ type: "error" });
      }
    } catch {
      setResult({ type: "error" });
    } finally {
      setSending(false);
    }
  }

  if (result?.type === "success") {
    return (
      <div className="bg-white rounded-xl p-8 border border-border flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-medium text-primary-dark text-lg mb-2">Reclamo inviato con successo</h3>
        <p className="text-text-muted text-sm mb-4">
          Il tuo reclamo è stato registrato. Riceverai una conferma via email.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 mb-4">
          <p className="text-sm text-text-muted mb-1">Il tuo numero di riferimento</p>
          <p className="text-2xl font-bold text-primary">{result.referenceNumber}</p>
        </div>
        <p className="text-text-muted text-xs max-w-md">
          Conserva questo codice per ogni futura comunicazione relativa al tuo reclamo.
          Riceverai una presa in carico entro 48 ore e una risposta definitiva entro 30 giorni.
        </p>
        <button
          onClick={() => setResult(null)}
          className="mt-6 text-primary font-medium text-sm hover:underline"
        >
          Invia un altro reclamo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-border">
      <h3 className="font-medium text-primary-dark text-lg mb-1">Modulo di reclamo</h3>
      <p className="text-text-muted text-sm mb-6">
        Compila tutti i campi per inviare il tuo reclamo. Tutti i campi sono obbligatori.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Nome e cognome</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Mario Rossi"
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@esempio.it"
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {errors.email && <p className="text-error text-xs mt-1">{errors.email[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Tipo di utente</label>
          <select
            required
            value={form.userType}
            onChange={(e) => setForm({ ...form, userType: e.target.value })}
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="">Seleziona il tuo ruolo</option>
            <option value="venditore">Venditore</option>
            <option value="agenzia">Agenzia immobiliare</option>
            <option value="acquirente">Acquirente</option>
          </select>
          {errors.userType && <p className="text-error text-xs mt-1">{errors.userType[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Oggetto del reclamo</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Descrivi brevemente il problema"
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          {errors.subject && <p className="text-error text-xs mt-1">{errors.subject[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Descrizione dettagliata</label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrivi in dettaglio il problema riscontrato, includendo date, riferimenti e ogni informazione utile alla valutazione del reclamo..."
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <p className="text-text-muted text-xs mt-1">{form.description.length}/5000 caratteri (minimo 20)</p>
          {errors.description && <p className="text-error text-xs mt-1">{errors.description[0]}</p>}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="privacyConsent"
            checked={form.privacyConsent}
            onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          <label htmlFor="privacyConsent" className="text-sm text-text-muted">
            Ho letto e accetto l&apos;
            <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
              informativa sulla privacy
            </a>
            {" "}e autorizzo il trattamento dei miei dati personali ai fini della gestione del presente reclamo.
          </label>
        </div>
        {errors.privacyConsent && <p className="text-error text-xs">{errors.privacyConsent[0]}</p>}

        {result?.type === "error" && (
          <p className="text-error text-sm">
            Errore nell&apos;invio del reclamo. Riprova o scrivi a{" "}
            <a href="mailto:reclami@privatio.it" className="underline">reclami@privatio.it</a>
          </p>
        )}

        <button
          type="submit"
          disabled={sending || !form.privacyConsent}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Invio in corso..." : "Invia reclamo"}
        </button>
      </form>
    </div>
  );
}
