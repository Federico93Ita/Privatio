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
  // Google Maps embed URL showing the approximate area (zoom 14 = neighbourhood level)
  // Using the embed API which does not require an API key for simple place embeds
  const mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d5000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sit!4v1`;

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
          allowFullScreen={false}
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
