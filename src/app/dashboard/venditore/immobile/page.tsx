"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice, getPropertyTypeLabel, getStatusLabel } from "@/lib/utils";

const ENERGY_CLASSES = ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G"];

export default function SellerPropertyEditPage() {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Editable fields
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [rooms, setRooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [surface, setSurface] = useState(0);
  const [floor, setFloor] = useState<number | null>(null);
  const [totalFloors, setTotalFloors] = useState<number | null>(null);
  const [hasGarage, setHasGarage] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [energyClass, setEnergyClass] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/seller/property")
      .then((r) => r.json())
      .then((data) => {
        if (data.property) {
          const p = data.property;
          setProperty(p);
          setPrice(p.price);
          setDescription(p.description || "");
          setRooms(p.rooms);
          setBathrooms(p.bathrooms);
          setSurface(p.surface);
          setFloor(p.floor);
          setTotalFloors(p.totalFloors);
          setHasGarage(p.hasGarage);
          setHasGarden(p.hasGarden);
          setHasBalcony(p.hasBalcony);
          setHasElevator(p.hasElevator);
          setEnergyClass(p.energyClass);
        }
      })
      .catch(() => setError("Errore nel caricamento dell'immobile. Riprova."))
      .finally(() => setLoading(false));
  }, []);

  const isPublished = property && ["PUBLISHED", "UNDER_CONTRACT"].includes(property.status);
  const isReadOnly = property && ["SOLD", "WITHDRAWN"].includes(property.status);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const body: Record<string, unknown> = { price, description };
      if (!isPublished) {
        Object.assign(body, {
          rooms,
          bathrooms,
          surface,
          floor,
          totalFloors,
          hasGarage,
          hasGarden,
          hasBalcony,
          hasElevator,
          energyClass,
        });
      }

      const res = await fetch("/api/dashboard/seller/property", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setProperty(data.property);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Errore nel salvataggio");
      }
    } catch {
      setError("Errore di connessione");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="seller">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-bg-soft rounded-lg animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout role="seller">
        <div className="bg-white rounded-xl p-8 border border-border text-center">
          <h2 className="text-lg font-medium text-primary-dark mb-2">Nessun immobile</h2>
          <p className="text-text-muted mb-4">Non hai ancora inserito un immobile.</p>
          <Link href="/vendi" className="text-primary hover:underline font-medium">
            Inserisci il tuo immobile
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/venditore" className="text-sm text-primary hover:underline mb-2 inline-block">
              &larr; Torna alla Dashboard
            </Link>
            <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Modifica Immobile</h1>
            <p className="text-text-muted text-sm mt-1">
              {property.title} — {getStatusLabel(property.status)}
            </p>
          </div>
        </div>

        {isPublished && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm text-accent">
            L&apos;immobile e pubblicato. Puoi modificare solo prezzo e descrizione.
          </div>
        )}

        {isReadOnly && (
          <div className="bg-text-muted/10 border border-text-muted/30 rounded-xl p-4 text-sm text-text-muted">
            L&apos;immobile e in stato {getStatusLabel(property.status).toLowerCase()} e non puo essere modificato.
          </div>
        )}

        {/* Photos */}
        {property.photos?.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-border">
            <h3 className="font-medium text-primary-dark mb-3">Foto ({property.photos.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {property.photos.map((photo: any, i: number) => (
                <div key={photo.id || i} className="aspect-square rounded-lg overflow-hidden bg-bg-soft">
                  <img src={photo.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info base */}
        <div className="bg-white rounded-xl p-5 border border-border space-y-4">
          <h3 className="font-medium text-primary-dark">Informazioni</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Tipologia</span>
              <p className="font-medium text-primary-dark">{getPropertyTypeLabel(property.type)}</p>
            </div>
            <div>
              <span className="text-text-muted">Indirizzo</span>
              <p className="font-medium text-primary-dark">{property.address}, {property.city}</p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        {!isReadOnly && (
          <div className="bg-white rounded-xl p-5 border border-border space-y-4">
            <h3 className="font-medium text-primary-dark">Dettagli modificabili</h3>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Prezzo (EUR)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Descrizione</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>

            {!isPublished && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Locali</label>
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Bagni</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Superficie (m&sup2;)</label>
                    <input
                      type="number"
                      value={surface}
                      onChange={(e) => setSurface(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Piano</label>
                    <input
                      type="number"
                      value={floor ?? ""}
                      onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Piani totali</label>
                    <input
                      type="number"
                      value={totalFloors ?? ""}
                      onChange={(e) => setTotalFloors(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Classe energetica</label>
                    <select
                      value={energyClass || ""}
                      onChange={(e) => setEnergyClass(e.target.value || null)}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                    >
                      <option value="">Non specificata</option>
                      {ENERGY_CLASSES.map((ec) => (
                        <option key={ec} value={ec}>{ec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Garage", value: hasGarage, setter: setHasGarage },
                    { label: "Giardino", value: hasGarden, setter: setHasGarden },
                    { label: "Balcone", value: hasBalcony, setter: setHasBalcony },
                    { label: "Ascensore", value: hasElevator, setter: setHasElevator },
                  ].map((feat) => (
                    <label key={feat.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feat.value}
                        onChange={(e) => feat.setter(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      <span className="text-sm text-text">{feat.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {error && <p className="text-sm text-error">{error}</p>}
            {saved && <p className="text-sm text-success">Modifiche salvate con successo!</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary-dark transition-colors"
            >
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
