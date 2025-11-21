import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITIES } from "@/lib/cityData";

interface CitySelectorProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const cities = Object.values(CITIES);

  return (
    <div className="flex items-center bg-muted/50 rounded-lg p-1 border gap-1">
      {cities.map((city) => (
        <Button
          key={city.id}
          variant={selectedCity === city.id ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => onCityChange(city.id)}
          data-testid={`city-selector-${city.id}`}
        >
          <MapPin className="h-3 w-3" />
          {city.name}
        </Button>
      ))}
    </div>
  );
}
