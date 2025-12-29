import React, { useState, useRef, useEffect } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Type definitions
export interface PlaceResult {
  formattedAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface MapsAutocompleteProps {
  // Value control
  value?: string;
  defaultValue?: string;
  onPlaceSelected?: (place: PlaceResult) => void;
  onValueChange?: (value: string) => void;

  // Google Maps configuration (optional - defaults to .env)
  apiKey?: string;
  options?: {
    types?: string[];
    componentRestrictions?: { country: string | string[] };
    fields?: string[];
  };

  // UI customization
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
}

// Libraries to load
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = [
  "places",
];

// Parse Google Place result into structured data
function parseGooglePlace(
  place: google.maps.places.PlaceResult
): PlaceResult | null {
  if (!place.address_components || !place.geometry?.location) {
    return null;
  }

  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let zipCode = "";
  let country = "";

  // Extract address components
  place.address_components.forEach((component) => {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      route = component.long_name;
    }
    if (types.includes("locality")) {
      city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      state = component.short_name; // Use short_name for state abbreviation
    }
    if (types.includes("postal_code")) {
      zipCode = component.long_name;
    }
    if (types.includes("country")) {
      country = component.long_name;
    }
  });

  const streetAddress = [streetNumber, route].filter(Boolean).join(" ");

  return {
    formattedAddress: place.formatted_address || "",
    streetAddress,
    city,
    state,
    zipCode,
    country,
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
    placeId: place.place_id || "",
  };
}

export function MapsAutocomplete({
  value,
  defaultValue = "",
  onPlaceSelected,
  onValueChange,
  apiKey,
  options,
  placeholder = "Search for an address...",
  disabled = false,
  className,
  error,
  label,
}: MapsAutocompleteProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if component is controlled
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Handle autocomplete load
  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);

    // Configure autocomplete options
    const autocompleteOptions: google.maps.places.AutocompleteOptions = {
      types: options?.types || ["address"],
      componentRestrictions: options?.componentRestrictions,
      fields: options?.fields || [
        "address_components",
        "formatted_address",
        "geometry",
        "place_id",
      ],
    };

    // Apply options
    if (autocompleteOptions.types) {
      autocompleteInstance.setTypes(autocompleteOptions.types);
    }
    if (autocompleteOptions.componentRestrictions) {
      autocompleteInstance.setComponentRestrictions(
        autocompleteOptions.componentRestrictions
      );
    }
    if (autocompleteOptions.fields) {
      autocompleteInstance.setFields(autocompleteOptions.fields);
    }
  };

  // Handle place selection
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place && place.formatted_address) {
        const parsedPlace = parseGooglePlace(place);

        if (parsedPlace) {
          const newValue = parsedPlace.formattedAddress;

          // Update internal state if uncontrolled
          if (!isControlled) {
            setInternalValue(newValue);
          }

          // Notify parent components
          onValueChange?.(newValue);
          onPlaceSelected?.(parsedPlace);
        }
      }
    }
  };

  // Handle input change (manual typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(newValue);
    }

    onValueChange?.(newValue);
  };

  // Handle clear button
  const handleClear = () => {
    const emptyValue = "";

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(emptyValue);
    }

    onValueChange?.(emptyValue);
    inputRef.current?.focus();
  };

  // Render loading state
  if (!isLoaded) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="relative">
          <Input
            placeholder="Loading Google Maps..."
            disabled
            className={className}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (loadError) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="relative">
          <Input
            placeholder="Failed to load Google Maps"
            disabled
            className={cn(className, "border-destructive")}
          />
          <p className="text-sm text-destructive mt-1">
            Error loading Google Maps. Please check your API key.
          </p>
        </div>
      </div>
    );
  }

  // Render autocomplete
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "md:text-sm pl-9 pr-9",
                className
              )}
            />
            {inputValue && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 z-10"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
        </Autocomplete>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
}
