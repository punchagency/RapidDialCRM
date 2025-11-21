import React from "react";
import { MapPin, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCities, getCityLabel } from "@/lib/cityData";

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const cities = getAllCities();

  return (
    <Select value={selectedCity} onValueChange={onCityChange}>
      <SelectTrigger className="w-48 h-9 text-sm" data-testid="city-selector-trigger">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <SelectValue placeholder="Select City" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
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
        ))}
      </SelectContent>
    </Select>
  );
}
