"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface PropertyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onSaved: () => void;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bozza" },
  { value: "PENDING_REVIEW", label: "In Revisione" },
  { value: "PUBLISHED", label: "Pubblicato" },
  { value: "UNDER_CONTRACT", label: "In Trattativa" },
  { value: "SOLD", label: "Venduto" },
  { value: "WITHDRAWN", label: "Ritirato" },
];

const TYPE_OPTIONS = [
  { value: "APPARTAMENTO", label: "Appartamento" },
  { value: "VILLA", label: "Villa" },
  { value: "CASA_INDIPENDENTE", label: "Casa Indipendente" },
  { value: "ATTICO", label: "Attico" },
  { value: "MANSARDA", label: "Mansarda" },
  { value: "LOFT", label: "Loft" },
  { value: "TERRENO", label: "Terreno" },
  { value: "NEGOZIO", label: "Negozio" },
  { value: "UFFICIO", label: "Ufficio" },
];

const AMENITIES = [
  { key: "hasGarage", label: "Garage" },
  { key: "hasGarden", label: "Giardino" },
  { key: "hasBalcony", label: "Balcone" },
  { key: "hasElevator", label: "Ascensore" },
  { key: "hasParkingSpace", label: "Posto Auto" },
  { key: "hasCellar", label: "Cantina" },
  { key: "hasTerrace", label: "Terrazzo" },
  { key: "hasPool", label: "Piscina" },
  { key: "hasAirConditioning", label: "Aria Condizionata" },
  { key: "isFurnished", label: "Arredato" },
  { key: "hasConcierge", label: "Portineria" },
  { key: "hasAlarm", label: "Allarme" },
];

export default function PropertyEditModal({
  isOpen,
  onClose,
  property,
  onSaved,
}: PropertyEditModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || "",
        description: property.description || "",
        type: property.type || "APPARTAMENTO",
        status: property.status || "DRAFT",
        price: property.price || 0,
        surface: property.surface || 0,
        rooms: property.rooms || 0,
        bathrooms: property.bathrooms || 0,
        floor: property.floor || 0,
        totalFloors: property.totalFloors || 0,
        yearBuilt: property.yearBuilt || 0,
        condominiumFees: property.condominiumFees || 0,
        extraCosts: property.extraCosts || "",
        condition: property.condition || "",
        heatingType: property.heatingType || "",
        energyClass: property.energyClass || "",
        address: property.address || "",
        city: property.city || "",
        province: property.province || "",
        cap: property.cap || "",
        hasGarage: property.hasGarage || false,
        hasGarden: property.hasGarden || false,
        hasBalcony: property.hasBalcony || false,
        hasElevator: property.hasElevator || false,
        hasParkingSpace: property.hasParkingSpace || false,
        hasCellar: property.hasCellar || false,
        hasTerrace: property.hasTerrace || false,
        hasPool: property.hasPool || false,
        hasAirConditioning: property.hasAirConditioning || false,
        isFurnished: property.isFurnished || false,
        hasConcierge: property.hasConcierge || false,
        hasAlarm: property.hasAlarm || false,
      });
      setError("");
    }
  }, [property]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        type: form.type,
        status: form.status,
        price: Number(form.price),
        surface: Number(form.surface),
        rooms: Number(form.rooms),
        bathrooms: Number(form.bathrooms) || undefined,
        floor: Number(form.floor) || undefined,
        totalFloors: Number(form.totalFloors) || undefined,
        yearBuilt: Number(form.yearBuilt) || undefined,
        condominiumFees: Number(form.condominiumFees) || undefined,
        condition: form.condition || undefined,
        heatingType: form.heatingType || undefined,
        energyClass: form.energyClass || undefined,
        address: form.address,
        city: form.city,
        province: form.province,
        cap: form.cap,
      };

      // Add publishedAt when transitioning to PUBLISHED
      if (form.status === "PUBLISHED" && property.status !== "PUBLISHED") {
        payload.publishedAt = new Date().toISOString();
      }

      // Add all amenity booleans
      for (const a of AMENITIES) {
        payload[a.key] = form[a.key];
      }

      const res = await fetch(`/api/properties/${property.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <Modal isOpen={isOpen} onClose={onClose} title="Modifica Immobile" size="xl">
      <div className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>
        )}

        {/* Info base */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Informazioni Base</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>Titolo</label>
              <input className={inputClass} value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Descrizione</label>
              <textarea className={inputClass} rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tipologia</label>
              <select className={inputClass} value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Stato</label>
              <select className={inputClass} value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prezzo (EUR)</label>
              <input type="number" className={inputClass} value={form.price || ""} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Condizione</label>
              <input className={inputClass} value={form.condition || ""} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Dettagli */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Dettagli</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Superficie (m2)</label>
              <input type="number" className={inputClass} value={form.surface || ""} onChange={(e) => setForm({ ...form, surface: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Locali</label>
              <input type="number" className={inputClass} value={form.rooms || ""} onChange={(e) => setForm({ ...form, rooms: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Bagni</label>
              <input type="number" className={inputClass} value={form.bathrooms || ""} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Piano</label>
              <input type="number" className={inputClass} value={form.floor || ""} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Piani Totali</label>
              <input type="number" className={inputClass} value={form.totalFloors || ""} onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Anno Costruzione</label>
              <input type="number" className={inputClass} value={form.yearBuilt || ""} onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Spese Condominiali</label>
              <input type="number" className={inputClass} value={form.condominiumFees || ""} onChange={(e) => setForm({ ...form, condominiumFees: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Classe Energetica</label>
              <input className={inputClass} value={form.energyClass || ""} onChange={(e) => setForm({ ...form, energyClass: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Riscaldamento</label>
              <input className={inputClass} value={form.heatingType || ""} onChange={(e) => setForm({ ...form, heatingType: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Costi Extra</label>
              <input className={inputClass} value={form.extraCosts || ""} onChange={(e) => setForm({ ...form, extraCosts: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Caratteristiche */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Caratteristiche</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {AMENITIES.map((a) => (
              <label key={a.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[a.key] || false}
                  onChange={(e) => setForm({ ...form, [a.key]: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary/30"
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        {/* Posizione */}
        <div>
          <h3 className="text-sm font-semibold text-primary-dark mb-3">Posizione</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
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
            <div>
              <label className={labelClass}>CAP</label>
              <input className={inputClass} value={form.cap || ""} onChange={(e) => setForm({ ...form, cap: e.target.value })} />
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
