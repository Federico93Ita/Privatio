"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface AgencyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  agency: any;
  onSaved: () => void;
}

const PLAN_OPTIONS = [
  { value: "BASE", label: "Zona Base" },
  { value: "URBANA", label: "Zona Urbana" },
  { value: "PREMIUM", label: "Zona Premium" },
];

export default function AgencyEditModal({
  isOpen,
  onClose,
  agency,
  onSaved,
}: AgencyEditModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agency) {
      setForm({
        name: agency.name || "",
        email: agency.email || "",
        phone: agency.phone || "",
        address: agency.address || "",
        city: agency.city || "",
        province: agency.province || "",
        plan: agency.plan || "BASE",
        isActive: agency.isActive ?? false,
        coverageRadius: agency.coverageRadius || 0,
        description: agency.description || "",
        ragioneSociale: agency.ragioneSociale || "",
        partitaIva: agency.partitaIva || "",
        codiceFiscale: agency.codiceFiscale || "",
        pec: agency.pec || "",
        codiceSdi: agency.codiceSdi || "",
      });
      setError("");
    }
  }, [agency]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/agencies/${agency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coverageRadius: Number(form.coverageRadius) || null,
        }),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Errore durante il salvataggio");
      }
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const labelClass = "block text-xs font-medium text-text-muted mb-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifica Agenzia" size="lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>
        )}

        {/* Info */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Informazioni</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>Nome Agenzia</label>
              <input className={inputClass} value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Telefono</label>
              <input className={inputClass} value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Indirizzo</label>
              <input className={inputClass} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Città</label>
              <input className={inputClass} value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Provincia</label>
              <input className={inputClass} value={form.province || ""} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Fatturazione */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Fatturazione</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>Ragione Sociale</label>
              <input className={inputClass} value={form.ragioneSociale || ""} onChange={(e) => setForm({ ...form, ragioneSociale: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Partita IVA</label>
              <input className={inputClass} value={form.partitaIva || ""} onChange={(e) => setForm({ ...form, partitaIva: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Codice Fiscale</label>
              <input className={inputClass} value={form.codiceFiscale || ""} onChange={(e) => setForm({ ...form, codiceFiscale: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>PEC</label>
              <input className={inputClass} value={form.pec || ""} onChange={(e) => setForm({ ...form, pec: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Codice SDI</label>
              <input className={inputClass} value={form.codiceSdi || ""} onChange={(e) => setForm({ ...form, codiceSdi: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Piattaforma */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Piattaforma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Piano</label>
              <select className={inputClass} value={form.plan || ""} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                {PLAN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Raggio Copertura (km)</label>
              <input type="number" className={inputClass} value={form.coverageRadius || ""} onChange={(e) => setForm({ ...form, coverageRadius: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Descrizione</label>
              <textarea className={inputClass} rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive || false}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary/30"
                />
                Agenzia Attiva
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text rounded-lg border border-border hover:bg-bg-soft transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/85 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salva Modifiche"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
