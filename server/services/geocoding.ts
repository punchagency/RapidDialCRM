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

export interface FullAddressResult {
  latitude: number;
  longitude: number;
  fullAddress: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
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

export async function getFullAddressFromHere(address: string): Promise<FullAddressResult | null> {
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
      const addr = item.address;
      return {
        latitude: item.position.lat,
        longitude: item.position.lng,
        fullAddress: addr.label,
        street: addr.street || addr.houseNumber ? `${addr.houseNumber || ''} ${addr.street || ''}`.trim() : undefined,
        city: addr.city,
        state: addr.stateCode,
        zip: addr.postalCode,
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

export interface ProfessionalSearchResult {
  name: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude: number;
  longitude: number;
  category?: string;
}

export async function searchProfessionalsByLocation(
  specialty: string,
  location: string,
  radius: number = 5000
): Promise<ProfessionalSearchResult[]> {
  try {
    // First geocode the location to get coordinates
    const locationResult = await geocodeAddress(location);
    if (!locationResult) {
      return [];
    }

    // Map specialty to HERE category codes
    const categoryMap: Record<string, string> = {
      "dental": "dentist",
      "dentist": "dentist",
      "chiropractor": "chiropractor",
      "optometry": "optometrist",
      "optometrist": "optometrist",
      "physical therapy": "physical-therapist",
      "physical therapist": "physical-therapist",
      "orthodontics": "dentist",
      "orthodontist": "dentist",
    };

    const hereCategory = categoryMap[specialty.toLowerCase()] || specialty.toLowerCase();

    const params = new URLSearchParams({
      at: `${locationResult.latitude},${locationResult.longitude}`,
      q: hereCategory,
      limit: "50",
      apikey: HERE_API_KEY,
    });

    const response = await fetch(
      `https://discover.search.hereapi.com/v1/discover?${params}`,
      { method: "GET" }
    );

    if (!response.ok) {
      console.error(`Search error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results: ProfessionalSearchResult[] = [];

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const addr = item.address;
        results.push({
          name: item.title || "",
          phone: item.contacts?.phone?.[0]?.value,
          address: addr.label || "",
          city: addr.city,
          state: addr.stateCode,
          zip: addr.postalCode,
          latitude: item.position.lat,
          longitude: item.position.lng,
          category: item.resultType,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Professional search error:", error);
    return [];
  }
}
