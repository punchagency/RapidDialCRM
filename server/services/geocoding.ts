/**
 * Geocoding Service
 * Converts addresses to latitude/longitude coordinates
 * Uses HERE Maps Geocoding API
 */

const HERE_API_KEY = process.env.HERE_API_KEY || "SOcYV3yCX4aztYkg3m5LTpQW4d1hHXBZo--Ue8HvzdY";

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({
      q: address,
      apikey: HERE_API_KEY,
    });

    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?${params}`,
      { method: "GET" }
    );

    if (!response.ok) {
      console.error(`Geocoding error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        latitude: item.position.lat,
        longitude: item.position.lng,
        address: item.address.label,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function geocodeProspects(
  prospects: Array<{ id: string; addressStreet?: string; addressCity?: string; addressState?: string; addressZip?: string }>
): Promise<Array<{ id: string; lat: number; lng: number }>> {
  const results: Array<{ id: string; lat: number; lng: number }> = [];

  for (const prospect of prospects) {
    const address = [
      prospect.addressStreet,
      prospect.addressCity,
      prospect.addressState,
      prospect.addressZip,
    ]
      .filter(Boolean)
      .join(", ");

    if (!address) continue;

    const result = await geocodeAddress(address);
    if (result) {
      results.push({
        id: prospect.id,
        lat: result.latitude,
        lng: result.longitude,
      });
    }

    // Rate limiting - wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
