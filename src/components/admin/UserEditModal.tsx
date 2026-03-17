"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaved: () => void;
}

const ROLE_OPTIONS = [
  { value: "SELLER", label: "Venditore" },
  { value: "BUYER", label: "Acquirente" },
  { value: "AGENCY_ADMIN", label: "Admin Agenzia" },
  { value: "AGENCY_AGENT", label: "Agente" },
  { value: "ADMIN", label: "Amministratore" },
];

export default function UserEditModal({
  isOpen,
  onClose,
  user,
  onSaved,
}: UserEditModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "SELLER",
      });
      setError("");
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    <Modal isOpen={isOpen} onClose={onClose} title="Modifica Utente" size="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Nome</label>
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
          <div>
            <label className={labelClass}>Ruolo</label>
            <select className={inputClass} value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Read-only info */}
        {user && (
          <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-border">
            <p>Registrato il: {new Date(user.createdAt).toLocaleDateString("it-IT")}</p>
            {user._count?.properties > 0 && <p>Immobili: {user._count.properties}</p>}
            {user.agency?.name && <p>Agenzia: {user.agency.name}</p>}
          </div>
        )}

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
