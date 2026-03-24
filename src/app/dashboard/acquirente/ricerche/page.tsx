"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFilters(filters: Record<string, unknown>): string {
  const parts: string[] = [];

  if (filters.city) parts.push(`Città: ${filters.city}`);
  if (filters.province) parts.push(`Provincia: ${filters.province}`);
  if (filters.type) parts.push(`Tipo: ${filters.type}`);
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `${Number(filters.minPrice).toLocaleString("it-IT")}€` : "—";
    const max = filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString("it-IT")}€` : "—";
    parts.push(`Prezzo: ${min} – ${max}`);
  }
  if (filters.minSurface || filters.maxSurface) {
    const min = filters.minSurface ? `${filters.minSurface}m²` : "—";
    const max = filters.maxSurface ? `${filters.maxSurface}m²` : "—";
    parts.push(`Superficie: ${min} – ${max}`);
  }
  if (filters.rooms) parts.push(`Locali: ${filters.rooms}+`);

  return parts.length > 0 ? parts.join(" · ") : "Nessun filtro specifico";
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSearches();
  }, []);

  async function fetchSearches() {
    try {
      setLoading(true);
      const res = await fetch("/api/saved-searches");
      if (res.ok) {
        const data = await res.json();
        setSearches(data.searches || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardLayout role="buyer">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark sm:text-3xl">
            Ricerche Salvate
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gestisci le tue ricerche salvate per ritrovarle facilmente.
          </p>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-white p-5">
                <div className="h-4 w-1/3 rounded bg-border/50 mb-2" />
                <div className="h-3 w-2/3 rounded bg-border/50" />
              </div>
            ))}
          </div>
        )}

        {!loading && searches.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white px-6 py-16 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-text-muted" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-primary-dark">
              Nessuna ricerca salvata
            </h3>
            <p className="mb-6 max-w-sm text-sm text-text-muted">
              Quando effettui una ricerca, puoi salvarla per ritrovarla facilmente in seguito.
            </p>
            <Link
              href="/cerca"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              Cerca Immobili
            </Link>
          </div>
        )}

        {!loading && searches.length > 0 && (
          <div className="space-y-3">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-text">{search.name}</h3>
                  <p className="mt-1 text-xs text-text-muted line-clamp-1">
                    {formatFilters(search.filters)}
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    Creata il {new Date(search.createdAt).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/ricerca?saved=${search.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    Apri
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(search.id)}
                    disabled={deletingId === search.id}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-error hover:bg-error/5 transition-colors disabled:opacity-50"
                  >
                    {deletingId === search.id ? "..." : "Elimina"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
