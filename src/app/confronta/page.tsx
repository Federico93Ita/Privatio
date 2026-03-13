"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Property {
  id: string;
  slug: string;
  title: string;
  type: string;
  price: number;
  surface: number;
  rooms: number;
  bathrooms: number;
  floor: number | null;
  totalFloors: number | null;
  hasGarage: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  energyClass: string | null;
  yearBuilt: number | null;
  address: string;
  city: string;
  province: string;
  description: string | null;
  photos: { url: string }[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatPricePerMq(price: number, surface: number): string {
  if (!surface) return "—";
  return `${Math.round(price / surface).toLocaleString("it-IT")} €/m²`;
}

const typeLabels: Record<string, string> = {
  APPARTAMENTO: "Appartamento",
  VILLA: "Villa",
  CASA_INDIPENDENTE: "Casa Indipendente",
  ATTICO: "Attico",
  MANSARDA: "Mansarda",
  LOFT: "Loft",
  TERRENO: "Terreno",
  NEGOZIO: "Negozio",
  UFFICIO: "Ufficio",
};

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ConfrontaPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get property IDs from URL: /confronta?ids=id1,id2,id3
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    if (ids.length < 2) {
      setError("Seleziona almeno 2 immobili da confrontare.");
      setLoading(false);
      return;
    }
    if (ids.length > 3) {
      setError("Puoi confrontare al massimo 3 immobili.");
      setLoading(false);
      return;
    }

    async function fetchProperties() {
      try {
        setLoading(true);
        const results = await Promise.all(
          ids.map((id) =>
            fetch(`/api/properties/${id}`).then((r) => {
              if (!r.ok) throw new Error(`Immobile ${id} non trovato`);
              return r.json();
            })
          )
        );
        setProperties(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore nel caricamento");
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("ids")]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-border" />
            <div className="h-96 w-full rounded-xl bg-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error || properties.length < 2) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-text mb-4">Confronta Immobili</h1>
          <p className="text-sm text-text-muted mb-6">{error || "Seleziona almeno 2 immobili da confrontare."}</p>
          <Link
            href="/ricerca"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/85 transition-colors"
          >
            Cerca Immobili
          </Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; getValue: (p: Property) => React.ReactNode }[] = [
    { label: "Prezzo", getValue: (p) => <span className="font-medium text-primary">{formatPrice(p.price)}</span> },
    { label: "Prezzo/m²", getValue: (p) => formatPricePerMq(p.price, p.surface) },
    { label: "Tipo", getValue: (p) => typeLabels[p.type] || p.type },
    { label: "Superficie", getValue: (p) => `${p.surface} m²` },
    { label: "Locali", getValue: (p) => p.rooms },
    { label: "Bagni", getValue: (p) => p.bathrooms },
    { label: "Piano", getValue: (p) => p.floor != null ? `${p.floor}/${p.totalFloors || "—"}` : "—" },
    { label: "Classe Energetica", getValue: (p) => p.energyClass || "—" },
    { label: "Anno Costruzione", getValue: (p) => p.yearBuilt || "—" },
    { label: "Garage", getValue: (p) => p.hasGarage ? <CheckIcon /> : <XIcon /> },
    { label: "Giardino", getValue: (p) => p.hasGarden ? <CheckIcon /> : <XIcon /> },
    { label: "Balcone", getValue: (p) => p.hasBalcony ? <CheckIcon /> : <XIcon /> },
    { label: "Ascensore", getValue: (p) => p.hasElevator ? <CheckIcon /> : <XIcon /> },
    { label: "Posizione", getValue: (p) => `${p.city} (${p.province})` },
  ];

  // Find best value for comparison highlighting
  function getBestPrice(): string {
    const min = Math.min(...properties.map((p) => p.price));
    return properties.find((p) => p.price === min)?.id || "";
  }
  function getBestSurface(): string {
    const max = Math.max(...properties.map((p) => p.surface));
    return properties.find((p) => p.surface === max)?.id || "";
  }

  const bestPriceId = getBestPrice();
  const bestSurfaceId = getBestSurface();

  return (
    <div className="min-h-screen bg-bg-soft px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-text sm:text-3xl">Confronta Immobili</h1>
            <p className="mt-1 text-sm text-text-muted">
              Confronta {properties.length} immobili fianco a fianco.
            </p>
          </div>
          <Link
            href="/ricerca"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary-dark hover:bg-bg-soft transition-colors"
          >
            Torna alla Ricerca
          </Link>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
          <table className="w-full">
            {/* Header row with images */}
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-white p-4 text-left w-40" />
                {properties.map((prop) => (
                  <th key={prop.id} className="p-4 text-center min-w-[220px]">
                    <Link href={`/immobile/${prop.slug}`} className="group block">
                      <div className="mx-auto mb-3 aspect-[4/3] max-w-[200px] rounded-lg overflow-hidden bg-bg-soft">
                        {prop.photos[0] ? (
                          <img
                            src={prop.photos[0].url}
                            alt={prop.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-text-muted">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary-dark group-hover:text-primary line-clamp-2">
                        {prop.title || `${prop.rooms} locali a ${prop.city}`}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{prop.address}</p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.label} className={idx % 2 === 0 ? "bg-bg-soft" : "bg-white"}>
                  <td className="sticky left-0 z-10 border-r border-border p-4 text-sm font-medium text-text-muted whitespace-nowrap" style={{ backgroundColor: idx % 2 === 0 ? "var(--color-bg-soft)" : "#fff" }}>
                    {row.label}
                  </td>
                  {properties.map((prop) => {
                    // Highlight best values
                    let highlight = false;
                    if (row.label === "Prezzo" && prop.id === bestPriceId) highlight = true;
                    if (row.label === "Superficie" && prop.id === bestSurfaceId) highlight = true;

                    return (
                      <td
                        key={prop.id}
                        className={`p-4 text-center text-sm ${
                          highlight ? "bg-success/5 font-semibold" : ""
                        }`}
                      >
                        <div className="flex items-center justify-center">{row.getValue(prop)}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Call to Action */}
        <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
          <div />
          {properties.map((prop) => (
            <div key={prop.id} className="text-center">
              <Link
                href={`/immobile/${prop.slug}`}
                className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/85"
              >
                Vedi Dettagli
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
