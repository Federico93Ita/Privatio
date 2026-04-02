"use client";

import { useEffect, useState } from "react";

interface PropertyValuationProps {
  city: string;
  province: string;
  surface: number;
  rooms: number;
  price: number;
  type: string;
}

interface ValuationData {
  available: boolean;
  avgPricePerSqm: number;
  minPricePerSqm: number;
  maxPricePerSqm: number;
  zoneName: string;
  isProvincial: boolean;
  scope?: string;
  source: string;
  message?: string;
}

export default function PropertyValuation({ city, province, surface, price, type }: PropertyValuationProps) {
  const [data, setData] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchValuation() {
      try {
        const params = new URLSearchParams({ city, type });
        if (province) params.set("province", province);
        const res = await fetch(`/api/valuation?${params}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchValuation();
  }, [city, province, type]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-border/30 rounded-xl" />
        <div className="h-6 bg-border/30 rounded-lg w-3/4 mx-auto" />
        <div className="h-16 bg-border/30 rounded-xl" />
      </div>
    );
  }

  if (!data || !data.available) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-bg-soft flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-sm text-text-muted">
          {data?.message || "Dati di mercato non ancora disponibili per questa zona."}
        </p>
      </div>
    );
  }

  const propertyPricePerSqm = Math.round(price / surface);
  const estimatedMin = data.minPricePerSqm * surface;
  const estimatedMax = data.maxPricePerSqm * surface;
  const estimatedAvg = data.avgPricePerSqm * surface;

  // Position on the scale (0-100%)
  const range = data.maxPricePerSqm - data.minPricePerSqm;
  const position = range > 0
    ? Math.max(0, Math.min(100, ((propertyPricePerSqm - data.minPricePerSqm) / range) * 100))
    : 50;

  const fmt = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  let verdict: { text: string; color: string; bg: string; icon: string };
  if (propertyPricePerSqm < data.avgPricePerSqm * 0.9) {
    verdict = {
      text: "Sotto la media",
      color: "text-success",
      bg: "bg-success/10",
      icon: "M12 4.5v15m7.5-7.5h-15", // arrow down
    };
  } else if (propertyPricePerSqm > data.avgPricePerSqm * 1.1) {
    verdict = {
      text: "Sopra la media",
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: "M12 19.5v-15m-7.5 7.5h15", // arrow up
    };
  } else {
    verdict = {
      text: "In linea con il mercato",
      color: "text-primary",
      bg: "bg-primary/5",
      icon: "M4.5 12h15", // equals
    };
  }

  const diffPercent = Math.round(((propertyPricePerSqm - data.avgPricePerSqm) / data.avgPricePerSqm) * 100);
  const diffSign = diffPercent > 0 ? "+" : "";

  return (
    <div className="space-y-6">
      {/* Verdict card */}
      <div className={`rounded-xl p-5 ${verdict.bg} flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-full ${verdict.bg} flex items-center justify-center shrink-0`}>
          <svg className={`w-6 h-6 ${verdict.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={verdict.icon} />
          </svg>
        </div>
        <div className="flex-1">
          <p className={`text-lg font-semibold ${verdict.color}`}>{verdict.text}</p>
          <p className="text-sm text-text-muted">
            {diffSign}{diffPercent}% rispetto alla media della zona ({data.avgPricePerSqm.toLocaleString("it-IT")} €/m²)
          </p>
        </div>
      </div>

      {/* Price comparison: property vs market */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Prezzo richiesto</p>
          <p className="text-2xl font-semibold text-text">{fmt(price)}</p>
          <p className="text-sm text-text-muted mt-0.5">{propertyPricePerSqm.toLocaleString("it-IT")} €/m²</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center bg-bg-soft">
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Stima di mercato</p>
          <p className="text-2xl font-semibold text-text">{fmt(estimatedAvg)}</p>
          <p className="text-sm text-text-muted mt-0.5">{data.avgPricePerSqm.toLocaleString("it-IT")} €/m²</p>
        </div>
      </div>

      {/* Range bar */}
      <div className="px-2">
        <div className="flex items-center justify-between mb-2 text-xs text-text-muted">
          <span>Min: {fmt(estimatedMin)}</span>
          <span>Max: {fmt(estimatedMax)}</span>
        </div>
        <div className="relative h-2.5 bg-gradient-to-r from-success via-primary to-amber-500 rounded-full">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-primary-dark rounded-full shadow-lg transition-all"
            style={{ left: `calc(${position}% - 10px)` }}
          />
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-xs text-text-muted font-medium">Media: {fmt(estimatedAvg)}</span>
        </div>
      </div>

      {/* Source */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <svg className="w-3.5 h-3.5 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-[11px] text-text-muted">
          Fonte: Osservatorio Mercato Immobiliare
          {data.scope === "region" ? " (media regionale)" : data.scope === "national" ? " (media nazionale)" : data.isProvincial ? " (media provinciale)" : ""}
          {" — "}{data.zoneName}
        </p>
      </div>
    </div>
  );
}
