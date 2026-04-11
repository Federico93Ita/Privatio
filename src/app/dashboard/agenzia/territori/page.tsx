"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ZONE_TIER_SHORT,
  ZONE_CLASS_LABELS,
  ZONE_CLASS_COLORS,
} from "@/lib/zone-constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Territory {
  id: string;
  plan: string;
  monthlyPrice: number;
  isActive: boolean;
  zone: {
    id: string;
    name: string;
    slug: string;
    zoneClass: string;
    region: string;
    province: string;
    city: string | null;
    marketScore: number;
  };
}

interface ZoneAvailable {
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
  plan: string;
  price: number;
  slots: { taken: number; max: number };
  adjacentZoneIds: string[];
}

type ZoneStatus = "owned" | "available" | "full" | "limit_reached";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Haversine distance in km — same formula used server-side */
function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RADIUS_BY_CLASS: Record<string, number> = {
  PREMIUM: 5,
  URBANA: 8,
  BASE: 15,
};

/**
 * Finds the agency's "home zone" — the nearest zone matching the agency's city.
 * Mirrors the server-side resolveZoneForProperty logic.
 */
function findHomeZone(
  zones: ZoneAvailable[],
  agencyCity: string,
  agencyLat: number,
  agencyLng: number
): ZoneAvailable | null {
  if (zones.length === 0) return null;

  // 1. Exact city match (case-insensitive)
  const cityNorm = agencyCity.trim().toLowerCase();
  const cityMatches = zones.filter(
    (z) => z.city?.trim().toLowerCase() === cityNorm
  );

  // If multiple city matches, pick the nearest one
  if (cityMatches.length > 0) {
    let nearest = cityMatches[0];
    let minDist = Infinity;
    for (const z of cityMatches) {
      if (z.lat && z.lng) {
        const d = distanceKm(agencyLat, agencyLng, z.lat, z.lng);
        if (d < minDist) {
          minDist = d;
          nearest = z;
        }
      }
    }
    return nearest;
  }

  // 2. Municipality match
  const municipalityMatch = zones.find((z) =>
    z.municipalities.some((m) => m.trim().toLowerCase() === cityNorm)
  );
  if (municipalityMatch) return municipalityMatch;

  // 3. Nearest by distance
  let nearest: ZoneAvailable | null = null;
  let minDist = Infinity;
  for (const z of zones) {
    if (z.lat && z.lng) {
      const d = distanceKm(agencyLat, agencyLng, z.lat, z.lng);
      if (d < minDist) {
        minDist = d;
        nearest = z;
      }
    }
  }
  return nearest;
}

/**
 * Filters zones to only those the agency can actually purchase:
 * same class as home zone + within distance radius.
 */
function filterEligibleZones(
  zones: ZoneAvailable[],
  homeZone: ZoneAvailable,
  agencyLat: number,
  agencyLng: number
): ZoneAvailable[] {
  const maxDist = RADIUS_BY_CLASS[homeZone.zoneClass] ?? 10;

  return zones.filter((z) => {
    // Must be same class
    if (z.zoneClass !== homeZone.zoneClass) return false;
    // Check distance
    if (z.lat && z.lng) {
      const dist = distanceKm(agencyLat, agencyLng, z.lat, z.lng);
      if (dist > maxDist) return false;
    }
    return true;
  });
}

function classifyZone(
  zone: ZoneAvailable,
  ownedZoneIds: Set<string>,
  activeCount: number,
  maxZones: number
): ZoneStatus {
  if (ownedZoneIds.has(zone.id)) return "owned";
  if (zone.slots.taken >= zone.slots.max) return "full";
  if (activeCount >= maxZones) return "limit_reached";
  return "available";
}

function sortZones(
  zones: ZoneAvailable[],
  ownedZoneIds: Set<string>,
  activeCount: number,
  maxZones: number
): ZoneAvailable[] {
  const order: Record<ZoneStatus, number> = {
    available: 0,
    limit_reached: 1,
    full: 2,
    owned: 3,
  };
  return [...zones].sort((a, b) => {
    const sa = classifyZone(a, ownedZoneIds, activeCount, maxZones);
    const sb = classifyZone(b, ownedZoneIds, activeCount, maxZones);
    if (order[sa] !== order[sb]) return order[sa] - order[sb];
    return b.marketScore - a.marketScore;
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TerritoriPage() {
  const searchParams = useSearchParams();

  // Core data
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>("BASE");
  const [maxZones, setMaxZones] = useState(3);
  const [loading, setLoading] = useState(true);

  // Agency info
  const [agencyProvince, setAgencyProvince] = useState("");
  const [agencyCity, setAgencyCity] = useState("");
  const [agencyLat, setAgencyLat] = useState<number>(0);
  const [agencyLng, setAgencyLng] = useState<number>(0);

  // All province zones (unfiltered)
  const [allProvinceZones, setAllProvinceZones] = useState<ZoneAvailable[]>([]);
  const [adjacentZones, setAdjacentZones] = useState<ZoneAvailable[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  // Derived
  const activeCount = territories.filter((t) => t.isActive).length;
  const ownedZoneIds = new Set(
    territories.filter((t) => t.isActive).map((t) => t.zone.id)
  );

  // Home zone + eligible zones (computed from all province zones)
  const homeZone = useMemo(() => {
    if (!agencyCity || !agencyLat || allProvinceZones.length === 0) return null;
    return findHomeZone(allProvinceZones, agencyCity, agencyLat, agencyLng);
  }, [allProvinceZones, agencyCity, agencyLat, agencyLng]);

  const eligibleZones = useMemo(() => {
    if (!homeZone || !agencyLat) return allProvinceZones;
    return filterEligibleZones(
      allProvinceZones,
      homeZone,
      agencyLat,
      agencyLng
    );
  }, [allProvinceZones, homeZone, agencyLat, agencyLng]);

  /* ---------------------------------------------------------------- */
  /*  Post-checkout banner                                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setBanner({
        type: "success",
        message: "Territorio acquistato con successo!",
      });
      window.history.replaceState({}, "", "/dashboard/agenzia/territori");
    } else if (searchParams.get("canceled") === "true") {
      setBanner({
        type: "warning",
        message: "Acquisto annullato. Puoi riprovare quando vuoi.",
      });
      window.history.replaceState({}, "", "/dashboard/agenzia/territori");
    }
  }, [searchParams]);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [terRes, agRes] = await Promise.all([
        fetch("/api/dashboard/agency/territories"),
        fetch("/api/dashboard/agency"),
      ]);

      let loadedTerritories: Territory[] = [];
      if (terRes.ok) {
        const terData = await terRes.json();
        loadedTerritories = terData.territories || [];
        setTerritories(loadedTerritories);
        setCurrentPlan(terData.plan);
        setMaxZones(terData.maxZones || 3);
      }

      let province = "";
      if (agRes.ok) {
        const agData = await agRes.json();
        const ag = agData?.agency || agData;
        province = ag?.province || "";
        setAgencyProvince(province);
        setAgencyCity(ag?.city || "");
        setAgencyLat(ag?.lat || 0);
        setAgencyLng(ag?.lng || 0);
      }

      setLoading(false);

      // Load province zones
      if (province) {
        setProvinceLoading(true);
        try {
          const zRes = await fetch(`/api/zones?province=${province}`);
          if (zRes.ok) {
            const zones: ZoneAvailable[] = await zRes.json();
            setAllProvinceZones(zones);
          }
        } catch {
          /* silent */
        }
        setProvinceLoading(false);
      }

      // Load adjacent zones
      const activeTerritories = loadedTerritories.filter((t) => t.isActive);
      if (activeTerritories.length > 0 && activeTerritories.length < 3) {
        const adjacentPromises = activeTerritories.map((t) =>
          fetch(`/api/zones?adjacentTo=${t.zone.id}`)
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [])
        );
        const adjacentResults = await Promise.all(adjacentPromises);
        const allAdjacent: ZoneAvailable[] = adjacentResults.flat();

        const seenIds = new Set<string>();
        const uniqueAdjacent = allAdjacent.filter((z) => {
          if (seenIds.has(z.id)) return false;
          seenIds.add(z.id);
          return true;
        });

        setAdjacentZones(uniqueAdjacent);
      }
    } catch {
      setBanner({
        type: "error",
        message: "Errore nel caricamento dei territori.",
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter adjacent zones: remove those already in eligible list
  const filteredAdjacentZones = useMemo(() => {
    const eligibleIds = new Set(eligibleZones.map((z) => z.id));
    // Also filter by class + distance like eligible zones
    if (!homeZone || !agencyLat) return [];
    return adjacentZones.filter((z) => {
      if (eligibleIds.has(z.id)) return false;
      if (z.zoneClass !== homeZone.zoneClass) return false;
      if (z.lat && z.lng) {
        const maxDist = RADIUS_BY_CLASS[homeZone.zoneClass] ?? 10;
        const dist = distanceKm(agencyLat, agencyLng, z.lat, z.lng);
        if (dist > maxDist) return false;
      }
      return true;
    });
  }, [adjacentZones, eligibleZones, homeZone, agencyLat, agencyLng]);

  /* ---------------------------------------------------------------- */
  /*  Actions                                                          */
  /* ---------------------------------------------------------------- */

  async function handleBuyZone(zoneId: string, plan: string) {
    setActionLoading(zoneId);
    setBanner(null);

    const isFirstTerritory = activeCount === 0;

    try {
      if (isFirstTerritory) {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, zoneId }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        if (data.error) throw new Error(data.error);
      } else {
        const res = await fetch("/api/dashboard/agency/territories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, zoneId }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.error === "redirect_to_checkout") {
            const checkoutRes = await fetch("/api/stripe/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan, zoneId }),
            });
            const checkoutData = await checkoutRes.json();
            if (checkoutData.url) {
              window.location.href = checkoutData.url;
              return;
            }
          }
          throw new Error(data.error || "Errore nell'acquisto");
        }

        setBanner({
          type: "success",
          message: "Territorio aggiunto con successo!",
        });
        await fetchAll();
      }
    } catch (err) {
      setBanner({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Errore nell'acquisto del territorio.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReleaseTerritory(territoryId: string) {
    if (
      !confirm(
        "Sei sicuro di voler rilasciare questo territorio? L'operazione è immediata."
      )
    )
      return;

    setActionLoading(territoryId);
    setBanner(null);

    try {
      const res = await fetch("/api/dashboard/agency/territories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ territoryId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nel rilascio");
      }

      setBanner({ type: "success", message: "Territorio rilasciato." });
      await fetchAll();
    } catch (err) {
      setBanner({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Errore nel rilascio del territorio.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  const maxDistKm = homeZone
    ? RADIUS_BY_CLASS[homeZone.zoneClass] ?? 10
    : 10;

  return (
    <DashboardLayout role="agency">
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading text-[#0B1D3A]">Territori</h1>
          <p className="text-sm text-[#0B1D3A]/50 mt-1">
            Gestisci le zone in cui operi
          </p>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              banner.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : banner.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/*  SEZIONE 1 — I tuoi territori                             */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#0B1D3A]/5 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-[#0B1D3A]">
              I tuoi territori
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(maxZones)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < activeCount ? "bg-[#C9A84C]" : "bg-[#0B1D3A]/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#0B1D3A]/40">
                {activeCount}/{maxZones} zone attive
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeCount === 0 ? (
            <div className="text-center py-10">
              <svg
                className="w-12 h-12 text-[#0B1D3A]/10 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <h3 className="font-heading text-[#0B1D3A] text-base mb-1">
                Non hai ancora nessun territorio
              </h3>
              <p className="text-sm text-[#0B1D3A]/40 max-w-sm mx-auto">
                Scegli la tua prima zona operativa qui sotto. Potrai attivare
                fino a {maxZones} zone nella tua area.
              </p>
              <svg
                className="w-5 h-5 text-[#C9A84C] mx-auto mt-4 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {territories
                .filter((t) => t.isActive)
                .map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-green-200 bg-green-50/30 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-[#0B1D3A] text-sm">
                          {t.zone.name}
                        </h3>
                        <p className="text-xs text-[#0B1D3A]/40 mt-0.5">
                          {t.zone.province} — {t.zone.region}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          ZONE_CLASS_COLORS[t.zone.zoneClass] || "bg-gray-100"
                        }`}
                      >
                        {ZONE_TIER_SHORT[t.zone.zoneClass] || t.zone.zoneClass}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Attiva
                      </span>
                      <span className="text-sm font-semibold text-[#0B1D3A]">
                        {formatPrice(t.monthlyPrice)}/mese
                      </span>
                    </div>

                    <button
                      onClick={() => handleReleaseTerritory(t.id)}
                      disabled={actionLoading === t.id}
                      className="w-full py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === t.id ? "Rilascio..." : "Rilascia"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/*  SEZIONE 2 — Zone disponibili nella tua area               */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#0B1D3A]/5 bg-white p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-heading text-[#0B1D3A]">
              Zone disponibili nella tua area
            </h2>
            {homeZone && (
              <span
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  ZONE_CLASS_COLORS[homeZone.zoneClass] || "bg-gray-100"
                }`}
              >
                {ZONE_CLASS_LABELS[homeZone.zoneClass] || homeZone.zoneClass}
              </span>
            )}
          </div>

          {/* Info banner about zone class */}
          {homeZone && (
            <div className="flex items-start gap-2 mb-5 p-3 rounded-lg bg-[#0B1D3A]/[0.02] border border-[#0B1D3A]/5">
              <svg
                className="w-4 h-4 text-[#0B1D3A]/30 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              <p className="text-xs text-[#0B1D3A]/50">
                La tua agenzia si trova in una{" "}
                <strong className="text-[#0B1D3A]/70">
                  {ZONE_CLASS_LABELS[homeZone.zoneClass]?.toLowerCase()}
                </strong>
                . Puoi operare solo in zone della stessa fascia entro{" "}
                {maxDistKm} km dalla tua sede.
              </p>
            </div>
          )}

          {loading || provinceLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : eligibleZones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#0B1D3A]/40">
                Nessuna zona disponibile nella tua area.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortZones(
                eligibleZones,
                ownedZoneIds,
                activeCount,
                maxZones
              ).map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  status={classifyZone(
                    zone,
                    ownedZoneIds,
                    activeCount,
                    maxZones
                  )}
                  actionLoading={actionLoading}
                  onBuy={handleBuyZone}
                  agencyLat={agencyLat}
                  agencyLng={agencyLng}
                />
              ))}
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/*  SEZIONE 3 — Zone adiacenti                                */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeCount > 0 &&
          activeCount < maxZones &&
          filteredAdjacentZones.length > 0 && (
            <section className="rounded-2xl border border-[#0B1D3A]/5 bg-white p-6">
              <h2 className="text-lg font-heading text-[#0B1D3A] mb-1">
                Espandi in zone adiacenti
              </h2>
              <p className="text-sm text-[#0B1D3A]/40 mb-5">
                Zone vicine ai tuoi territori attuali
              </p>

              <div className="space-y-3">
                {sortZones(
                  filteredAdjacentZones,
                  ownedZoneIds,
                  activeCount,
                  maxZones
                ).map((zone) => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    status={classifyZone(
                      zone,
                      ownedZoneIds,
                      activeCount,
                      maxZones
                    )}
                    actionLoading={actionLoading}
                    onBuy={handleBuyZone}
                    showProvince
                    agencyLat={agencyLat}
                    agencyLng={agencyLng}
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    </DashboardLayout>
  );
}

/* ================================================================== */
/*  ZoneCard                                                           */
/* ================================================================== */

function ZoneCard({
  zone,
  status,
  actionLoading,
  onBuy,
  showProvince = false,
  agencyLat,
  agencyLng,
}: {
  zone: ZoneAvailable;
  status: ZoneStatus;
  actionLoading: string | null;
  onBuy: (zoneId: string, plan: string) => void;
  showProvince?: boolean;
  agencyLat?: number;
  agencyLng?: number;
}) {
  const slotsRemaining = zone.slots.max - zone.slots.taken;

  // Calculate distance from agency
  const distance =
    agencyLat && agencyLng && zone.lat && zone.lng
      ? distanceKm(agencyLat, agencyLng, zone.lat, zone.lng)
      : null;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        status === "owned"
          ? "border-green-200 bg-green-50/30"
          : status === "full" || status === "limit_reached"
          ? "border-[#0B1D3A]/5 bg-[#0B1D3A]/[0.02] opacity-60"
          : "border-[#0B1D3A]/10 bg-white hover:border-[#C9A84C]/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: zone info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-[#0B1D3A] text-sm">
              {zone.name}
            </h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                ZONE_CLASS_COLORS[zone.zoneClass] || "bg-gray-100"
              }`}
            >
              {ZONE_TIER_SHORT[zone.zoneClass] || zone.zoneClass}
            </span>
            {showProvince && (
              <span className="text-[10px] text-[#0B1D3A]/30 bg-[#0B1D3A]/5 px-1.5 py-0.5 rounded">
                {zone.province}
              </span>
            )}
          </div>

          {/* Municipalities */}
          {zone.municipalities.length > 0 && (
            <p className="text-xs text-[#0B1D3A]/30 mt-1">
              {zone.municipalities.slice(0, 5).join(", ")}
              {zone.municipalities.length > 5 &&
                ` +${zone.municipalities.length - 5} altri`}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-[#0B1D3A]/40">
              Score {zone.marketScore}/10
            </span>
            <span className="text-xs text-[#0B1D3A]/40">
              {zone.population.toLocaleString("it-IT")} ab.
            </span>
            {distance !== null && (
              <span className="text-xs text-[#0B1D3A]/30">
                {distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance.toFixed(1)} km`}
              </span>
            )}
            <span
              className={`text-xs font-medium ${
                status === "full"
                  ? "text-red-500"
                  : slotsRemaining === 1
                  ? "text-amber-600"
                  : "text-green-600"
              }`}
            >
              {status === "full"
                ? "Esaurita"
                : `${slotsRemaining} ${
                    slotsRemaining === 1 ? "posto libero" : "posti liberi"
                  } su ${zone.slots.max}`}
            </span>
          </div>
        </div>

        {/* Right: price + action */}
        <div className="text-right shrink-0 flex flex-col items-end gap-2">
          <div>
            <p className="text-base font-semibold text-[#0B1D3A]">
              {formatPrice(zone.price)}
            </p>
            <p className="text-[10px] text-[#0B1D3A]/30">al mese</p>
          </div>

          {status === "owned" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Attiva
            </span>
          ) : status === "full" ? (
            <span className="text-xs text-red-400 bg-red-50 px-2.5 py-1 rounded-full">
              Esaurita
            </span>
          ) : status === "limit_reached" ? (
            <span className="text-xs text-[#0B1D3A]/30 bg-[#0B1D3A]/5 px-2.5 py-1 rounded-full">
              Limite raggiunto
            </span>
          ) : (
            <button
              onClick={() => onBuy(zone.id, zone.plan)}
              disabled={actionLoading === zone.id}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C9A84C] rounded-lg hover:bg-[#D4B65E] transition-colors disabled:opacity-50"
            >
              {actionLoading === zone.id ? "..." : "Acquista"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
