"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FavoriteProperty {
  id: string;
  createdAt: string;
  property: {
    id: string;
    slug: string;
    title: string;
    city: string;
    province: string;
    price: number;
    surface: number;
    rooms: number;
    status: string;
    photos: { url: string }[];
    _count: { favorites: number };
  };
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

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(propertyId: string) {
    setRemovingId(propertyId);
    try {
      const res = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.property.id !== propertyId));
      }
    } catch {
      // silently fail
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <DashboardLayout role="buyer">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark sm:text-3xl">
            I Tuoi Preferiti
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {favorites.length > 0
              ? `Hai ${favorites.length} immobil${favorites.length === 1 ? "e" : "i"} salvat${favorites.length === 1 ? "o" : "i"}.`
              : "Salva gli immobili che ti interessano per confrontarli facilmente."}
          </p>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-white overflow-hidden">
                <div className="aspect-[4/3] bg-border/50" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-border/50" />
                  <div className="h-3 w-1/2 rounded bg-border/50" />
                  <div className="h-4 w-1/3 rounded bg-border/50" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white px-6 py-16 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-text-muted" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-primary-dark">
              Nessun preferito ancora
            </h3>
            <p className="mb-6 max-w-sm text-sm text-text-muted">
              Esplora gli immobili disponibili e salva quelli che ti interessano cliccando sull&apos;icona cuore.
            </p>
            <Link
              href="/cerca"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              Cerca Immobili
            </Link>
          </div>
        )}

        {!loading && favorites.length >= 2 && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 p-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary shrink-0" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <p className="text-sm text-text-muted flex-1">
              Hai {favorites.length} immobili salvati. Confrontali fianco a fianco per scegliere meglio.
            </p>
            <Link
              href={`/confronta?ids=${favorites.slice(0, 3).map((f) => f.property.slug).join(",")}`}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/85 transition-colors"
            >
              Confronta
            </Link>
          </div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="group relative rounded-xl border border-border bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(fav.property.id)}
                  disabled={removingId === fav.property.id}
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-error shadow-sm transition-colors hover:bg-error hover:text-white disabled:opacity-50"
                  aria-label="Rimuovi dai preferiti"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                <Link href={`/immobile/${fav.property.slug}`}>
                  <div className="aspect-[4/3] bg-bg-soft relative">
                    {fav.property.photos[0] ? (
                      <img
                        src={fav.property.photos[0].url}
                        alt={fav.property.title}
                        className="h-full w-full object-cover"
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
                    {/* Status badge */}
                    {fav.property.status === "VENDUTO" && (
                      <div className="absolute top-3 left-3 rounded-full bg-error px-2.5 py-0.5 text-xs font-medium text-white">
                        Venduto
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-text line-clamp-1 group-hover:text-primary">
                      {fav.property.title || `${fav.property.rooms} locali a ${fav.property.city}`}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {fav.property.city} ({fav.property.province})
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base font-medium text-primary">
                        {formatPrice(fav.property.price)}
                      </span>
                      <span className="text-xs text-text-muted">
                        {fav.property.surface} m&sup2; &middot; {fav.property.rooms} loc.
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-2">
                      Salvato il {new Date(fav.createdAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
