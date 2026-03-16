/**
 * Shared geocoding utility using Google Maps Geocoding API.
 * Used by property creation and agency registration/settings.
 */

export type GeocodeResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; reason: "API_KEY_MISSING" | "API_KEY_INVALID" | "ADDRESS_NOT_FOUND" | "NETWORK_ERROR" };

export async function geocodeAddress(
  address: string,
  city: string,
  province: string
): Promise<GeocodeResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey || apiKey === "placeholder") {
    console.error("NEXT_PUBLIC_GOOGLE_MAPS_KEY not configured — geocoding will fail. Set a valid Google Maps API key.");
    return { ok: false, reason: "API_KEY_MISSING" };
  }

  try {
    const query = encodeURIComponent(`${address}, ${city}, ${province}, Italia`);
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return { ok: true, lat, lng };
    }

    if (data.status === "REQUEST_DENIED" || data.status === "OVER_QUERY_LIMIT") {
      console.error(`Geocoding API key error: ${data.status} — ${data.error_message || "check API key and billing"}`);
      return { ok: false, reason: "API_KEY_INVALID" };
    }

    console.warn(`Geocoding: address not found for "${address}, ${city}, ${province}": ${data.status}`);
    return { ok: false, reason: "ADDRESS_NOT_FOUND" };
  } catch (error) {
    console.error("Geocoding network error:", error);
    return { ok: false, reason: "NETWORK_ERROR" };
  }
}
