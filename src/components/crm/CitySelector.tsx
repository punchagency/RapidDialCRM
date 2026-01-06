import React from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllTerritories } from "@/hooks/useUsers";

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const { data: territories = [], isLoading } = useAllTerritories();

  // Map territories to city-like format
  // Convert territory names to IDs (e.g., "Washington, DC" -> "washington_dc", "Los Angeles" -> "los_angeles")
  const cities = territories.map((territory) => ({
    id: territory.toLowerCase().replace(/\s+/g, '_').replace(/,/g, '').replace(/\./g, ''),
    label: territory,
  }));

  return (
    <Select value={selectedCity} onValueChange={onCityChange} disabled={isLoading}>
      <SelectTrigger className="w-48 h-9 text-sm" data-testid="city-selector-trigger">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <SelectValue placeholder={isLoading ? "Loading..." : "Select City"} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="p-2 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading territories...
          </div>
        ) : cities.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No territories available
          </div>
        ) : (
          cities.map((city) => (
            <SelectItem
              key={city.id}
              value={city.id}
              data-testid={`city-option-${city.id}`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {city.label}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

