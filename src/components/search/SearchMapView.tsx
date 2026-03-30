"use client";

import { useCallback, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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
  lat?: number | null;
  lng?: number | null;
  photos: PropertyPhoto[];
}

interface SearchMapViewProps {
  properties: Property[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

// Center on Italy by default
const DEFAULT_CENTER = { lat: 42.5, lng: 12.5 };
const DEFAULT_ZOOM = 6;

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SearchMapView({ properties }: SearchMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Filter properties with valid coordinates
  const mappableProperties = useMemo(
    () => properties.filter((p) => p.lat && p.lng),
    [properties]
  );

  // Calculate bounds to fit all markers
  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      if (mappableProperties.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        mappableProperties.forEach((p) => {
          bounds.extend({ lat: p.lat!, lng: p.lng! });
        });
        mapInstance.fitBounds(bounds, 60);
        // Don't zoom in too much for a single property
        const listener = google.maps.event.addListener(mapInstance, "idle", () => {
          if (mapInstance.getZoom()! > 15) mapInstance.setZoom(15);
          google.maps.event.removeListener(listener);
        });
      }
    },
    [mappableProperties]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-bg-soft rounded-xl border border-border">
        <p className="text-text-muted text-sm">Errore nel caricamento della mappa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-bg-soft rounded-xl border border-border animate-pulse">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Caricamento mappa...</p>
        </div>
      </div>
    );
  }

  if (mappableProperties.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-bg-soft rounded-xl border border-border">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-text-muted/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          <p className="text-text-muted text-sm">Nessun immobile con coordinate disponibili</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-border shadow-sm">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={() => setSelectedProperty(null)}
      >
        {mappableProperties.map((property) => (
          <MarkerF
            key={property.id}
            position={{ lat: property.lat!, lng: property.lng! }}
            onClick={() => setSelectedProperty(property)}
            title={property.title}
          />
        ))}

        {selectedProperty && selectedProperty.lat && selectedProperty.lng && (
          <InfoWindowF
            position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="max-w-[260px] p-1">
              {selectedProperty.photos?.[0]?.url && (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-2">
                  <img
                    src={selectedProperty.photos[0].url}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-1">
                {selectedProperty.title}
              </h3>
              <p className="text-xs text-gray-500 mb-1">
                {selectedProperty.city} ({selectedProperty.province})
              </p>
              <p className="text-sm font-bold text-primary mb-1">
                {formatPrice(selectedProperty.price)}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span>{selectedProperty.surface} mq</span>
                <span>{selectedProperty.rooms} locali</span>
                <span>{selectedProperty.bathrooms} bagni</span>
              </div>
              <Link
                href={`/immobile/${selectedProperty.slug}`}
                className="block text-center text-xs font-medium text-white bg-primary rounded-md py-1.5 hover:bg-primary/85 transition-colors"
              >
                Vedi dettaglio
              </Link>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
