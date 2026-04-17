/**
 * Shared geocoding utility.
 * Uses OpenStreetMap Nominatim (free, no API key needed) as primary geocoder.
 * Falls back to Google Maps Geocoding API if available.
 *
 * Used by property creation, agency registration, and zone resolution.
 */

export type GeocodeResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; reason: "API_KEY_MISSING" | "API_KEY_INVALID" | "ADDRESS_NOT_FOUND" | "NETWORK_ERROR" };

/**
 * Geocodifica un indirizzo usando Nominatim (OpenStreetMap).
 * Gratuito, senza API key, con fallback a Google se Nominatim fallisce.
 */
export async function geocodeAddress(
  address: string,
  city: string,
  province: string
): Promise<GeocodeResult> {
  // 1. Prova con Nominatim (gratuito, nessuna API key necessaria)
  const nominatimResult = await geocodeWithNominatim(address, city, province);
  if (nominatimResult.ok) return nominatimResult;

  // 2. Fallback a Google Maps Geocoding API (se abilitata)
  return geocodeWithGoogle(address, city, province);
}

async function geocodeWithNominatim(
  address: string,
  city: string,
  province: string
): Promise<GeocodeResult> {
  try {
    const parts = [address, city, province, "Italia"].filter(Boolean);
    const query = parts.join(", ");
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=it`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Privatio/1.0 (https://privatio.it)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      return { ok: false, reason: "NETWORK_ERROR" };
    }

    const data = await res.json();
    if (data.length > 0 && data[0].lat && data[0].lon) {
      return { ok: true, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }

    // Tentativo strutturato: street + city
    if (address.trim()) {
      const structuredUrl = `https://nominatim.openstreetmap.org/search?` +
        `street=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}` +
        `&country=Italy&format=json&limit=1`;
      const res2 = await fetch(structuredUrl, {
        headers: { "User-Agent": "Privatio/1.0 (https://privatio.it)", "Accept": "application/json" },
      });
      const data2 = await res2.json();
      if (data2.length > 0 && data2[0].lat && data2[0].lon) {
        return { ok: true, lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
      }
    }

    return { ok: false, reason: "ADDRESS_NOT_FOUND" };
  } catch (error) {
    console.warn("Nominatim geocoding error:", error);
    return { ok: false, reason: "NETWORK_ERROR" };
  }
}

async function geocodeWithGoogle(
  address: string,
  city: string,
  province: string
): Promise<GeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey || apiKey === "placeholder") {
    return { ok: false, reason: "API_KEY_MISSING" };
  }

  try {
    const parts = [address, city, province, "Italia"].filter(Boolean);
    const query = encodeURIComponent(parts.join(", "));
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return { ok: true, lat, lng };
    }

    if (data.status === "REQUEST_DENIED" || data.status === "OVER_QUERY_LIMIT") {
      return { ok: false, reason: "API_KEY_INVALID" };
    }

    return { ok: false, reason: "ADDRESS_NOT_FOUND" };
  } catch (error) {
    console.error("Google geocoding error:", error);
    return { ok: false, reason: "NETWORK_ERROR" };
  }
}
