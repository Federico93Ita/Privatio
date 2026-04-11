"use client";

import { useState, useEffect, useCallback } from "react";
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

function sortZones(zones: ZoneAvailable[], ownedZoneIds: Set<string>, activeCount: number, maxZones: number): ZoneAvailable[] {
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
  const [agencyProvince, setAgencyProvince] = useState("");
  const [loading, setLoading] = useState(true);

  // Zone lists
  const [provinceZones, setProvinceZones] = useState<ZoneAvailable[]>([]);
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
      // Parallel: territories + agency profile
      const [terRes, agRes] = await Promise.all([
        fetch("/api/dashboard/agency/territories"),
        fetch("/api/dashboard/agency"),
      ]);

      // Territories
      let loadedTerritories: Territory[] = [];
      if (terRes.ok) {
        const terData = await terRes.json();
        loadedTerritories = terData.territories || [];
        setTerritories(loadedTerritories);
        setCurrentPlan(terData.plan);
        setMaxZones(terData.maxZones || 3);
      }

      // Agency province
      let province = "";
      if (agRes.ok) {
        const agData = await agRes.json();
        province = agData?.agency?.province || agData?.province || "";
        setAgencyProvince(province);
      }

      setLoading(false);

      // Now load province zones
      if (province) {
        setProvinceLoading(true);
        try {
          const zRes = await fetch(`/api/zones?province=${province}`);
          if (zRes.ok) {
            const zones: ZoneAvailable[] = await zRes.json();
            setProvinceZones(zones);
          }
        } catch {
          /* silent */
        }
        setProvinceLoading(false);
      }

      // Load adjacent zones (for each active territory)
      const activeTerritories = loadedTerritories.filter((t) => t.isActive);
      if (activeTerritories.length > 0 && activeTerritories.length < 3) {
        const adjacentPromises = activeTerritories.map((t) =>
          fetch(`/api/zones?adjacentTo=${t.zone.id}`)
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => [])
        );
        const adjacentResults = await Promise.all(adjacentPromises);
        const allAdjacent: ZoneAvailable[] = adjacentResults.flat();

        // Deduplicate and remove zones already in province list or owned
        const provinceIds = new Set(
          provinceZones.map((z) => z.id)
        );
        // We need to re-check provinceZones here since it might not be set yet
        // Use a fresh fetch approach: filter by what's NOT in the province
        const seenIds = new Set<string>();
        const uniqueAdjacent = allAdjacent.filter((z) => {
          if (seenIds.has(z.id)) return false;
          seenIds.add(z.id);
          // Keep zones that aren't in the province set
          return !provinceIds.has(z.id);
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

  // Re-derive adjacent zones when province zones load
  useEffect(() => {
    if (provinceZones.length === 0) return;
    const provinceIds = new Set(provinceZones.map((z) => z.id));
    setAdjacentZones((prev) => prev.filter((z) => !provinceIds.has(z.id)));
  }, [provinceZones]);

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
            {/* Slot indicator */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(maxZones)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < activeCount
                        ? "bg-[#C9A84C]"
                        : "bg-[#0B1D3A]/10"
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
        {/*  SEZIONE 2 — Zone disponibili nella tua provincia          */}
        {/* ────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#0B1D3A]/5 bg-white p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-heading text-[#0B1D3A]">
              Zone disponibili
            </h2>
            {agencyProvince && (
              <span className="text-xs text-[#0B1D3A]/30 bg-[#0B1D3A]/5 px-2.5 py-1 rounded-full">
                Provincia di {agencyProvince}
              </span>
            )}
          </div>
          <p className="text-sm text-[#0B1D3A]/40 mb-5">
            Zone acquistabili nella tua provincia — seleziona per attivare
          </p>

          {loading || provinceLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : provinceZones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[#0B1D3A]/40">
                Nessuna zona disponibile nella tua provincia.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortZones(provinceZones, ownedZoneIds, activeCount, maxZones).map(
                (zone) => (
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
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────── */}
        {/*  SEZIONE 3 — Zone adiacenti                                */}
        {/* ────────────────────────────────────────────────────────── */}
        {activeCount > 0 &&
          activeCount < maxZones &&
          adjacentZones.length > 0 && (
            <section className="rounded-2xl border border-[#0B1D3A]/5 bg-white p-6">
              <h2 className="text-lg font-heading text-[#0B1D3A] mb-1">
                Espandi in zone adiacenti
              </h2>
              <p className="text-sm text-[#0B1D3A]/40 mb-5">
                Zone vicine ai tuoi territori attuali
              </p>

              <div className="space-y-3">
                {sortZones(
                  adjacentZones,
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
/*  ZoneCard — Componente riutilizzabile per le card zona              */
/* ================================================================== */

function ZoneCard({
  zone,
  status,
  actionLoading,
  onBuy,
  showProvince = false,
}: {
  zone: ZoneAvailable;
  status: ZoneStatus;
  actionLoading: string | null;
  onBuy: (zoneId: string, plan: string) => void;
  showProvince?: boolean;
}) {
  const isDisabled =
    status === "owned" || status === "full" || status === "limit_reached";
  const slotsRemaining = zone.slots.max - zone.slots.taken;

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
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-[#0B1D3A]/40">
              Score {zone.marketScore}/10
            </span>
            <span className="text-xs text-[#0B1D3A]/40">
              {zone.population.toLocaleString("it-IT")} ab.
            </span>
            {/* Slot indicator */}
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
                : `${slotsRemaining} ${slotsRemaining === 1 ? "posto libero" : "posti liberi"} su ${zone.slots.max}`}
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
