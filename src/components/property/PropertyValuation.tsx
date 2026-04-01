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
      <div className="animate-pulse h-32 bg-border/30 rounded-xl" />
    );
  }

  if (!data || !data.available) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-text-muted">
          {data?.message || "Dati di mercato non disponibili per questa zona."}
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

  let verdict: { text: string; color: string };
  if (propertyPricePerSqm < data.avgPricePerSqm * 0.9) {
    verdict = { text: "Sotto la media", color: "text-success" };
  } else if (propertyPricePerSqm > data.avgPricePerSqm * 1.1) {
    verdict = { text: "Sopra la media", color: "text-amber-600" };
  } else {
    verdict = { text: "In linea con il mercato", color: "text-primary" };
  }

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">Prezzo richiesto</p>
          <p className="text-lg font-semibold text-text">{fmt(price)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-muted">Valutazione</p>
          <p className={`text-lg font-semibold ${verdict.color}`}>{verdict.text}</p>
        </div>
      </div>

      {/* Price bar */}
      <div>
        <div className="relative h-3 bg-gradient-to-r from-success via-primary to-amber-500 rounded-full">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary-dark rounded-full shadow-md"
            style={{ left: `calc(${position}% - 10px)` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>{fmt(estimatedMin)}</span>
          <span className="font-medium">Media: {fmt(estimatedAvg)}</span>
          <span>{fmt(estimatedMax)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="text-center">
          <p className="text-xs text-text-muted">Prezzo/m²</p>
          <p className="text-sm font-medium text-text">{propertyPricePerSqm.toLocaleString("it-IT")} €</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-muted">Media zona</p>
          <p className="text-sm font-medium text-text">{data.avgPricePerSqm.toLocaleString("it-IT")} €/m²</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-muted">Zona OMI</p>
          <p className="text-sm font-medium text-text truncate" title={data.zoneName}>{data.zoneName}</p>
        </div>
      </div>

      <p className="text-[10px] text-text-muted text-center pt-1">
        Fonte: Osservatorio Mercato Immobiliare{data.isProvincial ? " (media provinciale)" : ""} — zona {data.zoneName}. Valore indicativo.
      </p>
    </div>
  );
}
