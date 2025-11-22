// OpenStreetMap Nominatim geocoding API
// Free geocoding service - no API key required
// Rate limit: 1 request per second

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    postcode?: string;
    city?: string;
    town?: string;
    state?: string;
  };
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zipcode?: string;
  fullAddress?: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const CACHE = new Map<string, GeocodingResult>();
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

function parseAddressFromResult(result: NominatimResult): { city?: string; state?: string; zipcode?: string } {
  const addr = result.address || {};
  
  // Try to extract city (prefer city, fallback to town)
  const city = addr.city || addr.town;
  
  // Extract state and zipcode
  const state = addr.state;
  const zipcode = addr.postcode;

  return { city, state, zipcode };
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
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
      addressdetails: '1',
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
    const addressDetails = parseAddressFromResult(result);
    
    const geocodeResult: GeocodingResult = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city: addressDetails.city,
      state: addressDetails.state,
      zipcode: addressDetails.zipcode,
      fullAddress: result.display_name,
    };

    // Cache the result
    CACHE.set(address, geocodeResult);

    return geocodeResult;
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error);
    return null;
  }
}

export async function geocodeAddresses(addresses: string[]): Promise<Map<string, GeocodingResult>> {
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
