"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/property/PropertyCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const SearchMapView = dynamic(() => import("@/components/search/SearchMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] bg-[#F8F6F1] rounded-3xl border border-[#C9A84C]/[0.08] animate-pulse">
      <p className="text-[#0B1D3A]/50 text-sm">Caricamento mappa...</p>
    </div>
  ),
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyPhoto {
  url: string;
  isCover: boolean;
}

interface Property {
  id: string;
  slug: string;
  title: string;
  city: string;
  province: string;
  price: number;
  surface: number;
  rooms: number;
  bathrooms: number;
  type: string;
  hasGarage: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  lat?: number | null;
  lng?: number | null;
  photos: PropertyPhoto[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  minSurface: string;
  maxSurface: string;
  rooms: string;
  hasGarage: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  sort: string;
  page: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PROPERTY_TYPES = [
  { value: "", label: "Tutti i tipi" },
  { value: "APPARTAMENTO", label: "Appartamento" },
  { value: "VILLA", label: "Villa" },
  { value: "CASA_INDIPENDENTE", label: "Casa Indipendente" },
  { value: "ATTICO", label: "Attico" },
  { value: "MANSARDA", label: "Mansarda" },
  { value: "LOFT", label: "Loft" },
  { value: "TERRENO", label: "Terreno" },
  { value: "NEGOZIO", label: "Negozio" },
  { value: "UFFICIO", label: "Ufficio" },
];

const ROOM_OPTIONS = [
  { value: "", label: "Qualsiasi" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Più recenti" },
  { value: "price_asc", label: "Prezzo crescente" },
  { value: "price_desc", label: "Prezzo decrescente" },
  { value: "surface_desc", label: "Superficie" },
];

const DEFAULT_FILTERS: Filters = {
  city: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  minSurface: "",
  maxSurface: "",
  rooms: "",
  hasGarage: false,
  hasGarden: false,
  hasBalcony: false,
  hasElevator: false,
  sort: "newest",
  page: 1,
};

/* ------------------------------------------------------------------ */
/*  Inner component that uses useSearchParams (needs Suspense)         */
/* ------------------------------------------------------------------ */

function CercaPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---- Initialize filters from URL ---- */
  const getInitialFilters = useCallback((): Filters => {
    return {
      city: searchParams.get("city") || "",
      type: searchParams.get("type") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minSurface: searchParams.get("minSurface") || "",
      maxSurface: searchParams.get("maxSurface") || "",
      rooms: searchParams.get("rooms") || "",
      hasGarage: searchParams.get("hasGarage") === "true",
      hasGarden: searchParams.get("hasGarden") === "true",
      hasBalcony: searchParams.get("hasBalcony") === "true",
      hasElevator: searchParams.get("hasElevator") === "true",
      sort: searchParams.get("sort") || "newest",
      page: parseInt(searchParams.get("page") || "1"),
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<Filters>(getInitialFilters);
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [saveSearchMsg, setSaveSearchMsg] = useState<string | null>(null);

  /* ---- Fetch city suggestions for autocomplete ---- */
  useEffect(() => {
    fetch("/api/properties/cities")
      .then((r) => r.json())
      .then((data) => {
        if (data.cities) {
          setCitySuggestions(data.cities.map((c: { label: string }) => c.label));
        }
      })
      .catch(() => {});
  }, []);

  /* ---- Build query string from filters ---- */
  const buildQueryString = useCallback((f: Filters): string => {
    const params = new URLSearchParams();
    if (f.city) params.set("city", f.city);
    if (f.type) params.set("type", f.type);
    if (f.minPrice) params.set("minPrice", f.minPrice);
    if (f.maxPrice) params.set("maxPrice", f.maxPrice);
    if (f.minSurface) params.set("minSurface", f.minSurface);
    if (f.maxSurface) params.set("maxSurface", f.maxSurface);
    if (f.rooms) params.set("rooms", f.rooms);
    if (f.hasGarage) params.set("hasGarage", "true");
    if (f.hasGarden) params.set("hasGarden", "true");
    if (f.hasBalcony) params.set("hasBalcony", "true");
    if (f.hasElevator) params.set("hasElevator", "true");
    if (f.sort && f.sort !== "newest") params.set("sort", f.sort);
    if (f.page > 1) params.set("page", String(f.page));
    return params.toString();
  }, []);

  /* ---- Fetch properties ---- */
  const fetchProperties = useCallback(
    async (f: Filters) => {
      setLoading(true);
      try {
        const qs = buildQueryString(f);
        const res = await fetch(`/api/properties${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setProperties(data.properties || []);
        setPagination(data.pagination || null);
      } catch {
        setProperties([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString]
  );

  /* ---- Sync URL and fetch on filter/page/sort change ---- */
  useEffect(() => {
    const qs = buildQueryString(filters);
    router.push(`/cerca${qs ? `?${qs}` : ""}`, { scroll: false });
    fetchProperties(filters);
  }, [filters, buildQueryString, router, fetchProperties]);

  /* ---- Filter handlers ---- */
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- Render helpers ---- */
  const inputClass = cn(
    "w-full rounded-lg border border-[#0B1D3A]/10 px-3 py-2.5 text-sm",
    "focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50",
    "transition-colors bg-white text-[#0B1D3A] placeholder:text-[#0B1D3A]/40"
  );

  const selectClass = cn(
    "w-full rounded-lg border border-[#0B1D3A]/10 px-3 py-2.5 text-sm appearance-none",
    "focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50",
    "transition-colors bg-white text-[#0B1D3A]"
  );

  /* ---------------------------------------------------------------- */
  /*  Filters sidebar content (shared between desktop and mobile)      */
  /* ---------------------------------------------------------------- */

  const filtersContent = (
    <div className="space-y-5">
      {/* Citta */}
      <div className="space-y-1.5">
        <label htmlFor="filter-city" className="block text-sm font-medium text-[#0B1D3A]">
          Citta
        </label>
        <input
          id="filter-city"
          type="text"
          list="city-suggestions"
          placeholder="Es. Milano, Roma..."
          value={filters.city}
          onChange={(e) => updateFilter("city", e.target.value)}
          className={inputClass}
          autoComplete="off"
        />
        <datalist id="city-suggestions">
          {citySuggestions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      {/* Tipo immobile */}
      <div className="space-y-1.5">
        <label htmlFor="filter-type" className="block text-sm font-medium text-[#0B1D3A]">
          Tipo immobile
        </label>
        <select
          id="filter-type"
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value)}
          className={selectClass}
        >
          {PROPERTY_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prezzo */}
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-[#0B1D3A]">Prezzo</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className={inputClass}
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className={inputClass}
            min={0}
          />
        </div>
      </div>

      {/* Superficie */}
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-[#0B1D3A]">Superficie (mq)</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minSurface}
            onChange={(e) => updateFilter("minSurface", e.target.value)}
            className={inputClass}
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxSurface}
            onChange={(e) => updateFilter("maxSurface", e.target.value)}
            className={inputClass}
            min={0}
          />
        </div>
      </div>

      {/* N. locali */}
      <div className="space-y-1.5">
        <label htmlFor="filter-rooms" className="block text-sm font-medium text-[#0B1D3A]">
          N. locali
        </label>
        <select
          id="filter-rooms"
          value={filters.rooms}
          onChange={(e) => updateFilter("rooms", e.target.value)}
          className={selectClass}
        >
          {ROOM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Caratteristiche */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-[#0B1D3A]">Caratteristiche</span>
        {[
          { key: "hasGarage" as const, label: "Garage" },
          { key: "hasGarden" as const, label: "Giardino" },
          { key: "hasBalcony" as const, label: "Balcone" },
          { key: "hasElevator" as const, label: "Ascensore" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={(e) => updateFilter(key, e.target.checked)}
              className="h-4 w-4 rounded border-[#0B1D3A]/20 accent-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <span className="text-sm text-[#0B1D3A]/80">{label}</span>
          </label>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={handleSearch}
          className={cn(
            "w-full rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-4 py-2.5 text-sm font-semibold text-[#0B1D3A]",
            "hover:opacity-90 transition-opacity shadow-sm"
          )}
        >
          Cerca
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={cn(
            "w-full px-4 py-2.5 text-sm font-medium text-[#0B1D3A]/50",
            "hover:text-[#0B1D3A]/80 transition-colors"
          )}
        >
          Reset filtri
        </button>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Pagination component                                              */
  /* ---------------------------------------------------------------- */

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;
    const pages: (number | string)[] = [];

    // Build page numbers with ellipsis
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <nav className="flex items-center justify-center gap-1.5 pt-8" aria-label="Navigazione pagine">
        {/* Previous */}
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            page === 1
              ? "text-[#0B1D3A]/25 cursor-not-allowed"
              : "text-[#0B1D3A]/60 hover:bg-[#C9A84C]/10 hover:text-[#0B1D3A]"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Prec.
        </button>

        {/* Page numbers */}
        {pages.map((p, idx) =>
          typeof p === "string" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-[#0B1D3A]/40 text-sm">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-[40px]",
                p === page
                  ? "bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] shadow-sm"
                  : "text-[#0B1D3A]/60 hover:bg-[#C9A84C]/10 hover:text-[#0B1D3A]"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            page === totalPages
              ? "text-[#0B1D3A]/25 cursor-not-allowed"
              : "text-[#0B1D3A]/60 hover:bg-[#C9A84C]/10 hover:text-[#0B1D3A]"
          )}
        >
          Succ.
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </nav>
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Main render                                                       */
  /* ---------------------------------------------------------------- */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#F8F6F1]">
        {/* ---- Navy hero strip ---- */}
        <section className="relative overflow-hidden bg-[#0B1D3A] pt-28 pb-12 md:pt-32 md:pb-14">
          {/* Grain texture overlay */}
          <div className="grain pointer-events-none absolute inset-0 z-[1]" />
          {/* Gradient orb */}
          <div className="pointer-events-none absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-[#C9A84C]/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-60 w-60 rounded-full bg-[#C9A84C]/[0.06] blur-[80px]" />

          <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-3">
              Cerca Casa
            </p>
            <h1 className="font-heading text-3xl font-light tracking-[-0.03em] sm:text-4xl text-white">
              Cerca il tuo immobile
            </h1>
            <p className="mt-2 text-white/60 text-base max-w-xl">
              Trova la casa dei tuoi sogni tra gli immobili disponibili sulla piattaforma.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* ---- Mobile filter toggle ---- */}
          <div className="lg:hidden mb-6">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={cn(
                "flex items-center gap-2 rounded-3xl border border-[#C9A84C]/30 bg-white px-5 py-3",
                "text-sm font-medium text-[#0B1D3A] shadow-sm hover:bg-[#C9A84C]/5 transition-colors w-full justify-center"
              )}
            >
              <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              {mobileFiltersOpen ? "Chiudi filtri" : "Mostra filtri"}
            </button>

            {/* Mobile filters panel */}
            {mobileFiltersOpen && (
              <div className="mt-4 rounded-3xl border border-[#C9A84C]/[0.08] bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-medium text-[#0B1D3A] mb-4">
                  Filtri
                </h2>
                {filtersContent}
              </div>
            )}
          </div>

          <div className="flex gap-8">
            {/* ---- Desktop sidebar ---- */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-28 rounded-3xl border border-[#C9A84C]/[0.08] bg-white p-6 shadow-sm">
                <h2 className="font-heading text-lg font-medium text-[#0B1D3A] mb-4">
                  Filtri
                </h2>
                {filtersContent}
              </div>
            </aside>

            {/* ---- Results area ---- */}
            <div className="flex-1 min-w-0">
              {/* Results header: count + sort */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <p className="text-[#0B1D3A]/50 text-sm">
                  {loading ? (
                    "Ricerca in corso..."
                  ) : pagination ? (
                    <>
                      <span className="font-semibold text-[#0B1D3A]">{pagination.total}</span>{" "}
                      {pagination.total === 1 ? "immobile trovato" : "immobili trovati"}
                    </>
                  ) : (
                    "Nessun risultato"
                  )}
                </p>

                <div className="flex items-center gap-3">
                  {/* View mode toggle */}
                  <div className="flex rounded-lg border border-[#0B1D3A]/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2 transition-colors",
                        viewMode === "grid"
                          ? "bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A]"
                          : "bg-white text-[#0B1D3A]/40 hover:bg-[#C9A84C]/5"
                      )}
                      title="Vista griglia"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("map")}
                      className={cn(
                        "p-2 transition-colors",
                        viewMode === "map"
                          ? "bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A]"
                          : "bg-white text-[#0B1D3A]/40 hover:bg-[#C9A84C]/5"
                      )}
                      title="Vista mappa"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Save search button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setSaveSearchMsg(null);
                      const activeFilters: Record<string, unknown> = {};
                      if (filters.city) activeFilters.city = filters.city;
                      if (filters.type) activeFilters.type = filters.type;
                      if (filters.minPrice) activeFilters.minPrice = filters.minPrice;
                      if (filters.maxPrice) activeFilters.maxPrice = filters.maxPrice;
                      if (filters.minSurface) activeFilters.minSurface = filters.minSurface;
                      if (filters.maxSurface) activeFilters.maxSurface = filters.maxSurface;
                      if (filters.rooms) activeFilters.rooms = filters.rooms;
                      if (filters.hasGarage) activeFilters.hasGarage = true;
                      if (filters.hasGarden) activeFilters.hasGarden = true;
                      if (filters.hasBalcony) activeFilters.hasBalcony = true;
                      if (filters.hasElevator) activeFilters.hasElevator = true;

                      const name = filters.city
                        ? `Ricerca ${filters.city}${filters.type ? ` — ${filters.type}` : ""}`
                        : `Ricerca ${new Date().toLocaleDateString("it-IT")}`;

                      try {
                        const res = await fetch("/api/saved-searches", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name, filters: activeFilters }),
                        });
                        if (res.ok) {
                          setSaveSearchMsg("Ricerca salvata!");
                          setTimeout(() => setSaveSearchMsg(null), 3000);
                        } else if (res.status === 401) {
                          setSaveSearchMsg("Accedi per salvare le ricerche");
                          setTimeout(() => setSaveSearchMsg(null), 3000);
                        } else {
                          const data = await res.json();
                          setSaveSearchMsg(data.error || "Errore");
                          setTimeout(() => setSaveSearchMsg(null), 3000);
                        }
                      } catch {
                        setSaveSearchMsg("Errore di connessione");
                        setTimeout(() => setSaveSearchMsg(null), 3000);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#C9A84C]/20 bg-white px-3 py-2 text-sm text-[#0B1D3A]/60 hover:bg-[#C9A84C]/5 hover:text-[#C9A84C] transition-colors"
                    title="Salva questa ricerca"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="hidden sm:inline">Salva ricerca</span>
                  </button>
                  {saveSearchMsg && (
                    <span className="text-xs text-[#C9A84C] font-medium">{saveSearchMsg}</span>
                  )}

                  <label htmlFor="sort-select" className="text-sm text-[#0B1D3A]/50 whitespace-nowrap">
                    Ordina per:
                  </label>
                  <select
                    id="sort-select"
                    value={filters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className={cn(
                      "rounded-lg border border-[#0B1D3A]/10 px-3 py-2 text-sm bg-white text-[#0B1D3A]",
                      "focus:outline-none focus:ring-1 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50",
                      "transition-colors appearance-none"
                    )}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loading skeletons */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && properties.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-[#C9A84C]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[#0B1D3A] mb-1">
                    Nessun immobile trovato
                  </h3>
                  <p className="text-[#0B1D3A]/50 text-sm max-w-sm">
                    Prova a modificare i filtri per ampliare la ricerca.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-5 py-2.5 text-sm font-semibold text-[#0B1D3A] hover:opacity-90 transition-opacity"
                  >
                    Reset filtri
                  </button>
                </div>
              )}

              {/* Results grid or map */}
              {!loading && properties.length > 0 && viewMode === "grid" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                  {renderPagination()}
                </>
              )}

              {!loading && properties.length > 0 && viewMode === "map" && (
                <SearchMapView properties={properties} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper with Suspense for useSearchParams                      */
/* ------------------------------------------------------------------ */

export default function CercaPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="min-h-screen bg-[#F8F6F1]">
            {/* Navy hero strip skeleton */}
            <section className="relative overflow-hidden bg-[#0B1D3A] pt-28 pb-12 md:pt-32 md:pb-14">
              <div className="grain pointer-events-none absolute inset-0 z-[1]" />
              <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-3" />
                <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
                <div className="mt-2 h-5 w-96 bg-white/10 rounded animate-pulse" />
              </div>
            </section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:ml-80">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <CercaPageInner />
    </Suspense>
  );
}
