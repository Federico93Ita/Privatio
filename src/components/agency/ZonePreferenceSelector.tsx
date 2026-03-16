"use client";

import { useState, useEffect } from "react";
import {
  PLAN_LABELS,
  ZONE_CLASS_LABELS,
  ZONE_CLASS_COLORS,
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
  municipalities: string[];
  marketScore: number;
  population: number;
  prices: Record<string, number>;
  slots: Record<string, { taken: number; max: number }>;
}

export interface ZonePreference {
  zoneId: string;
  zoneName: string;
  zoneClass: string;
  plan: string;
  priceMonthly: number;
}

interface ZonePreferenceSelectorProps {
  province: string;
  selectedZones: ZonePreference[];
  onSelectionChange: (zones: ZonePreference[]) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatMonthlyPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

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

    return () => {
      cancelled = true;
    };
  }, [province]);

  // Clear selections if province changes and previously selected zones no longer match
  useEffect(() => {
    if (zones.length === 0 && selectedZones.length > 0) {
      // Don't clear immediately — only if province changed to something with no results
      if (province.length >= 2) {
        // Keep selections until new zones load; they'll be cleared if mismatch
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones]);

  function isSelected(zoneId: string, plan: string): boolean {
    return selectedZones.some((z) => z.zoneId === zoneId && z.plan === plan);
  }

  function toggleZonePlan(zone: ZoneData, plan: string, price: number) {
    const exists = selectedZones.find(
      (z) => z.zoneId === zone.id && z.plan === plan
    );

    if (exists) {
      // Deselect
      onSelectionChange(
        selectedZones.filter(
          (z) => !(z.zoneId === zone.id && z.plan === plan)
        )
      );
    } else {
      // Replace any existing selection for this zone (only 1 plan per zone)
      const withoutThisZone = selectedZones.filter(
        (z) => z.zoneId !== zone.id
      );

      if (withoutThisZone.length >= 3) {
        // Max 3 zones
        return;
      }

      onSelectionChange([
        ...withoutThisZone,
        {
          zoneId: zone.id,
          zoneName: zone.name,
          zoneClass: zone.zoneClass,
          plan,
          priceMonthly: price,
        },
      ]);
    }
  }

  // Don't render anything until province is entered
  if (!province || province.length < 2) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-text">
          Zone disponibili nella provincia di {province.toUpperCase()}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Seleziona fino a 3 zone di interesse con il pacchetto preferito.
          Potrai modificare la scelta dopo l&apos;approvazione.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-bg-soft"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {!loading && !error && zones.length === 0 && province.length >= 2 && (
        <div className="rounded-xl border border-border bg-bg-soft p-6 text-center">
          <p className="text-sm text-text-muted">
            Nessuna zona attiva per la provincia <strong>{province.toUpperCase()}</strong>.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Puoi comunque inviare la richiesta e ti contatteremo quando saranno disponibili.
          </p>
        </div>
      )}

      {!loading && zones.length > 0 && (
        <div className="space-y-3">
          {zones.map((zone) => {
            const plans = Object.keys(zone.prices);
            const isZoneSelected = selectedZones.some(
              (z) => z.zoneId === zone.id
            );

            return (
              <div
                key={zone.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isZoneSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-white"
                }`}
              >
                {/* Zone header */}
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-text">
                        {zone.name}
                      </h4>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          ZONE_CLASS_COLORS[zone.zoneClass] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ZONE_CLASS_LABELS[zone.zoneClass] || zone.zoneClass}
                      </span>
                    </div>
                    {zone.city && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {zone.city}
                      </p>
                    )}
                    {zone.municipalities.length > 0 && (
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {zone.municipalities.slice(0, 4).join(", ")}
                        {zone.municipalities.length > 4 &&
                          ` +${zone.municipalities.length - 4}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span>{zone.marketScore}/10</span>
                  </div>
                </div>

                {/* Plans */}
                <div className="flex flex-wrap gap-2">
                  {plans.map((plan) => {
                    const price = zone.prices[plan];
                    const slot = zone.slots[plan];
                    const isFull = slot && slot.taken >= slot.max;
                    const selected = isSelected(zone.id, plan);
                    const maxReached =
                      !selected &&
                      !isZoneSelected &&
                      selectedZones.length >= 3;

                    return (
                      <button
                        key={plan}
                        type="button"
                        disabled={isFull || maxReached}
                        onClick={() => toggleZonePlan(zone, plan, price)}
                        className={`flex flex-col items-center rounded-lg border px-3 py-2 text-xs transition-all ${
                          selected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : isFull
                            ? "cursor-not-allowed border-border bg-bg-soft text-text-muted opacity-50"
                            : maxReached
                            ? "cursor-not-allowed border-border bg-white text-text-muted opacity-50"
                            : "border-border bg-white text-text hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <span className="font-medium">
                          {PLAN_LABELS[plan] || plan}
                        </span>
                        <span
                          className={`mt-0.5 font-semibold ${
                            selected ? "text-white" : "text-primary"
                          }`}
                        >
                          {formatMonthlyPrice(price)}/mese
                        </span>
                        {slot && (
                          <span
                            className={`mt-0.5 ${
                              selected
                                ? "text-white/70"
                                : isFull
                                ? "text-error"
                                : "text-text-muted"
                            }`}
                          >
                            {isFull
                              ? "Esaurito"
                              : `${slot.taken}/${slot.max} partner`}
                          </span>
                        )}
                      </button>
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
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-medium text-primary-dark mb-2">
            Zone selezionate ({selectedZones.length}/3)
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((z) => (
              <span
                key={`${z.zoneId}-${z.plan}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-primary/20 px-3 py-1 text-xs"
              >
                <span className="font-medium text-text">{z.zoneName}</span>
                <span className="text-text-muted">
                  {PLAN_LABELS[z.plan]} — {formatMonthlyPrice(z.priceMonthly)}/mese
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onSelectionChange(
                      selectedZones.filter(
                        (s) =>
                          !(s.zoneId === z.zoneId && s.plan === z.plan)
                      )
                    )
                  }
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
