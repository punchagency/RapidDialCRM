import React, { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { Territory } from "@/lib/types";

interface TerritoryFilterProps {
  value: string | null;
  onChange: (territoryName: string | null) => void;
}

export function TerritoryFilter({ value, onChange }: TerritoryFilterProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerritories = async () => {
      try {
        setLoading(true);
        const response = await CustomServerApi.getTerritories();
        if (response.data) {
          setTerritories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch territories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerritories();
  }, []);

  const selectedTerritory = territories.find(
    (territory) => territory.name === value
  );

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : territories.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No territories available
        </div>
      ) : (
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={searchOpen}
              className="w-[250px] justify-between h-9"
            >
              {selectedTerritory ? (
                <span className="truncate">{selectedTerritory.name}</span>
              ) : (
                <span className="text-muted-foreground">
                  Filter by territory...
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search territories..." />
              <CommandList>
                <CommandEmpty>No territory found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      onChange(null);
                      setSearchOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Territories
                  </CommandItem>
                  {territories.map((territory) => (
                    <CommandItem
                      key={territory.id}
                      value={territory.name}
                      onSelect={() => {
                        onChange(territory.name);
                        setSearchOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === territory.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{territory.name}</span>
                        {territory.description && (
                          <span className="text-xs text-muted-foreground">
                            {territory.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
