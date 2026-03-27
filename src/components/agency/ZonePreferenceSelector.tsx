"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Polygon,
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
/*  Voronoi tessellation (no deps — Fortune's algorithm lite)          */
/* ------------------------------------------------------------------ */

/** Compute Voronoi cells from points within a bounding box.
 *  Returns array of polygons (each polygon = array of {lat,lng}).
 *  Uses a simple pixel-less approach: for each zone centroid,
 *  compute the Voronoi cell by intersecting half-planes. */
function computeVoronoiCells(
  points: { lat: number; lng: number }[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): { lat: number; lng: number }[][] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    // Single zone covers entire bounds
    return [
      [
        { lat: bounds.minLat, lng: bounds.minLng },
        { lat: bounds.minLat, lng: bounds.maxLng },
        { lat: bounds.maxLat, lng: bounds.maxLng },
        { lat: bounds.maxLat, lng: bounds.minLng },
      ],
    ];
  }

  const cells: { lat: number; lng: number }[][] = [];

  for (let i = 0; i < points.length; i++) {
    // Start with bounding box as initial polygon
    let polygon: [number, number][] = [
      [bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat],
      [bounds.minLng, bounds.maxLat],
    ];

    const pi = points[i];

    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      const pj = points[j];

      // Compute perpendicular bisector between pi and pj
      const midLng = (pi.lng + pj.lng) / 2;
      const midLat = (pi.lat + pj.lat) / 2;

      // Normal vector pointing from pj to pi (we keep the side of pi)
      const nx = pi.lng - pj.lng;
      const ny = pi.lat - pj.lat;

      // Clip polygon to the half-plane containing pi
      polygon = clipPolygonByHalfPlane(polygon, midLng, midLat, nx, ny);
      if (polygon.length < 3) break;
    }

    cells.push(
      polygon.map(([lng, lat]) => ({ lat, lng }))
    );
  }

  return cells;
}

/** Sutherland-Hodgman clip: keep side where dot(p - mid, normal) >= 0 */
function clipPolygonByHalfPlane(
  polygon: [number, number][],
  midX: number,
  midY: number,
  nx: number,
  ny: number
): [number, number][] {
  if (polygon.length < 3) return [];

  const result: [number, number][] = [];
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];

    const dCurr = (curr[0] - midX) * nx + (curr[1] - midY) * ny;
    const dNext = (next[0] - midX) * nx + (next[1] - midY) * ny;

    if (dCurr >= 0) {
      result.push(curr);
      if (dNext < 0) {
        // Exiting: compute intersection
        const t = dCurr / (dCurr - dNext);
        result.push([
          curr[0] + t * (next[0] - curr[0]),
          curr[1] + t * (next[1] - curr[1]),
        ]);
      }
    } else if (dNext >= 0) {
      // Entering: compute intersection
      const t = dCurr / (dCurr - dNext);
      result.push([
        curr[0] + t * (next[0] - curr[0]),
        curr[1] + t * (next[1] - curr[1]),
      ]);
    }
  }

  return result;
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

/** Tier ordering for display: PREMIUM first, then URBANA, then BASE */
const TIER_ORDER: Record<string, number> = {
  PREMIUM: 0,
  URBANA: 1,
  BASE: 2,
};

const TIER_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    gradient: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    mapFill: string;
    mapFillSelected: string;
    mapStroke: string;
  }
> = {
  PREMIUM: {
    label: "Premium",
    icon: "★",
    gradient: "from-rose-500 to-pink-400",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    mapFill: "rgba(233,69,96,0.18)",
    mapFillSelected: "rgba(233,69,96,0.45)",
    mapStroke: "#e94560",
  },
  URBANA: {
    label: "Urbana",
    icon: "◆",
    gradient: "from-cyan-500 to-teal-400",
    textColor: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    mapFill: "rgba(8,145,178,0.18)",
    mapFillSelected: "rgba(8,145,178,0.45)",
    mapStroke: "#0891b2",
  },
  BASE: {
    label: "Base",
    icon: "●",
    gradient: "from-indigo-500 to-violet-400",
    textColor: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    mapFill: "rgba(99,102,241,0.18)",
    mapFillSelected: "rgba(99,102,241,0.45)",
    mapStroke: "#6366f1",
  },
};

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
  { featureType: "water", stylers: [{ color: "#dbeafe" }] },
  { featureType: "landscape", stylers: [{ color: "#f1f5f9" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#94a3b8" }, { weight: 0.8 }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
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
  const [infoZone, setInfoZone] = useState<ZoneData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapRef = useRef<google.maps.Map | null>(null);

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
  const zonesWithCoords = useMemo(() => {
    const withCoords = zones.filter((z) => z.lat != null && z.lng != null);
    if (withCoords.length < 4) return withCoords;

    // Filter outliers: remove zones whose lat/lng is far from the median
    // This prevents one bad coordinate from breaking the entire Voronoi
    const sortedLats = withCoords.map((z) => z.lat!).sort((a, b) => a - b);
    const sortedLngs = withCoords.map((z) => z.lng!).sort((a, b) => a - b);
    const medianLat = sortedLats[Math.floor(sortedLats.length / 2)];
    const medianLng = sortedLngs[Math.floor(sortedLngs.length / 2)];
    const q1Lat = sortedLats[Math.floor(sortedLats.length * 0.25)];
    const q3Lat = sortedLats[Math.floor(sortedLats.length * 0.75)];
    const q1Lng = sortedLngs[Math.floor(sortedLngs.length * 0.25)];
    const q3Lng = sortedLngs[Math.floor(sortedLngs.length * 0.75)];
    const iqrLat = Math.max(q3Lat - q1Lat, 0.3);
    const iqrLng = Math.max(q3Lng - q1Lng, 0.3);

    return withCoords.filter(
      (z) =>
        Math.abs(z.lat! - medianLat) <= iqrLat * 3 &&
        Math.abs(z.lng! - medianLng) <= iqrLng * 3
    );
  }, [zones]);
  const maxReached = selectedZones.length >= 3;

  // Filtered zones for search
  const filteredZones = useMemo(() => {
    if (!searchQuery.trim()) return zones;
    const q = searchQuery.toLowerCase();
    return zones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.municipalities.some((m) => m.toLowerCase().includes(q))
    );
  }, [zones, searchQuery]);

  // Group filtered zones by tier
  const groupedZones = useMemo(() => {
    const groups: Record<string, ZoneData[]> = {};
    const sorted = [...filteredZones].sort((a, b) => {
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
  }, [filteredZones]);

  const tierKeys = useMemo(
    () =>
      Object.keys(groupedZones).sort(
        (a, b) => (TIER_ORDER[a] ?? 9) - (TIER_ORDER[b] ?? 9)
      ),
    [groupedZones]
  );

  // Compute Voronoi polygons
  const voronoiCells = useMemo(() => {
    if (zonesWithCoords.length === 0) return new Map<string, { lat: number; lng: number }[]>();

    const lats = zonesWithCoords.map((z) => z.lat!);
    const lngs = zonesWithCoords.map((z) => z.lng!);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Expand bounds by ~20% to cover edges fully
    const latPad = Math.max((maxLat - minLat) * 0.25, 0.08);
    const lngPad = Math.max((maxLng - minLng) * 0.25, 0.08);

    const bounds = {
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
    };

    const points = zonesWithCoords.map((z) => ({
      lat: z.lat!,
      lng: z.lng!,
    }));

    const cells = computeVoronoiCells(points, bounds);

    const cellMap = new Map<string, { lat: number; lng: number }[]>();
    zonesWithCoords.forEach((z, i) => {
      if (cells[i] && cells[i].length >= 3) {
        cellMap.set(z.id, cells[i]);
      }
    });

    return cellMap;
  }, [zonesWithCoords]);

  // Map center & bounds
  const mapCenter = useMemo(() => {
    if (zonesWithCoords.length === 0) return { lat: 42.5, lng: 12.5 };
    const avgLat =
      zonesWithCoords.reduce((s, z) => s + z.lat!, 0) / zonesWithCoords.length;
    const avgLng =
      zonesWithCoords.reduce((s, z) => s + z.lng!, 0) / zonesWithCoords.length;
    return { lat: avgLat, lng: avgLng };
  }, [zonesWithCoords]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (zonesWithCoords.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        zonesWithCoords.forEach((z) =>
          bounds.extend({ lat: z.lat!, lng: z.lng! })
        );
        map.fitBounds(bounds, 50);
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
      mapRef.current.fitBounds(bounds, 50);
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
    setInfoZone(null);
  }

  function scrollToCard(zoneId: string) {
    const el = cardRefs.current[zoneId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function panToZone(zone: ZoneData) {
    if (mapRef.current && zone.lat && zone.lng) {
      mapRef.current.panTo({ lat: zone.lat, lng: zone.lng });
      mapRef.current.setZoom(
        Math.max(mapRef.current.getZoom() || 11, 12)
      );
    }
    setHoveredZone(zone.id);
  }

  // Don't render anything until province is entered
  if (!province || province.length < 2) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-text">
          Zone disponibili — Provincia di {normalised}
        </h3>
        <p className="mt-0.5 text-xs text-text-muted">
          Seleziona fino a 3 zone di interesse. Clicca sulla mappa o nella
          lista per selezionare.
        </p>
      </div>

      {loading && (
        <div className="h-[420px] animate-pulse rounded-xl bg-bg-soft flex items-center justify-center">
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-text-muted"
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
            Puoi comunque inviare la richiesta e ti contatteremo quando
            saranno disponibili.
          </p>
        </div>
      )}

      {/* ── Main layout: Sidebar + Map ── */}
      {!loading && zones.length > 0 && (
        <div className="flex flex-col lg:flex-row rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm lg:h-[560px]">
          {/* ── Left sidebar ── */}
          <div className="lg:w-[320px] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 lg:max-h-[560px]">
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Cerca zona o comune..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-200 transition-colors"
                />
              </div>
            </div>

            {/* Zone list */}
            <div
              ref={sidebarRef}
              className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-3"
            >
              {tierKeys.map((tier) => {
                const config = TIER_CONFIG[tier] || TIER_CONFIG.BASE;
                const tierZones = groupedZones[tier];

                return (
                  <div key={tier}>
                    {/* Tier label */}
                    <div className="flex items-center gap-2 px-1 mb-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            ZONE_MAP_COLORS[tier]?.stroke || "#6366f1",
                        }}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {config.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({tierZones.length})
                      </span>
                    </div>

                    {/* Zone items */}
                    <div className="space-y-1">
                      {tierZones.map((zone) => {
                        const selected = isZoneSelected(zone.id);
                        const slots = getSlots(zone);
                        const isFull = slots.taken >= slots.max;
                        const isHovered = hoveredZone === zone.id;
                        const disabled =
                          (!selected && maxReached) || isFull;
                        const price = getPrice(zone);

                        return (
                          <div
                            key={zone.id}
                            ref={(el) => {
                              cardRefs.current[zone.id] = el;
                            }}
                            onMouseEnter={() => setHoveredZone(zone.id)}
                            onMouseLeave={() => setHoveredZone(null)}
                            onClick={() => {
                              if (!disabled || selected) {
                                toggleZone(zone);
                              }
                              panToZone(zone);
                            }}
                            className={`relative rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                              selected
                                ? "bg-blue-50 border border-blue-300 shadow-sm"
                                : isHovered && !disabled
                                ? `${config.bgColor} border border-transparent`
                                : isFull
                                ? "bg-gray-50 border border-transparent opacity-50"
                                : "bg-white border border-transparent hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  {selected && (
                                    <svg
                                      className="h-3.5 w-3.5 text-blue-600 shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                  <h4 className="text-xs font-semibold text-gray-900 leading-tight truncate">
                                    {zone.name}
                                  </h4>
                                </div>
                                {zone.municipalities.length > 0 && (
                                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug line-clamp-1">
                                    {zone.municipalities.length <= 3
                                      ? zone.municipalities.join(", ")
                                      : zone.municipalities
                                          .slice(0, 3)
                                          .join(", ") +
                                        ` +${
                                          zone.municipalities.length - 3
                                        }`}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                {price > 0 && (
                                  <p className="text-xs font-bold text-gray-900">
                                    {formatPrice(price)}
                                    <span className="text-[9px] font-normal text-gray-400">
                                      /m
                                    </span>
                                  </p>
                                )}
                                {isFull ? (
                                  <span className="text-[9px] text-gray-400">
                                    Esaurita
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-emerald-600">
                                    {slots.max - slots.taken} post
                                    {slots.max - slots.taken === 1
                                      ? "o"
                                      : "i"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredZones.length === 0 && searchQuery && (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-400">
                    Nessuna zona trovata per &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Legend / zone count */}
            <div className="p-2.5 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {Object.entries(ZONE_MAP_COLORS).map(([tier, colors]) => (
                    <span
                      key={tier}
                      className="flex items-center gap-1 text-[10px] text-gray-500"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-sm border border-white shadow-sm"
                        style={{ background: colors.stroke }}
                      />
                      {ZONE_TIER_SHORT[tier]}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">
                  {zones.length} zone
                </span>
              </div>
            </div>
          </div>

          {/* ── Map ── */}
          <div className="flex-1 min-h-[320px] lg:min-h-0 relative">
            {isLoaded && !loadError && zonesWithCoords.length > 0 ? (
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "100%",
                  minHeight: "320px",
                }}
                center={mapCenter}
                zoom={10}
                onLoad={onMapLoad}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  styles: MAP_STYLES,
                  clickableIcons: false,
                }}
                onClick={() => setInfoZone(null)}
              >
                {/* Render Voronoi polygons for each zone */}
                {zonesWithCoords.map((zone) => {
                  const cell = voronoiCells.get(zone.id);
                  if (!cell || cell.length < 3) return null;

                  const selected = isZoneSelected(zone.id);
                  const isHovered = hoveredZone === zone.id;
                  const config =
                    TIER_CONFIG[zone.zoneClass] || TIER_CONFIG.BASE;

                  return (
                    <Polygon
                      key={zone.id}
                      paths={cell}
                      options={{
                        fillColor: selected
                          ? config.mapStroke
                          : config.mapStroke,
                        fillOpacity: selected
                          ? 0.45
                          : isHovered
                          ? 0.35
                          : 0.15,
                        strokeColor: selected
                          ? "#1d4ed8"
                          : isHovered
                          ? config.mapStroke
                          : "#94a3b8",
                        strokeWeight: selected
                          ? 2.5
                          : isHovered
                          ? 2
                          : 0.8,
                        strokeOpacity: selected ? 1 : isHovered ? 0.9 : 0.7,
                        zIndex: selected ? 10 : isHovered ? 5 : 1,
                        clickable: true,
                      }}
                      onMouseOver={() => setHoveredZone(zone.id)}
                      onMouseOut={() => setHoveredZone(null)}
                      onClick={() => {
                        setInfoZone(zone);
                        scrollToCard(zone.id);
                      }}
                    />
                  );
                })}

                {/* Info window on polygon click */}
                {infoZone && infoZone.lat && infoZone.lng && (
                  <InfoWindowF
                    position={{ lat: infoZone.lat, lng: infoZone.lng }}
                    onCloseClick={() => setInfoZone(null)}
                    options={{ maxWidth: 260 }}
                  >
                    <div className="min-w-[200px] p-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            ZONE_TIER_COLORS[infoZone.zoneClass] ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ZONE_TIER_SHORT[infoZone.zoneClass] ||
                            infoZone.zoneClass}
                        </span>
                        {getSlots(infoZone).taken >=
                        getSlots(infoZone).max ? (
                          <span className="text-[10px] text-gray-400">
                            Esaurita
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600">
                            {getSlots(infoZone).max -
                              getSlots(infoZone).taken}{" "}
                            posti
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900">
                        {infoZone.name}
                      </h4>
                      {infoZone.municipalities.length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {infoZone.municipalities.slice(0, 5).join(", ")}
                          {infoZone.municipalities.length > 5
                            ? ` +${infoZone.municipalities.length - 5}`
                            : ""}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                        {getPrice(infoZone) > 0 && (
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(getPrice(infoZone))}
                            <span className="text-xs font-normal text-gray-400">
                              /mese
                            </span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleZone(infoZone)}
                          disabled={
                            (!isZoneSelected(infoZone.id) && maxReached) ||
                            getSlots(infoZone).taken >=
                              getSlots(infoZone).max
                          }
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                            isZoneSelected(infoZone.id)
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : getSlots(infoZone).taken >=
                                getSlots(infoZone).max
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : maxReached
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          {isZoneSelected(infoZone.id)
                            ? "✓ Selezionata"
                            : "Seleziona"}
                        </button>
                      </div>
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <span className="text-xs text-gray-400">
                  {loadError
                    ? "Errore nel caricamento della mappa"
                    : "Caricamento mappa..."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Selection summary ── */}
      {selectedZones.length > 0 && (
        <div className="sticky bottom-0 z-10 rounded-xl border-2 border-blue-200 bg-blue-50/95 backdrop-blur-sm p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-blue-900">
              Zone selezionate ({selectedZones.length}/3)
            </p>
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
