"use client";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyMapProps {
  lat: number;
  lng: number;
  city: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PropertyMap({ lat, lng }: PropertyMapProps) {
  // Use the Google Maps Embed API with API key when available,
  // otherwise fall back to a keyless embed URL
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const hasValidKey = apiKey && apiKey !== "placeholder";

  const mapSrc = hasValidKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15&maptype=roadmap`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div
      className={cn(
        "relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm",
        "border border-border"
      )}
    >
      <iframe
        src={mapSrc}
        title="Posizione dell'immobile"
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        allowFullScreen
        allow="fullscreen"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
