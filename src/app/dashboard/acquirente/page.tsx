"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FavoriteProperty {
  id: string;
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
  };
}

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HomeSearchIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
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
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-border/50 ${className ?? ""}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
      <SkeletonBlock className="h-64 w-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerDashboardPage() {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [favRes, searchRes] = await Promise.all([
          fetch("/api/favorites"),
          fetch("/api/saved-searches"),
        ]);

        if (!cancelled) {
          if (favRes.ok) {
            const favData = await favRes.json();
            setFavorites(favData);
          }
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            setSavedSearches(searchData.searches || []);
          }
        }
      } catch {
        if (!cancelled) setError("Errore nel caricamento dei dati.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout role="buyer">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark sm:text-3xl">
            La tua Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gestisci i tuoi preferiti, le ricerche salvate e trova la casa dei tuoi sogni.
          </p>
        </div>

        {loading && <LoadingSkeleton />}

        {error && !loading && (
          <div className="rounded-xl border border-error/30 bg-error/5 p-5 text-center">
            <p className="text-sm font-medium text-error">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-medium text-primary underline hover:no-underline"
            >
              Riprova
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-2 text-text-muted"><HeartIcon /></div>
                <p className="text-2xl font-medium text-text">{favorites.length}</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">Immobili Salvati</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-2 text-text-muted"><SearchIcon /></div>
                <p className="text-2xl font-medium text-text">{savedSearches.length}</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">Ricerche Salvate</p>
              </div>
              <Link
                href="/cerca"
                className="flex items-center gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 shadow-sm transition-colors hover:bg-primary/10 sm:p-5"
              >
                <div className="text-primary"><SearchIcon /></div>
                <div>
                  <p className="text-sm font-medium text-primary-dark">Cerca Immobili</p>
                  <p className="text-xs text-text-muted">Esplora tutti gli annunci</p>
                </div>
              </Link>
            </div>

            {/* Recent Favorites */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-primary-dark">Preferiti Recenti</h2>
                {favorites.length > 0 && (
                  <Link
                    href="/dashboard/acquirente/preferiti"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Vedi tutti
                  </Link>
                )}
              </div>

              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 text-text-muted">
                    <HomeSearchIcon />
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    Non hai ancora salvato nessun immobile.
                  </p>
                  <Link
                    href="/cerca"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Esplora Immobili
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favorites.slice(0, 6).map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/immobile/${fav.property.slug}`}
                      className="group rounded-lg border border-border overflow-hidden transition-shadow hover:shadow-md"
                    >
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
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-text line-clamp-1 group-hover:text-primary">
                          {fav.property.title || `${fav.property.rooms} locali a ${fav.property.city}`}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {fav.property.city} ({fav.property.province})
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(fav.property.price)}
                          </span>
                          <span className="text-xs text-text-muted">
                            {fav.property.surface} m&sup2; &middot; {fav.property.rooms} loc.
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Searches */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-primary-dark">Ricerche Salvate</h2>
                {savedSearches.length > 0 && (
                  <Link
                    href="/dashboard/acquirente/ricerche"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Vedi tutte
                  </Link>
                )}
              </div>

              {savedSearches.length === 0 ? (
                <p className="text-sm text-text-muted py-4 text-center">
                  Nessuna ricerca salvata. Salva una ricerca dalla pagina di ricerca per ricevere aggiornamenti.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {savedSearches.slice(0, 5).map((search) => (
                    <li key={search.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-text">{search.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Creata il {new Date(search.createdAt).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                      <Link
                        href={`/ricerca?saved=${search.id}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                      >
                        Apri
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
