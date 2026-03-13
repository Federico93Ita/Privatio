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

export default function PropertyMap({ lat, lng, city }: PropertyMapProps) {
  // Use the Google Maps Embed API with API key when available,
  // otherwise fall back to a keyless embed URL
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const hasValidKey = apiKey && apiKey !== "placeholder";

  const mapSrc = hasValidKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15&maptype=roadmap`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-lg text-text">
        Posizione indicativa
      </h3>
      <p className="text-text-muted text-sm">
        Zona {city} &mdash; la posizione esatta viene condivisa dopo il contatto.
      </p>
      <div
        className={cn(
          "relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm",
          "border border-border"
        )}
      >
        <iframe
          src={mapSrc}
          title={`Mappa zona ${city}`}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          allow="fullscreen"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Overlay circle to indicate approximate area */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-[3px] border-primary/60 bg-primary/10" />
        </div>
      </div>
    </div>
  );
}
