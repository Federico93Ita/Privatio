"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

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
  prices: Record<string, number>;
  slots: Record<string, { taken: number; max: number }>;
}

interface RegionsData {
  regions: Record<string, string[]>;
}

const PLAN_LABELS: Record<string, string> = {
  BASE: "Base",
  PREMIER_LOCAL: "Premier Local",
  PREMIER_CITY: "Premier City",
  PREMIER_PRIME: "Premier Prime",
  PREMIER_ELITE: "Premier Elite",
};

const ZONE_CLASS_LABELS: Record<string, string> = {
  CLUSTER_LOCAL: "Cluster",
  COMUNE: "Comune",
  MACROQUARTIERE: "Quartiere",
  MICROZONA_PRIME: "Microzona Prime",
};

const ZONE_CLASS_COLORS: Record<string, string> = {
  CLUSTER_LOCAL: "bg-gray-100 text-gray-700",
  COMUNE: "bg-blue-50 text-blue-700",
  MACROQUARTIERE: "bg-purple-50 text-purple-700",
  MICROZONA_PRIME: "bg-amber-50 text-amber-700",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TerritoriPage() {
  const searchParams = useSearchParams();

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>("BASE");
  const [maxZones, setMaxZones] = useState(1);
  const [loading, setLoading] = useState(true);

  // Browser zone
  const [regions, setRegions] = useState<Record<string, string[]>>({});
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [availableZones, setAvailableZones] = useState<ZoneAvailable[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);

  // Banner post-checkout
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setBanner({ type: "success", message: "Territorio acquistato con successo!" });
      window.history.replaceState({}, "", "/dashboard/agenzia/territori");
    } else if (searchParams.get("canceled") === "true") {
      setBanner({ type: "warning", message: "Acquisto annullato. Puoi riprovare quando vuoi." });
      window.history.replaceState({}, "", "/dashboard/agenzia/territori");
    }
  }, [searchParams]);

  // Carica territori
  useEffect(() => {
    fetchTerritories();
    fetchRegions();
  }, []);

  async function fetchTerritories() {
    try {
      const res = await fetch("/api/dashboard/agency/territories");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTerritories(data.territories || []);
      setCurrentPlan(data.plan);
      setMaxZones(data.maxZones);
    } catch {
      setBanner({ type: "error", message: "Errore nel caricamento dei territori." });
    } finally {
      setLoading(false);
    }
  }

  async function fetchRegions() {
    try {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error();
      const data: RegionsData = await res.json();
      setRegions(data.regions || {});
    } catch { /* silenzioso */ }
  }

  async function browseZones(province: string) {
    setBrowseLoading(true);
    try {
      const res = await fetch(`/api/zones?province=${province}`);
      if (!res.ok) throw new Error();
      const data: ZoneAvailable[] = await res.json();
      setAvailableZones(data);
    } catch {
      setAvailableZones([]);
    } finally {
      setBrowseLoading(false);
    }
  }

  async function handleBuyZone(zoneId: string, plan: string) {
    setActionLoading(zoneId);
    setBanner(null);

    const activeCount = territories.filter((t) => t.isActive).length;
    const isFirstTerritory = activeCount === 0;

    try {
      if (isFirstTerritory) {
        // Usa checkout per il primo territorio
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
        // Aggiungi a subscription esistente
        const res = await fetch("/api/dashboard/agency/territories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, zoneId }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.error === "redirect_to_checkout") {
            // Fallback a checkout
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

        setBanner({ type: "success", message: "Territorio aggiunto con successo!" });
        await fetchTerritories();
        await browseZones(selectedProvince);
      }
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Errore nell'acquisto del territorio.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReleaseTerritory(territoryId: string) {
    if (!confirm("Sei sicuro di voler rilasciare questo territorio? L'operazione è immediata.")) return;

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
      await fetchTerritories();
      if (selectedProvince) await browseZones(selectedProvince);
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Errore nel rilascio del territorio.",
      });
    } finally {
      setActionLoading(null);
    }
  }

  function formatPrice(cents: number): string {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
  }

  const activeCount = territories.filter((t) => t.isActive).length;

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <DashboardLayout role="agency">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium text-text">I tuoi Territori</h1>
          <p className="text-text-muted mt-1">
            Gestisci le zone in cui operi. Piano attuale:{" "}
            <span className="font-medium text-primary">{PLAN_LABELS[currentPlan] || currentPlan}</span>
            {" — "}
            {activeCount}/{maxZones} zone attive
          </p>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              banner.type === "success"
                ? "bg-success/5 border-success/15 text-success"
                : banner.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-error/5 border-error/15 text-error"
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* Territori attivi */}
        <section>
          <h2 className="text-lg font-medium text-text mb-4">Territori Attivi</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeCount === 0 ? (
            <div className="bg-bg-soft rounded-xl border border-border p-8 text-center">
              <p className="text-text-muted">Nessun territorio attivo.</p>
              <p className="text-text-muted text-sm mt-1">
                Esplora le zone disponibili qui sotto per iniziare.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {territories
                .filter((t) => t.isActive)
                .map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl border border-border p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-text">{t.zone.name}</h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {t.zone.province} — {t.zone.region}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          ZONE_CLASS_COLORS[t.zone.zoneClass] || "bg-gray-100"
                        }`}
                      >
                        {ZONE_CLASS_LABELS[t.zone.zoneClass] || t.zone.zoneClass}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">
                        Piano: <span className="text-text">{PLAN_LABELS[t.plan]}</span>
                      </span>
                      <span className="font-medium text-text">
                        {formatPrice(t.monthlyPrice)}/mese
                      </span>
                    </div>

                    <button
                      onClick={() => handleReleaseTerritory(t.id)}
                      disabled={actionLoading === t.id}
                      className="w-full py-2 text-sm text-error border border-error/20 rounded-lg hover:bg-error/5 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === t.id ? "Rilascio..." : "Rilascia territorio"}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Browser zone */}
        <section>
          <h2 className="text-lg font-medium text-text mb-4">Esplora Zone Disponibili</h2>

          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedProvince("");
                setAvailableZones([]);
              }}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              <option value="">Seleziona regione</option>
              {Object.keys(regions)
                .sort()
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>

            {selectedRegion && regions[selectedRegion] && (
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  if (e.target.value) browseZones(e.target.value);
                  else setAvailableZones([]);
                }}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Seleziona provincia</option>
                {regions[selectedRegion].sort().map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
          </div>

          {browseLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : availableZones.length > 0 ? (
            <div className="space-y-3">
              {availableZones.map((zone) => (
                <div
                  key={zone.id}
                  className="bg-white rounded-xl border border-border p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text">{zone.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            ZONE_CLASS_COLORS[zone.zoneClass] || "bg-gray-100"
                          }`}
                        >
                          {ZONE_CLASS_LABELS[zone.zoneClass] || zone.zoneClass}
                        </span>
                      </div>
                      {zone.municipalities.length > 1 && (
                        <p className="text-xs text-text-muted mt-1">
                          Comuni: {zone.municipalities.slice(0, 5).join(", ")}
                          {zone.municipalities.length > 5 && ` +${zone.municipalities.length - 5}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-text-muted">
                      <p>Market Score: {zone.marketScore}/10</p>
                      <p>{zone.population.toLocaleString("it-IT")} ab.</p>
                    </div>
                  </div>

                  {/* Piani disponibili per questa zona */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(zone.prices).map(([plan, price]) => {
                      const slotInfo = zone.slots[plan];
                      const isFull = slotInfo && slotInfo.taken >= slotInfo.max;
                      const isAlreadyOwned = territories.some(
                        (t) => t.zone.id === zone.id && t.isActive
                      );

                      return (
                        <button
                          key={plan}
                          onClick={() => handleBuyZone(zone.id, plan)}
                          disabled={isFull || isAlreadyOwned || actionLoading === zone.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${
                            isFull || isAlreadyOwned
                              ? "bg-bg-soft border-border text-text-muted cursor-not-allowed"
                              : "border-primary/20 text-primary hover:bg-primary/5"
                          }`}
                        >
                          <span className="font-medium">{PLAN_LABELS[plan]}</span>
                          <span>{formatPrice(price)}/m</span>
                          {slotInfo && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isFull
                                  ? "bg-error/10 text-error"
                                  : slotInfo.max - slotInfo.taken === 1
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-success/10 text-success"
                              }`}
                            >
                              {isFull
                                ? "Esaurito"
                                : `${slotInfo.max - slotInfo.taken}/${slotInfo.max}`}
                            </span>
                          )}
                          {isAlreadyOwned && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary">
                              Attivo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : selectedProvince ? (
            <p className="text-text-muted text-center py-8">
              Nessuna zona disponibile per questa provincia.
            </p>
          ) : (
            <p className="text-text-muted text-center py-8">
              Seleziona una regione e una provincia per esplorare le zone disponibili.
            </p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
