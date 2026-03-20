"use client";

import { useState, useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { PLAN_LABELS } from "@/lib/zone-constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ZoneData {
  id: string;
  name: string;
  slug: string;
  zoneClass: string;
  region: string;
  province: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  municipalities: string[];
  marketScore: number;
  population: number;
  plan: string | null;
  price: number;
  slots: { taken: number; max: number };
}

export interface ZonePreference {
  zoneId: string;
  zoneName: string;
  zoneClass: string;
  plan?: string;
  priceMonthly?: number;
}

interface ZonePreferenceSelectorProps {
  province: string;
  selectedZones: ZonePreference[];
  onSelectionChange: (zones: ZonePreference[]) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Province capitals approximate coordinates for map centering
const PROVINCE_CENTERS: Record<string, { lat: number; lng: number }> = {
  TO: { lat: 45.07, lng: 7.69 }, MI: { lat: 45.46, lng: 9.19 }, RM: { lat: 41.90, lng: 12.50 },
  NA: { lat: 40.85, lng: 14.27 }, FI: { lat: 43.77, lng: 11.25 }, BO: { lat: 44.49, lng: 11.34 },
  GE: { lat: 44.41, lng: 8.93 }, PA: { lat: 38.12, lng: 13.36 }, BA: { lat: 41.13, lng: 16.87 },
  VE: { lat: 45.44, lng: 12.32 }, VR: { lat: 45.44, lng: 10.99 }, PD: { lat: 45.41, lng: 11.88 },
};

function getMarkerIcon(zone: ZoneData, isSelected: boolean): string {
  if (isSelected) return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  const { taken, max } = zone.slots;
  if (taken >= max) return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
  if (max - taken === 1) return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
  return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
}

const mapContainerStyle = { width: "100%", height: "400px", borderRadius: "12px" };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ZonePreferenceSelector({
  province,
  selectedZones,
  onSelectionChange,
}: ZonePreferenceSelectorProps) {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  // Fetch zones when province is a valid 2-letter code
  useEffect(() => {
    if (!province || province.length < 2) {
      setZones([]);
      return;
    }

    const normalised = province.trim().toUpperCase();
    if (normalised.length !== 2) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/zones?province=${normalised}`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nel caricamento zone");
        return res.json();
      })
      .then((data: ZoneData[]) => {
        if (!cancelled) {
          setZones(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Errore nel caricamento delle zone.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [province]);

  const isZoneSelected = useCallback(
    (zoneId: string) => selectedZones.some((z) => z.zoneId === zoneId),
    [selectedZones]
  );

  function toggleZone(zone: ZoneData) {
    if (isZoneSelected(zone.id)) {
      onSelectionChange(selectedZones.filter((z) => z.zoneId !== zone.id));
    } else {
      if (selectedZones.length >= 3) return;
      if (zone.slots.taken >= zone.slots.max) return;
      onSelectionChange([
        ...selectedZones,
        {
          zoneId: zone.id,
          zoneName: zone.name,
          zoneClass: zone.zoneClass,
          plan: zone.plan || undefined,
          priceMonthly: zone.price || undefined,
        },
      ]);
    }
    setActiveMarker(null);
  }

  // Don't render anything until province is entered
  if (!province || province.length < 2) return null;

  const normalised = province.trim().toUpperCase();
  const center = PROVINCE_CENTERS[normalised] || { lat: 42.5, lng: 12.5 };
  const zonesWithCoords = zones.filter((z) => z.lat && z.lng);
  const maxReached = selectedZones.length >= 3;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-text">
          Zone disponibili — {normalised}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Seleziona fino a 3 zone di interesse sulla mappa. I dettagli del piano verranno discussi dopo l&apos;approvazione.
        </p>
      </div>

      {loading && (
        <div className="h-[400px] animate-pulse rounded-xl bg-bg-soft flex items-center justify-center">
          <p className="text-sm text-text-muted">Caricamento mappa...</p>
        </div>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {!loading && !error && zones.length === 0 && province.length >= 2 && (
        <div className="rounded-xl border border-border bg-bg-soft p-6 text-center">
          <p className="text-sm text-text-muted">
            Nessuna zona attiva per la provincia <strong>{normalised}</strong>.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Puoi comunque inviare la richiesta e ti contatteremo quando saranno disponibili.
          </p>
        </div>
      )}

      {/* Map */}
      {!loading && zones.length > 0 && isLoaded && zonesWithCoords.length > 0 && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
            ],
          }}
        >
          {zonesWithCoords.map((zone) => (
            <MarkerF
              key={zone.id}
              position={{ lat: zone.lat!, lng: zone.lng! }}
              icon={getMarkerIcon(zone, isZoneSelected(zone.id))}
              onClick={() => setActiveMarker(zone.id)}
            >
              {activeMarker === zone.id && (
                <InfoWindowF
                  position={{ lat: zone.lat!, lng: zone.lng! }}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <div className="min-w-[200px] p-1">
                    <h4 className="font-semibold text-sm text-gray-900">{zone.name}</h4>
                    {zone.plan && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Piano {PLAN_LABELS[zone.plan] || zone.plan}
                      </p>
                    )}
                    {zone.price > 0 && (
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {formatPrice(zone.price)}/mese
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {zone.slots.max - zone.slots.taken} slot su {zone.slots.max} disponibili
                    </p>
                    {zone.population > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {zone.population.toLocaleString("it-IT")} abitanti
                      </p>
                    )}
                    {zone.slots.taken >= zone.slots.max ? (
                      <p className="mt-2 text-xs font-semibold text-red-600">Zona esaurita</p>
                    ) : isZoneSelected(zone.id) ? (
                      <button
                        type="button"
                        onClick={() => toggleZone(zone)}
                        className="mt-2 w-full rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Rimuovi
                      </button>
                    ) : maxReached ? (
                      <p className="mt-2 text-xs text-gray-400">Max 3 zone selezionate</p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleZone(zone)}
                        className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Seleziona zona
                      </button>
                    )}
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      )}

      {/* Fallback: list view for zones without coordinates */}
      {!loading && zones.length > 0 && (zonesWithCoords.length === 0 || !isLoaded) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {zones.map((zone) => {
            const selected = isZoneSelected(zone.id);
            const isFull = zone.slots.taken >= zone.slots.max;
            const disabled = (!selected && maxReached) || isFull;

            return (
              <button
                key={zone.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleZone(zone)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : isFull
                    ? "cursor-not-allowed border-border bg-bg-soft opacity-50"
                    : disabled
                    ? "cursor-not-allowed border-border bg-bg-soft opacity-50"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  selected ? "border-primary bg-primary" : "border-border bg-white"
                }`}>
                  {selected && (
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text">{zone.name}</p>
                  {zone.price > 0 && (
                    <p className="text-xs font-semibold text-primary mt-0.5">{formatPrice(zone.price)}/mese</p>
                  )}
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {zone.slots.max - zone.slots.taken}/{zone.slots.max} slot disponibili
                    {zone.population > 0 && ` · ${zone.population.toLocaleString("it-IT")} ab.`}
                  </p>
                  {isFull && <p className="text-[11px] font-semibold text-error mt-0.5">Esaurita</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {!loading && zones.length > 0 && (
        <div className="flex flex-wrap gap-4 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Disponibile
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Ultimo slot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Esaurita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Selezionata
          </span>
        </div>
      )}

      {/* Selection summary */}
      {selectedZones.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-medium text-primary-dark mb-2">
            Zone selezionate ({selectedZones.length}/3)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((z) => (
              <span
                key={z.zoneId}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-primary/20 px-3 py-1 text-xs"
              >
                <span className="font-medium text-text">{z.zoneName}</span>
                {z.priceMonthly && (
                  <span className="text-text-muted">{formatPrice(z.priceMonthly)}/mese</span>
                )}
                <button
                  type="button"
                  onClick={() => onSelectionChange(selectedZones.filter((s) => s.zoneId !== z.zoneId))}
                  className="ml-0.5 text-text-muted hover:text-error"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
