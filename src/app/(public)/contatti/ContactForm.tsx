"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setResult("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        if (data.details) setErrors(data.details);
        setResult("error");
      }
    } catch {
      setResult("error");
    } finally {
      setSending(false);
    }
  }

  if (result === "success") {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-[#0a1f44] text-lg mb-2">Messaggio inviato!</h3>
        <p className="text-[#64748b] text-sm">Ti risponderemo il prima possibile, generalmente entro 24 ore.</p>
        <button
          onClick={() => setResult(null)}
          className="mt-6 text-[#0e8ff1] font-medium text-sm hover:underline"
        >
          Invia un altro messaggio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
      <h3 className="font-semibold text-[#0a1f44] mb-4">Scrivici un messaggio</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-1">Nome</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Il tuo nome"
            className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@esempio.it"
            className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-1">Oggetto</label>
          <select
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
          >
            <option value="">Seleziona</option>
            <option value="vendita">Voglio vendere casa</option>
            <option value="acquisto">Cerco un immobile</option>
            <option value="agenzia">Partnership agenzia</option>
            <option value="altro">Altro</option>
          </select>
          {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1e293b] mb-1">Messaggio</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Scrivi il tuo messaggio..."
            className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1] resize-none"
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message[0]}</p>}
        </div>

        {result === "error" && (
          <p className="text-red-500 text-sm">Errore nell&apos;invio. Riprova o scrivi a info@privatio.it</p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 bg-[#0e8ff1] text-white rounded-lg font-semibold hover:bg-[#0a1f44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Invio in corso..." : "Invia messaggio"}
        </button>
      </form>
    </div>
  );
}
