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
    name: "Washington",
    state: "DC",
    label: "Washington, DC",
    center: [38.9072, -77.0369],
    zoom: 12,
  },
};

export function getCityLabel(cityId: string): string {
  return CITIES[cityId]?.label || "Select City";
}

export function getCityData(cityId: string): City {
  return CITIES[cityId] || CITIES.miami;
}
