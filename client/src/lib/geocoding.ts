// OpenStreetMap Nominatim geocoding API
// Free geocoding service - no API key required
// Rate limit: 1 request per second

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const CACHE = new Map<string, { lat: number; lng: number }>();
let lastRequestTime = 0;
const REQUEST_DELAY = 1100; // 1.1 second delay to respect rate limits

// Delay between requests to respect Nominatim rate limits
async function respectRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;

  // Check cache first
  if (CACHE.has(address)) {
    return CACHE.get(address)!;
  }

  try {
    await respectRateLimit();

    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'QuantumPunch-CRM/1.0',
      },
    });

    if (!response.ok) {
      console.warn(`Geocoding failed for "${address}": ${response.status}`);
      return null;
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      console.warn(`No results found for address: "${address}"`);
      return null;
    }

    const result = results[0];
    const coords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    // Cache the result
    CACHE.set(address, coords);

    return coords;
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error);
    return null;
  }
}

export async function geocodeAddresses(addresses: string[]): Promise<Map<string, { lat: number; lng: number }>> {
  const results = new Map();

  for (const address of addresses) {
    const coords = await geocodeAddress(address);
    if (coords) {
      results.set(address, coords);
    }
  }

  return results;
}

export function clearGeocodingCache() {
  CACHE.clear();
}
