import { geocodeAddress, GeocodingResult } from './geocoding';
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
  const contactsToGeocode = MOCK_CONTACTS.filter(
    c => !geocodedContacts.has(c.id) && c.address && (!c.location_lat || c.location_lat === 0)
  );

  if (contactsToGeocode.length === 0) {
    console.log('All contacts already geocoded');
    return;
  }

  console.log(`Starting background geocoding for ${contactsToGeocode.length} contacts`);

  progress.isRunning = true;
  progress.startTime = Date.now();
  saveProgress(progress);

  // Process contacts in batches with delays to respect rate limits
  let geocodedCount = 0;
  let failedCount = 0;

  for (const contact of contactsToGeocode) {
    if (!progress.isRunning) break;

    try {
      const result = await geocodeAddress(contact.address);
      
      if (result) {
        // Update contact with coordinates and address details
        contact.location_lat = result.lat;
        contact.location_lng = result.lng;
        
        // Update address fields with standardized city, state, zipcode
        if (result.city) contact.city = result.city;
        if (result.state) contact.state = result.state;
        if (result.zipcode) contact.zip = result.zipcode;
        
        geocodedContacts.add(contact.id);
        geocodedCount++;
      } else {
        failedCount++;
        if (!progress.failedAddresses.includes(contact.address)) {
          progress.failedAddresses.push(contact.address);
        }
      }

      progress.geocodedContacts = geocodedCount;
      progress.lastUpdated = Date.now();
      saveProgress(progress);
      saveGeocodedContacts(geocodedContacts);

      // Log progress every 50 contacts
      if ((geocodedCount + failedCount) % 50 === 0) {
        console.log(
          `Geocoding progress: ${geocodedCount} succeeded, ${failedCount} failed of ${contactsToGeocode.length} total`
        );
        // Dispatch custom event for UI updates
        window.dispatchEvent(
          new CustomEvent('geocodingProgress', {
            detail: { geocoded: geocodedCount, failed: failedCount, total: contactsToGeocode.length },
          })
        );
      }
    } catch (error) {
      console.error(`Error geocoding ${contact.company}:`, error);
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
  console.log('Geocoding progress reset');
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
