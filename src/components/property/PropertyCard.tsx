"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getPropertyTypeLabel, cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyPhoto {
  url: string;
  isCover: boolean;
}

export interface PropertyCardProps {
  property: {
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
    photos: PropertyPhoto[];
  };
}

/* ------------------------------------------------------------------ */
/*  Feature icon helper                                                */
/* ------------------------------------------------------------------ */

function FeatureIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      title={label}
      className="flex items-center gap-1 text-text-muted text-xs"
    >
      {children}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PropertyCard({ property }: PropertyCardProps) {
  const {
    slug,
    title,
    city,
    province,
    price,
    surface,
    rooms,
    bathrooms,
    type,
    hasGarage,
    hasGarden,
    hasBalcony,
    hasElevator,
    photos,
  } = property;

  const coverPhoto =
    photos.find((p) => p.isCover) ?? photos[0] ?? null;

  const hasAnyFeature = hasGarage || hasGarden || hasBalcony || hasElevator;

  return (
    <Link
      href={`/immobile/${slug}`}
      className={cn(
        "group block rounded-2xl overflow-hidden bg-white border border-border",
        "shadow-sm hover:shadow-lg transition-all duration-300 ease-out",
        "hover:scale-[1.02]"
      )}
    >
      {/* ---- Photo ---- */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-soft">
        {coverPhoto ? (
          <Image
            src={coverPhoto.url}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            Nessuna foto
          </div>
        )}

        {/* Commission badge */}
        <span className="absolute top-3 left-3 bg-success/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          0% comm. venditore
        </span>

        {/* Property type badge */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-text text-xs font-medium px-2.5 py-1 rounded-full">
          {getPropertyTypeLabel(type)}
        </span>
      </div>

      {/* ---- Body ---- */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-semibold text-text text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        <p className="text-text-muted text-sm">
          {city}, {province}
        </p>

        {/* Price */}
        <p className="text-primary font-bold text-xl">
          {formatPrice(price)}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-text-muted text-sm pt-1 border-t border-border">
          {/* Surface */}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            {surface} mq
          </span>

          {/* Rooms */}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {rooms} locali
          </span>

          {/* Bathrooms */}
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {bathrooms} bagni
          </span>
        </div>

        {/* Features row */}
        {hasAnyFeature && (
          <div className="flex items-center gap-3 pt-1">
            {hasGarage && (
              <FeatureIcon label="Garage">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m0 0V6.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v3.375m-3.375 0h3.375" />
                </svg>
                <span className="text-xs">Garage</span>
              </FeatureIcon>
            )}
            {hasGarden && (
              <FeatureIcon label="Giardino">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-3.6.9-3.6 4.5 0 1.2.3 2.1.6 2.7C7.2 10.5 4.5 11.4 4.5 14.25c0 2.1 1.5 3.75 3.75 3.75H12m0-15c1.2 0 3.6.9 3.6 4.5 0 1.2-.3 2.1-.6 2.7 1.8.3 4.5 1.2 4.5 4.05 0 2.1-1.5 3.75-3.75 3.75H12m0-15v15m0 0v3" />
                </svg>
                <span className="text-xs">Giardino</span>
              </FeatureIcon>
            )}
            {hasBalcony && (
              <FeatureIcon label="Balcone">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h18M5 13V7a7 7 0 0114 0v6M5 13v4m14-4v4M9 13v4m6-4v4" />
                </svg>
                <span className="text-xs">Balcone</span>
              </FeatureIcon>
            )}
            {hasElevator && (
              <FeatureIcon label="Ascensore">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h16.5V3H3.75zm6 5.25L12 5.25l2.25 3M9.75 15.75L12 18.75l2.25-3" />
                </svg>
                <span className="text-xs">Ascensore</span>
              </FeatureIcon>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
