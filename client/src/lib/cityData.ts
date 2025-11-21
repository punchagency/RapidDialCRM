export interface City {
  id: string;
  name: string;
  state: string;
  label: string;
  center: [number, number];
  zoom: number;
}

export const CITIES: Record<string, City> = {
  miami: {
    id: "miami",
    name: "Miami",
    state: "FL",
    label: "Miami, FL",
    center: [25.7617, -80.1918],
    zoom: 12,
  },
  washington_dc: {
    id: "washington_dc",
    name: "Washington, DC",
    state: "DC",
    label: "Washington, DC",
    center: [38.9072, -77.0369],
    zoom: 12,
  },
  los_angeles: {
    id: "los_angeles",
    name: "Los Angeles",
    state: "CA",
    label: "Los Angeles, CA",
    center: [34.0522, -118.2437],
    zoom: 12,
  },
  new_york: {
    id: "new_york",
    name: "New York",
    state: "NY",
    label: "New York, NY",
    center: [40.7128, -74.0060],
    zoom: 12,
  },
  chicago: {
    id: "chicago",
    name: "Chicago",
    state: "IL",
    label: "Chicago, IL",
    center: [41.8781, -87.6298],
    zoom: 12,
  },
  dallas: {
    id: "dallas",
    name: "Dallas",
    state: "TX",
    label: "Dallas, TX",
    center: [32.7767, -96.7970],
    zoom: 12,
  },
};

export function getCityLabel(cityId: string): string {
  return CITIES[cityId]?.label || "Select City";
}

export function getCityData(cityId: string): City {
  return CITIES[cityId] || CITIES.miami;
}

export function getAllCities(): City[] {
  return Object.values(CITIES);
}
