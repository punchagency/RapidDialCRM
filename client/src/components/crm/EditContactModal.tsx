import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Prospect } from "@shared/schema";
import { geocodeAddress } from "@/lib/geocoding";
import { Search, MapPin } from "lucide-react";

interface EditContactModalProps {
  contact: Prospect;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: Prospect) => void;
  canEdit?: boolean;
}

const TIMEZONES = [
  "EST",
  "CST",
  "MST",
  "PST",
  "AKST",
  "HST",
];

const DEAL_SIZES = [
  "Small (<$50K)",
  "Medium ($50K-$500K)",
  "Large ($500K-$2M)",
  "Enterprise (>$2M)",
];

export function EditContactModal({ contact, isOpen, onClose, onSave }: EditContactModalProps) {
  const [formData, setFormData] = useState(contact);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");

  const handleAddressSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const apiKey = import.meta.env.VITE_HERE_API_KEY;
      
      if (!apiKey) {
        console.error("HERE API key not configured");
        setAddressSuggestions([]);
        setIsSearching(false);
        return;
      }
      
      // Use HERE Autosuggest API which is the best for search-as-you-type
      // It finds both addresses and places (POIs) efficiently
      const params = new URLSearchParams({
        q: query,
        at: "39.8283,-98.5795", // Approximate center of US
        limit: "5",
        apiKey: apiKey,
      });

      const response = await fetch(
        `https://autosuggest.search.hereapi.com/v1/autosuggest?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.items || [];
        setAddressSuggestions(results);
      } else {
        console.warn("Autosuggest API returned error:", response.status);
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error("Address search error:", error);
      setAddressSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (contact) {
      setFormData(contact);
      setAddressSuggestions([]);
      setAddressQuery("");
      // Auto-search for address when modal opens with contact name or business name
      const searchName = (contact as any).businessName || (contact as any).name;
      if (searchName && searchName.length > 2) {
        handleAddressSearch(searchName);
      }
    }
  }, [contact, isOpen]);

  const handleSelectAddress = (suggestion: any) => {
    // Handle both geocode and autocomplete response formats
    const fullAddress = suggestion.address?.label || suggestion.title || "";
    const position = suggestion.position || suggestion.address?.position || {};
    
    setFormData(prev => ({
      ...prev,
      addressStreet: fullAddress,
      addressCity: suggestion.address?.city || prev.addressCity,
      addressState: suggestion.address?.state || suggestion.address?.stateCode || prev.addressState,
      addressZip: suggestion.address?.postalCode ? String(suggestion.address.postalCode) : prev.addressZip,
      addressLat: position.lat ? String(position.lat) : prev.addressLat,
      addressLng: position.lng ? String(position.lng) : prev.addressLng,
    }));

    setAddressSuggestions([]);
    setAddressQuery(fullAddress);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Contact: {contact?.businessName || 'Loading...'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Business Name */}
          <div>
            <Label htmlFor="business-name" className="text-sm font-medium mb-2 block">
              Business Name
            </Label>
            <div className="relative">
              <Input
                id="business-name"
                value={formData.businessName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, businessName: e.target.value }));
                  handleAddressSearch(e.target.value);
                }}
                placeholder="Business name (searches HERE Maps)"
                data-testid="edit-name-input"
              />
            </div>
          </div>

          {/* Address Search */}
          <div>
            <Label htmlFor="address-search" className="text-sm font-medium mb-2 block">
              Address (searches HERE Maps for name or address)
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address-search"
                value={addressQuery}
                onChange={(e) => {
                  setAddressQuery(e.target.value);
                  handleAddressSearch(e.target.value);
                }}
                placeholder="Search by business name or address..."
                className="pl-9"
                data-testid="edit-address-input"
              />
            </div>

            {isSearching && (
              <div className="mt-2 p-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {addressSuggestions.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {addressSuggestions.map((suggestion, idx) => (
                  <Card
                    key={idx}
                    className="p-2 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectAddress(suggestion)}
                    data-testid={`address-suggestion-${idx}`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 mt-1 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium">{suggestion.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{suggestion.address?.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!addressQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                Current: {formData.addressStreet}
              </p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <Label htmlFor="specialty" className="text-sm font-medium mb-2 block">
              Specialty
            </Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="e.g., Chiropractor, Dentist"
              data-testid="edit-specialty-input"
            />
          </div>

          {/* Territory */}
          <div>
            <Label htmlFor="territory" className="text-sm font-medium mb-2 block">
              Territory
            </Label>
            <Input
              id="territory"
              value={formData.territory}
              onChange={(e) => setFormData(prev => ({ ...prev, territory: e.target.value }))}
              placeholder="e.g., South Florida, North Texas"
              data-testid="edit-territory-input"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="save-edit-button">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
