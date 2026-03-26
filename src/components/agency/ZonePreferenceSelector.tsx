"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import {
  ZONE_TIER_SHORT,
  ZONE_MAP_COLORS,
  ZONE_TIER_COLORS,
} from "@/lib/zone-constants";

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
  monthlyPrice: number;
  maxAgencies: number;
  currentAgencies: number;
  // Legacy compat
  plan?: string | null;
  price?: number;
  slots?: { taken: number; max: number };
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

function getPrice(zone: ZoneData): number {
  return zone.monthlyPrice || zone.price || 0;
}

function getSlots(zone: ZoneData): { taken: number; max: number } {
  if (zone.slots) return zone.slots;
  return { taken: zone.currentAgencies || 0, max: zone.maxAgencies || 3 };
}

/** Province capitals approximate coordinates for map centering */
const PROVINCE_CENTERS: Record<
  string,
  { lat: number; lng: number; zoom: number }
> = {
  TO: { lat: 45.07, lng: 7.69, zoom: 10 },
  MI: { lat: 45.46, lng: 9.19, zoom: 10 },
  RM: { lat: 41.9, lng: 12.5, zoom: 10 },
  NA: { lat: 40.85, lng: 14.27, zoom: 10 },
  FI: { lat: 43.77, lng: 11.25, zoom: 11 },
  BO: { lat: 44.49, lng: 11.34, zoom: 10 },
  GE: { lat: 44.41, lng: 8.93, zoom: 11 },
  PA: { lat: 38.12, lng: 13.36, zoom: 10 },
  BA: { lat: 41.13, lng: 16.87, zoom: 10 },
  VE: { lat: 45.44, lng: 12.32, zoom: 10 },
  VR: { lat: 45.44, lng: 10.99, zoom: 11 },
  PD: { lat: 45.41, lng: 11.88, zoom: 11 },
  BS: { lat: 45.54, lng: 10.22, zoom: 10 },
  CT: { lat: 37.5, lng: 15.09, zoom: 11 },
  BG: { lat: 45.7, lng: 9.67, zoom: 11 },
  SA: { lat: 40.68, lng: 14.77, zoom: 11 },
  AT: { lat: 44.9, lng: 8.21, zoom: 11 },
  AL: { lat: 44.91, lng: 8.61, zoom: 10 },
  CN: { lat: 44.39, lng: 7.55, zoom: 10 },
  NO: { lat: 45.45, lng: 8.62, zoom: 11 },
  BI: { lat: 45.56, lng: 8.05, zoom: 11 },
  VC: { lat: 45.32, lng: 8.42, zoom: 11 },
  VB: { lat: 45.92, lng: 8.55, zoom: 11 },
};

/** Tier ordering for display: PREMIUM first, then URBANA, then BASE */
const TIER_ORDER: Record<string, number> = {
  PREMIUM: 0,
  URBANA: 1,
  BASE: 2,
};

const TIER_CONFIG: Record<
  string,
  { label: string; icon: string; gradient: string; textColor: string; bgColor: string; borderColor: string }
> = {
  PREMIUM: {
    label: "Zone Premium",
    icon: "★",
    gradient: "from-rose-500 to-pink-400",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  URBANA: {
    label: "Zone Urbane",
    icon: "◆",
    gradient: "from-cyan-500 to-teal-400",
    textColor: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  BASE: {
    label: "Zone Base",
    icon: "●",
    gradient: "from-indigo-500 to-violet-400",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
};

/** Create SVG data URL for colored map markers */
function createMarkerIcon(
  zoneClass: string,
  isSelected: boolean,
  isHovered: boolean
): string {
  const colors = ZONE_MAP_COLORS[zoneClass] || {
    fill: "#6366f140",
    stroke: "#6366f1",
  };
  const fillColor = isSelected
    ? "#2563eb"
    : isHovered
    ? colors.stroke
    : colors.stroke;
  const size = isSelected || isHovered ? 16 : 12;
  const strokeWidth = isSelected ? 3 : isHovered ? 2.5 : 2;
  const strokeColor = isSelected ? "#1d4ed8" : "#ffffff";

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${
      size * 2
    }" viewBox="0 0 ${size * 2} ${size * 2}">
      <circle cx="${size}" cy="${size}" r="${
      size - strokeWidth
    }" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </svg>`
  )}`;
}

const mapContainerStyle = {
  width: "100%",
  height: "280px",
  borderRadius: "12px",
};

const MAP_STYLES = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
  { featureType: "water", stylers: [{ color: "#e0f2fe" }] },
  {
    featureType: "landscape",
    stylers: [{ color: "#f8fafc" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#cbd5e1" }, { weight: 1 }],
  },
];

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
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mapInfoZone, setMapInfoZone] = useState<ZoneData | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  // Fetch zones
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

    return () => {
      cancelled = true;
    };
  }, [province]);

  const isZoneSelected = useCallback(
    (zoneId: string) => selectedZones.some((z) => z.zoneId === zoneId),
    [selectedZones]
  );

  const normalised = province ? province.trim().toUpperCase() : "";
  const provCenter = PROVINCE_CENTERS[normalised] || {
    lat: 42.5,
    lng: 12.5,
    zoom: 9,
  };
  const zonesWithCoords = zones.filter((z) => z.lat && z.lng);
  const maxReached = selectedZones.length >= 3;

  const mapRef = useRef<google.maps.Map | null>(null);

  // Group zones by tier
  const groupedZones = useMemo(() => {
    const groups: Record<string, ZoneData[]> = {};
    const sorted = [...zones].sort((a, b) => {
      const tierDiff =
        (TIER_ORDER[a.zoneClass] ?? 9) - (TIER_ORDER[b.zoneClass] ?? 9);
      if (tierDiff !== 0) return tierDiff;
      return (b.population || 0) - (a.population || 0);
    });

    for (const zone of sorted) {
      const tier = zone.zoneClass || "BASE";
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push(zone);
    }
    return groups;
  }, [zones]);

  const tierKeys = useMemo(
    () =>
      Object.keys(groupedZones).sort(
        (a, b) => (TIER_ORDER[a] ?? 9) - (TIER_ORDER[b] ?? 9)
      ),
    [groupedZones]
  );

  // Map center
  const center = useMemo(() => {
    if (zonesWithCoords.length === 0)
      return { lat: provCenter.lat, lng: provCenter.lng };
    const avgLat =
      zonesWithCoords.reduce((s, z) => s + z.lat!, 0) /
      zonesWithCoords.length;
    const avgLng =
      zonesWithCoords.reduce((s, z) => s + z.lng!, 0) /
      zonesWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [zonesWithCoords.length, provCenter.lat, provCenter.lng, zones]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (zonesWithCoords.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        zonesWithCoords.forEach((z) =>
          bounds.extend({ lat: z.lat!, lng: z.lng! })
        );
        map.fitBounds(bounds, 40);
      }
    },
    [zonesWithCoords]
  );

  useEffect(() => {
    if (mapRef.current && zonesWithCoords.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      zonesWithCoords.forEach((z) =>
        bounds.extend({ lat: z.lat!, lng: z.lng! })
      );
      mapRef.current.fitBounds(bounds, 40);
    }
  }, [zonesWithCoords]);

  function toggleZone(zone: ZoneData) {
    const slots = getSlots(zone);
    if (isZoneSelected(zone.id)) {
      onSelectionChange(selectedZones.filter((z) => z.zoneId !== zone.id));
    } else {
      if (selectedZones.length >= 3) return;
      if (slots.taken >= slots.max) return;
      onSelectionChange([
        ...selectedZones,
        {
          zoneId: zone.id,
          zoneName: zone.name,
          zoneClass: zone.zoneClass,
          priceMonthly: getPrice(zone) || undefined,
        },
      ]);
    }
    setMapInfoZone(null);
  }

  function scrollToCard(zoneId: string) {
    const el = cardRefs.current[zoneId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHoveredZone(zoneId);
      setTimeout(() => setHoveredZone(null), 2000);
    }
  }

  // Don't render anything until province is entered
  if (!province || province.length < 2) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-text">
          Zone disponibili — Provincia di {normalised}
        </h3>
        <p className="mt-0.5 text-xs text-text-muted">
          Seleziona fino a 3 zone di interesse. Le zone contigue alla tua sede
          saranno suggerite in fase di attivazione.
        </p>
      </div>

      {loading && (
        <div className="h-[200px] animate-pulse rounded-xl bg-bg-soft flex items-center justify-center">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-text-muted">
              Caricamento zone...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && zones.length === 0 && province.length >= 2 && (
        <div className="rounded-xl border border-border bg-bg-soft p-6 text-center">
          <p className="text-sm text-text-muted">
            Nessuna zona attiva per la provincia{" "}
            <strong>{normalised}</strong>.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Puoi comunque inviare la richiesta e ti contatteremo quando saranno
            disponibili.
          </p>
        </div>
      )}

      {/* Map — compact reference view */}
      {!loading &&
        zones.length > 0 &&
        isLoaded &&
        !loadError &&
        zonesWithCoords.length > 0 && (
          <div className="relative">
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
                fullscreenControl: false,
                styles: MAP_STYLES,
              }}
              onClick={() => setMapInfoZone(null)}
            >
              {zonesWithCoords.map((zone) => {
                const selected = isZoneSelected(zone.id);
                const isHovered = hoveredZone === zone.id;

                return (
                  <MarkerF
                    key={zone.id}
                    position={{ lat: zone.lat!, lng: zone.lng! }}
                    icon={{
                      url: createMarkerIcon(
                        zone.zoneClass,
                        selected,
                        isHovered
                      ),
                      scaledSize: new google.maps.Size(
                        selected || isHovered ? 32 : 24,
                        selected || isHovered ? 32 : 24
                      ),
                      anchor: new google.maps.Point(
                        selected || isHovered ? 16 : 12,
                        selected || isHovered ? 16 : 12
                      ),
                    }}
                    onClick={() => setMapInfoZone(zone)}
                    zIndex={selected ? 10 : isHovered ? 8 : 5}
                  />
                );
              })}

              {/* Info window on marker click */}
              {mapInfoZone && mapInfoZone.lat && mapInfoZone.lng && (
                <InfoWindowF
                  position={{ lat: mapInfoZone.lat, lng: mapInfoZone.lng }}
                  onCloseClick={() => setMapInfoZone(null)}
                >
                  <div className="min-w-[200px] p-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ZONE_TIER_COLORS[mapInfoZone.zoneClass] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ZONE_TIER_SHORT[mapInfoZone.zoneClass] ||
                          mapInfoZone.zoneClass}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">
                      {mapInfoZone.name}
                    </h4>
                    {mapInfoZone.municipalities.length > 0 && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {mapInfoZone.municipalities.slice(0, 5).join(", ")}
                        {mapInfoZone.municipalities.length > 5
                          ? ` +${mapInfoZone.municipalities.length - 5}`
                          : ""}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => scrollToCard(mapInfoZone.id)}
                      className="mt-2 w-full text-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Vedi dettagli
                    </button>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>

            {/* Map legend overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm border border-gray-200/80">
              {Object.entries(ZONE_MAP_COLORS).map(([tier, colors]) => (
                <span
                  key={tier}
                  className="flex items-center gap-1.5 text-[10px] text-gray-600"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
                    style={{ background: colors.stroke }}
                  />
                  {ZONE_TIER_SHORT[tier] || tier}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Zone cards grouped by tier */}
      {!loading && zones.length > 0 && (
        <div className="space-y-5">
          {tierKeys.map((tier) => {
            const config = TIER_CONFIG[tier] || TIER_CONFIG.BASE;
            const tierZones = groupedZones[tier];

            return (
              <div key={tier}>
                {/* Tier header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white bg-gradient-to-r ${config.gradient}`}
                  >
                    <span>{config.icon}</span>
                    {config.label}
                  </span>
                  <span className="text-xs text-text-muted">
                    {tierZones.length} zon{tierZones.length === 1 ? "a" : "e"}
                  </span>
                </div>

                {/* Zone cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tierZones.map((zone) => {
                    const selected = isZoneSelected(zone.id);
                    const slots = getSlots(zone);
                    const isFull = slots.taken >= slots.max;
                    const isLastSlot = !isFull && slots.max - slots.taken === 1;
                    const disabled = (!selected && maxReached) || isFull;
                    const price = getPrice(zone);
                    const isHovered = hoveredZone === zone.id;

                    return (
                      <div
                        key={zone.id}
                        ref={(el) => {
                          cardRefs.current[zone.id] = el;
                        }}
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                        className={`relative rounded-xl border-2 p-4 transition-all duration-200 ${
                          selected
                            ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100"
                            : isHovered && !disabled
                            ? `${config.borderColor} ${config.bgColor} shadow-sm`
                            : isFull
                            ? "border-gray-200 bg-gray-50 opacity-60"
                            : "border-gray-200 bg-white hover:shadow-sm"
                        }`}
                      >
                        {/* Top row: name + badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-text leading-tight">
                              {zone.name}
                            </h4>
                            {zone.municipalities.length > 0 && (
                              <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                                {zone.municipalities.length === 1
                                  ? zone.municipalities[0]
                                  : zone.municipalities
                                      .slice(0, 4)
                                      .join(", ") +
                                    (zone.municipalities.length > 4
                                      ? ` +${
                                          zone.municipalities.length - 4
                                        } comuni`
                                      : "")}
                              </p>
                            )}
                          </div>

                          {/* Status indicator */}
                          {isFull ? (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                              Esaurita
                            </span>
                          ) : isLastSlot ? (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Ultimo posto
                            </span>
                          ) : (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {slots.max - slots.taken} post
                              {slots.max - slots.taken === 1 ? "o" : "i"}
                            </span>
                          )}
                        </div>

                        {/* Bottom row: price + population + select button */}
                        <div className="flex items-end justify-between mt-3">
                          <div>
                            {price > 0 && (
                              <p className="text-lg font-bold text-text leading-none">
                                {formatPrice(price)}
                                <span className="text-xs font-normal text-text-muted">
                                  /mese
                                </span>
                              </p>
                            )}
                            {zone.population > 0 && (
                              <p className="text-[11px] text-text-muted mt-1">
                                {zone.population.toLocaleString("it-IT")} abitanti
                              </p>
                            )}
                          </div>

                          {!isFull && (
                            <button
                              type="button"
                              disabled={disabled && !selected}
                              onClick={() => toggleZone(zone)}
                              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                                selected
                                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                  : disabled
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                              }`}
                            >
                              {selected ? "✓ Selezionata" : "Seleziona"}
                            </button>
                          )}
                        </div>

                        {/* Selected checkmark overlay */}
                        {selected && (
                          <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selection summary */}
      {selectedZones.length > 0 && (
        <div className="sticky bottom-0 z-10 rounded-xl border-2 border-blue-200 bg-blue-50/95 backdrop-blur-sm p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-blue-900">
              Zone selezionate ({selectedZones.length}/3)
            </p>
            {selectedZones.length > 0 && (
              <p className="text-sm font-bold text-blue-700">
                Totale:{" "}
                {formatPrice(
                  selectedZones.reduce(
                    (sum, z) => sum + (z.priceMonthly || 0),
                    0
                  )
                )}
                /mese
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((z) => (
              <span
                key={z.zoneId}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-200 px-3 py-1.5 text-xs shadow-sm"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      ZONE_MAP_COLORS[z.zoneClass]?.stroke || "#6366f1",
                  }}
                />
                <span className="font-medium text-text">{z.zoneName}</span>
                {z.priceMonthly && (
                  <span className="text-text-muted">
                    {formatPrice(z.priceMonthly)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onSelectionChange(
                      selectedZones.filter((s) => s.zoneId !== z.zoneId)
                    )
                  }
                  className="ml-0.5 rounded-full p-0.5 text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
