/**
 * Shared geocoding utility using Google Maps Geocoding API.
 * Used by property creation and agency registration/settings.
 */

export async function geocodeAddress(
  address: string,
  city: string,
  province: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) {
    console.warn("NEXT_PUBLIC_GOOGLE_MAPS_KEY not set — skipping geocoding");
    return null;
  }

  try {
    const query = encodeURIComponent(`${address}, ${city}, ${province}, Italia`);
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }

    console.warn(`Geocoding failed for "${address}, ${city}, ${province}": ${data.status}`);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
