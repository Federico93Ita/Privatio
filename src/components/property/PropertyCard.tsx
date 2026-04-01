"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getPropertyTypeLabel, cn } from "@/lib/utils";
import { getDemoCover } from "@/lib/demo-images";
import FavoriteButton from "@/components/property/FavoriteButton";

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
    hasParkingSpace?: boolean;
    hasCellar?: boolean;
    hasTerrace?: boolean;
    hasPool?: boolean;
    hasAirConditioning?: boolean;
    isFurnished?: boolean;
    hasConcierge?: boolean;
    hasAlarm?: boolean;
    photos: PropertyPhoto[];
  };
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
    photos,
  } = property;

  const coverPhoto =
    photos.find((p) => p.isCover) ?? photos[0] ?? null;

  // Build feature labels from all boolean flags
  const featureLabels: string[] = [];
  if (property.hasGarage) featureLabels.push("Garage");
  if (property.hasParkingSpace) featureLabels.push("Posto auto");
  if (property.hasGarden) featureLabels.push("Giardino");
  if (property.hasBalcony) featureLabels.push("Balcone");
  if (property.hasTerrace) featureLabels.push("Terrazza");
  if (property.hasElevator) featureLabels.push("Ascensore");
  if (property.hasCellar) featureLabels.push("Cantina");
  if (property.hasPool) featureLabels.push("Piscina");
  if (property.hasAirConditioning) featureLabels.push("A/C");
  if (property.isFurnished) featureLabels.push("Arredato");
  if (property.hasConcierge) featureLabels.push("Portineria");
  if (property.hasAlarm) featureLabels.push("Allarme");

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
          <>
            <Image
              src={getDemoCover(type)}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Foto illustrativa
            </span>
          </>
        )}

        {/* Commission badge */}
        <span className="absolute top-3 left-3 bg-success/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          0% comm. venditore
        </span>

        {/* Property type badge */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-text text-xs font-medium px-2.5 py-1 rounded-full">
          {getPropertyTypeLabel(type)}
        </span>

        {/* Favorite button */}
        <FavoriteButton
          propertyId={property.id}
          variant="icon"
          className="absolute bottom-3 right-3"
        />
      </div>

      {/* ---- Body ---- */}
      <div className="p-4 flex flex-col gap-2">
        {/* Title */}
        <h3 className="font-medium text-text text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Location */}
        <p className="text-text-muted text-sm">
          {city}, {province}
        </p>

        {/* Price */}
        <p className="text-primary font-semibold text-xl">
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
        {featureLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {featureLabels.slice(0, 5).map((label) => (
              <span key={label} className="text-xs text-text-muted bg-bg-soft px-2 py-0.5 rounded-full">
                {label}
              </span>
            ))}
            {featureLabels.length > 5 && (
              <span className="text-xs text-text-muted bg-bg-soft px-2 py-0.5 rounded-full">
                +{featureLabels.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
