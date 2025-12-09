import { geocodeAddress, GeocodingResult, clearGeocodingCache } from './geocoding';
import { MOCK_CONTACTS } from './mockData';

interface GeocodingProgress {
  totalContacts: number;
  geocodedContacts: number;
  failedAddresses: string[];
  isRunning: boolean;
  startTime: number;
  lastUpdated: number;
}

const PROGRESS_KEY = 'geocoding_progress';
const GEOCODED_CONTACTS_KEY = 'geocoded_contacts';

export function getGeocodingProgress(): GeocodingProgress {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return getDefaultProgress();
    }
  }
  return getDefaultProgress();
}

function getDefaultProgress(): GeocodingProgress {
  return {
    totalContacts: MOCK_CONTACTS.length,
    geocodedContacts: 0,
    failedAddresses: [],
    isRunning: false,
    startTime: 0,
    lastUpdated: Date.now(),
  };
}

function saveProgress(progress: GeocodingProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getGeocodedContacts(): Set<string> {
  const stored = localStorage.getItem(GEOCODED_CONTACTS_KEY);
  if (stored) {
    try {
      return new Set(JSON.parse(stored));
    } catch (e) {
      return new Set();
    }
  }
  return new Set();
}

function saveGeocodedContacts(contacts: Set<string>) {
  localStorage.setItem(GEOCODED_CONTACTS_KEY, JSON.stringify(Array.from(contacts)));
}

export async function startBackgroundGeocoding() {
  const progress = getGeocodingProgress();
  
  if (progress.isRunning) {
    console.log('Geocoding already in progress');
    return;
  }

  const geocodedContacts = getGeocodedContacts();
  
  // Filter contacts that need processing
  // User requested to "check every address one by one", so we are enabling a full pass
  // We only skip if it's already in the 'geocodedContacts' set AND we are not forcing a re-check.
  // However, to ensure we check everyone, we will largely ignore the 'perfect' checks for now
  // and let the geocodedContacts set be the only source of truth for "done-ness" in this session.
  
  const prospectsToGeocode = MOCK_CONTACTS.filter(c => {
    if (!c.address) return false;
    
    // If we have already processed this ID in this current run/session (tracked by localStorage), skip it.
    if (geocodedContacts.has(c.id)) return false;
    
    return true;
  });
  
  // Prioritize prospects missing city/state/zip
  prospectsToGeocode.sort((a, b) => {
    const aMissingDetails = !a.city || !a.state || !a.zip;
    const bMissingDetails = !b.city || !b.state || !b.zip;
    
    if (aMissingDetails && !bMissingDetails) return -1; // a comes first
    if (!aMissingDetails && bMissingDetails) return 1; // b comes first
    return 0;
  });

  if (prospectsToGeocode.length === 0) {
    console.log('All prospects already geocoded');
    return;
  }

  console.log(`Starting background geocoding for ${prospectsToGeocode.length} prospects`);

  progress.isRunning = true;
  progress.startTime = Date.now();
  saveProgress(progress);

  // Process prospects in batches with delays to respect rate limits
  let geocodedCount = 0;
  let failedCount = 0;

  for (const prospect of prospectsToGeocode) {
    if (!progress.isRunning) break;

    try {
      const result = await geocodeAddress(prospect.address);
      
      if (result) {
        // Update prospect with coordinates and address details
        prospect.location_lat = result.lat;
        prospect.location_lng = result.lng;
        
        // Update address fields with standardized city, state, zipcode (all as strings)
        if (result.city) prospect.city = result.city;
        if (result.state) prospect.state = result.state;
        if (result.zipcode) prospect.zip = String(result.zipcode);
        
        // Update full address from geocoder if available
        // This fixes cases where we only have a partial address (e.g. "7574 Pembroke Rd")
        if (result.fullAddress) {
          prospect.address = result.fullAddress;
        }
        
        geocodedContacts.add(prospect.id);
        geocodedCount++;
      } else {
        failedCount++;
        if (!progress.failedAddresses.includes(prospect.address)) {
          progress.failedAddresses.push(prospect.address);
        }
      }

      progress.geocodedContacts = geocodedCount;
      progress.lastUpdated = Date.now();
      saveProgress(progress);
      saveGeocodedContacts(geocodedContacts);

      // Dispatch custom event for every prospect (real-time updates)
      window.dispatchEvent(
        new CustomEvent('geocodingProgress', {
          detail: { geocoded: geocodedCount, failed: failedCount, total: prospectsToGeocode.length },
        })
      );

      // Log progress every 50 prospects
      if ((geocodedCount + failedCount) % 50 === 0) {
        console.log(
          `Geocoding progress: ${geocodedCount} succeeded, ${failedCount} failed of ${prospectsToGeocode.length} total`
        );
      }
    } catch (error) {
      console.error(`Error geocoding ${prospect.company}:`, error);
      failedCount++;
    }
  }

  progress.isRunning = false;
  progress.lastUpdated = Date.now();
  saveProgress(progress);

  console.log(
    `Background geocoding completed: ${geocodedCount} succeeded, ${failedCount} failed`
  );

  // Dispatch final completion event
  window.dispatchEvent(
    new CustomEvent('geocodingComplete', {
      detail: { geocoded: geocodedCount, failed: failedCount, total: contactsToGeocode.length },
    })
  );
}

export function stopBackgroundGeocoding() {
  const progress = getGeocodingProgress();
  progress.isRunning = false;
  saveProgress(progress);
  console.log('Background geocoding stopped');
}

export function resetGeocodingProgress() {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(GEOCODED_CONTACTS_KEY);
  // Also clear the geocoding cache so addresses are re-fetched
  clearGeocodingCache();
  console.log('Geocoding progress reset and cache cleared');
}

export function getGeocodingStats() {
  const progress = getGeocodingProgress();
  
  // Count already geocoded contacts in mockData
  const alreadyGeocoded = MOCK_CONTACTS.filter(c => c.location_lat && c.location_lat !== 0).length;
  const totalUngeocoded = MOCK_CONTACTS.filter(c => c.address && (!c.location_lat || c.location_lat === 0)).length;
  
  // Total geocoded = already geocoded + newly geocoded
  const totalGeocoded = alreadyGeocoded + progress.geocodedContacts;
  const remaining = totalUngeocoded - progress.geocodedContacts;
  const elapsedSeconds = progress.startTime ? Math.floor((Date.now() - progress.startTime) / 1000) : 0;
  const ratePerSecond = elapsedSeconds > 0 ? (progress.geocodedContacts / elapsedSeconds).toFixed(2) : '0';

  return {
    ...progress,
    alreadyGeocoded,
    totalGeocoded,
    totalUngeocoded,
    remaining,
    elapsedSeconds,
    ratePerSecond: parseFloat(ratePerSecond as string),
  };
}

