"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GoogleMap, useLoadScript, CircleF, InfoWindowF } from "@react-google-maps/api";
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

/** Calculate circle radius from population. Returns meters.
 *  Peripheral/small towns get larger radii to cover nearby empty areas.
 *  Population thresholds:
 *    < 5,000    → 5–6 km  (covers surrounding rural area)
 *    5–15,000   → 4–6 km  (small towns)
 *    15–50,000  → 5–8 km  (medium towns)
 *    > 50,000   → 6–10 km (cities)
 */
function getZoneRadius(population: number): number {
  if (population <= 0) return 5000;
  if (population < 5000) {
    // Very small towns: 5–6 km to fill gaps between scattered municipalities
    return 5000 + Math.sqrt(population) * 15;
  }
  if (population < 15000) {
    // Small towns: 4–6 km
    return 4000 + Math.sqrt(population) * 16;
  }
  if (population < 50000) {
    // Medium towns: 5–8 km
    return 5000 + Math.sqrt(population) * 14;
  }
  // Cities: 6–10 km
  const base = Math.sqrt(population) * 12;
  return Math.min(10000, Math.max(6000, base));
}

/** Province capitals approximate coordinates for map centering */
const PROVINCE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  TO: { lat: 45.07, lng: 7.69, zoom: 10 }, MI: { lat: 45.46, lng: 9.19, zoom: 10 },
  RM: { lat: 41.90, lng: 12.50, zoom: 10 }, NA: { lat: 40.85, lng: 14.27, zoom: 10 },
  FI: { lat: 43.77, lng: 11.25, zoom: 11 }, BO: { lat: 44.49, lng: 11.34, zoom: 10 },
  GE: { lat: 44.41, lng: 8.93, zoom: 11 }, PA: { lat: 38.12, lng: 13.36, zoom: 10 },
  BA: { lat: 41.13, lng: 16.87, zoom: 10 }, VE: { lat: 45.44, lng: 12.32, zoom: 10 },
  VR: { lat: 45.44, lng: 10.99, zoom: 11 }, PD: { lat: 45.41, lng: 11.88, zoom: 11 },
  BS: { lat: 45.54, lng: 10.22, zoom: 10 }, CT: { lat: 37.50, lng: 15.09, zoom: 11 },
  BG: { lat: 45.70, lng: 9.67, zoom: 11 }, SA: { lat: 40.68, lng: 14.77, zoom: 11 },
};

type ZoneStatus = "available" | "lastSlot" | "full" | "selected";

function getZoneStatus(zone: ZoneData, isSelected: boolean): ZoneStatus {
  if (isSelected) return "selected";
  const { taken, max } = zone.slots;
  if (taken >= max) return "full";
  if (max - taken === 1) return "lastSlot";
  return "available";
}

const ZONE_COLORS: Record<ZoneStatus, { fill: string; stroke: string }> = {
  available: { fill: "#22c55e40", stroke: "#22c55e" },   // green
  lastSlot:  { fill: "#f9731640", stroke: "#f97316" },   // orange
  full:      { fill: "#ef444430", stroke: "#ef4444" },   // red
  selected:  { fill: "#3b82f650", stroke: "#3b82f6" },   // blue
};

const mapContainerStyle = { width: "100%", height: "450px", borderRadius: "12px" };

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
  const [activeZone, setActiveZone] = useState<ZoneData | null>(null);

  const { isLoaded, loadError } = useLoadScript({
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

  const normalised = province ? province.trim().toUpperCase() : "";
  const provCenter = PROVINCE_CENTERS[normalised] || { lat: 42.5, lng: 12.5, zoom: 9 };
  const zonesWithCoords = zones.filter((z) => z.lat && z.lng);
  const maxReached = selectedZones.length >= 3;

  const mapRef = useRef<google.maps.Map | null>(null);

  // Auto-center on zones if available (must be before early return — Rules of Hooks)
  const center = useMemo(() => {
    if (zonesWithCoords.length === 0) return { lat: provCenter.lat, lng: provCenter.lng };
    const avgLat = zonesWithCoords.reduce((s, z) => s + z.lat!, 0) / zonesWithCoords.length;
    const avgLng = zonesWithCoords.reduce((s, z) => s + z.lng!, 0) / zonesWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [zonesWithCoords.length, provCenter.lat, provCenter.lng, zones]);

  // Fit map bounds to all zones so there's no wasted space
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (zonesWithCoords.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      zonesWithCoords.forEach((z) => bounds.extend({ lat: z.lat!, lng: z.lng! }));
      map.fitBounds(bounds, 40); // 40px padding
    }
  }, [zonesWithCoords]);

  // Re-fit bounds when zones change
  useEffect(() => {
    if (mapRef.current && zonesWithCoords.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      zonesWithCoords.forEach((z) => bounds.extend({ lat: z.lat!, lng: z.lng! }));
      mapRef.current.fitBounds(bounds, 40);
    }
  }, [zonesWithCoords]);

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
    setActiveZone(null);
  }

  // Don't render anything until province is entered
  if (!province || province.length < 2) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-text">
          Zone disponibili — {normalised}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Clicca su una zona per vedere i dettagli e selezionarla (max 3).
        </p>
      </div>

      {loading && (
        <div className="h-[450px] animate-pulse rounded-xl bg-bg-soft flex items-center justify-center">
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

      {/* Map with zone circles */}
      {!loading && zones.length > 0 && isLoaded && !loadError && zonesWithCoords.length > 0 && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zonesWithCoords.length > 1 ? undefined : provCenter.zoom}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
            ],
          }}
          onClick={() => setActiveZone(null)}
        >
          {zonesWithCoords.map((zone) => {
            const selected = isZoneSelected(zone.id);
            const status = getZoneStatus(zone, selected);
            const colors = ZONE_COLORS[status];
            const radius = getZoneRadius(zone.population);

            return (
              <CircleF
                key={zone.id}
                center={{ lat: zone.lat!, lng: zone.lng! }}
                radius={radius}
                options={{
                  fillColor: colors.fill.slice(0, 7),
                  fillOpacity: status === "selected" ? 0.4 : status === "full" ? 0.15 : 0.25,
                  strokeColor: colors.stroke,
                  strokeWeight: status === "selected" ? 3 : 2,
                  strokeOpacity: 0.9,
                  clickable: true,
                  zIndex: status === "selected" ? 10 : status === "full" ? 1 : 5,
                }}
                onClick={() => setActiveZone(zone)}
              />
            );
          })}

          {/* Info window for active zone */}
          {activeZone && activeZone.lat && activeZone.lng && (
            <InfoWindowF
              position={{ lat: activeZone.lat, lng: activeZone.lng }}
              onCloseClick={() => setActiveZone(null)}
            >
              <div className="min-w-[220px] p-1">
                <h4 className="font-semibold text-sm text-gray-900">{activeZone.name}</h4>
                {activeZone.plan && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Piano {PLAN_LABELS[activeZone.plan] || activeZone.plan}
                  </p>
                )}
                {activeZone.price > 0 && (
                  <p className="text-base font-bold text-blue-600 mt-1.5">
                    {formatPrice(activeZone.price)}/mese
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    activeZone.slots.taken >= activeZone.slots.max ? "bg-red-500" :
                    activeZone.slots.max - activeZone.slots.taken === 1 ? "bg-orange-500" : "bg-green-500"
                  }`} />
                  <span className="text-xs text-gray-600">
                    {activeZone.slots.max - activeZone.slots.taken} di {activeZone.slots.max} slot disponibili
                  </span>
                </div>
                {activeZone.population > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {activeZone.population.toLocaleString("it-IT")} abitanti
                  </p>
                )}

                {/* Action button */}
                <div className="mt-3">
                  {activeZone.slots.taken >= activeZone.slots.max ? (
                    <p className="text-xs font-semibold text-red-600 text-center py-1">Zona esaurita</p>
                  ) : isZoneSelected(activeZone.id) ? (
                    <button
                      type="button"
                      onClick={() => toggleZone(activeZone)}
                      className="w-full rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Rimuovi dalla selezione
                    </button>
                  ) : maxReached ? (
                    <p className="text-xs text-gray-400 text-center py-1">Hai già selezionato 3 zone</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleZone(activeZone)}
                      className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Seleziona questa zona
                    </button>
                  )}
                </div>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      )}

      {/* Fallback: list view for zones without coordinates or if maps not loaded */}
      {!loading && zones.length > 0 && (zonesWithCoords.length === 0 || !isLoaded || loadError) && (
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
                    {zone.slots.max - zone.slots.taken}/{zone.slots.max} slot
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
            <span className="h-3 w-3 rounded-full bg-green-500/30 border border-green-500" /> Disponibile
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-orange-500/30 border border-orange-500" /> Ultimo slot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500" /> Esaurita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500/40 border-2 border-blue-500" /> Selezionata
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
