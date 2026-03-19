"use client";

import { useState, useEffect } from "react";

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
  plan?: string;
  priceMonthly?: number;
}

interface ZonePreferenceSelectorProps {
  province: string;
  selectedZones: ZonePreference[];
  onSelectionChange: (zones: ZonePreference[]) => void;
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

  function isZoneSelected(zoneId: string): boolean {
    return selectedZones.some((z) => z.zoneId === zoneId);
  }

  function toggleZone(zone: ZoneData) {
    if (isZoneSelected(zone.id)) {
      // Deselect
      onSelectionChange(selectedZones.filter((z) => z.zoneId !== zone.id));
    } else {
      // Select (max 3)
      if (selectedZones.length >= 3) return;
      onSelectionChange([
        ...selectedZones,
        {
          zoneId: zone.id,
          zoneName: zone.name,
          zoneClass: zone.zoneClass,
        },
      ]);
    }
  }

  // Don't render anything until province is entered
  if (!province || province.length < 2) return null;

  const maxReached = selectedZones.length >= 3;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-text">
          Zone disponibili nella provincia di {province.toUpperCase()}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          Seleziona fino a 3 zone di interesse. Discuteremo i dettagli del piano dopo l&apos;approvazione.
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-bg-soft"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {zones.map((zone) => {
            const selected = isZoneSelected(zone.id);
            const disabled = !selected && maxReached;

            return (
              <button
                key={zone.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleZone(zone)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : disabled
                    ? "cursor-not-allowed border-border bg-bg-soft opacity-50"
                    : "border-border bg-white hover:border-primary/30 hover:bg-primary/[0.02]"
                }`}
              >
                {/* Check circle */}
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-border bg-white"
                  }`}
                >
                  {selected && (
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Zone info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">
                    {zone.name}
                  </p>
                  {zone.municipalities.length > 0 && (
                    <p className="text-[11px] text-text-muted mt-0.5 truncate">
                      {zone.municipalities.slice(0, 3).join(", ")}
                      {zone.municipalities.length > 3 &&
                        ` +${zone.municipalities.length - 3} altri`}
                    </p>
                  )}
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {zone.population > 0 &&
                      `${zone.population.toLocaleString("it-IT")} abitanti`}
                  </p>
                </div>
              </button>
            );
          })}
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
                <button
                  type="button"
                  onClick={() =>
                    onSelectionChange(
                      selectedZones.filter((s) => s.zoneId !== z.zoneId)
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
