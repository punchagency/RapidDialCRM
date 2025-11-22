import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Contact } from "@/lib/mockData";
import { geocodeAddress } from "@/lib/geocoding";
import { Search, MapPin } from "lucide-react";

interface EditContactModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
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
    if (!query.trim() || query.length < 3) {
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

      const params = new URLSearchParams({
        q: query,
        limit: "5",
        apiKey: apiKey,
      });

      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.items || [];
        setAddressSuggestions(results);
      } else {
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
    setFormData(contact);
    setAddressSuggestions([]);
    setAddressQuery("");
    // Auto-search for address when modal opens with contact name
    if (contact.name && contact.name.length > 2) {
      handleAddressSearch(contact.name);
    }
  }, [contact, isOpen]);

  const handleSelectAddress = (suggestion: any) => {
    const fullAddress = suggestion.address?.label || suggestion.title || "";
    const position = suggestion.position || {};
    
    setFormData(prev => ({
      ...prev,
      address: fullAddress,
      city: suggestion.address?.city || prev.city,
      state: suggestion.address?.state || prev.state,
      zip: suggestion.address?.postalCode ? String(suggestion.address.postalCode) : prev.zip,
      location_lat: parseFloat(position.lat) || prev.location_lat,
      location_lng: parseFloat(position.lng) || prev.location_lng,
    }));

    setAddressSuggestions([]);
    setAddressQuery("");
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Contact: {contact.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-2 block">
              Name
            </Label>
            <div className="relative">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  handleAddressSearch(e.target.value);
                }}
                placeholder="Contact name (searches OpenStreetMap)"
                data-testid="edit-name-input"
              />
            </div>
          </div>

          {/* Address Search */}
          <div>
            <Label htmlFor="address-search" className="text-sm font-medium mb-2 block">
              Address (searches OpenStreetMap for name or address)
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address-search"
                value={addressQuery || formData.address}
                onChange={(e) => {
                  setAddressQuery(e.target.value);
                  handleAddressSearch(e.target.value);
                }}
                placeholder="Search by business name or address..."
                className="pl-9"
                data-testid="edit-address-input"
              />
            </div>

            {addressSuggestions.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                {addressSuggestions.map((suggestion, idx) => (
                  <Card
                    key={idx}
                    className="p-2 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectAddress(suggestion)}
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
                Current: {formData.address}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone" className="text-sm font-medium mb-2 block">
              Timezone
            </Label>
            <Select value={formData.timezone} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, timezone: value }))
            }>
              <SelectTrigger id="timezone" data-testid="edit-timezone-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deal Size */}
          <div>
            <Label htmlFor="dealSize" className="text-sm font-medium mb-2 block">
              Deal Size
            </Label>
            <Select 
              value={formData.dealSize || ""} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, dealSize: value }))
              }
            >
              <SelectTrigger id="dealSize" data-testid="edit-dealsize-select">
                <SelectValue placeholder="Select deal size" />
              </SelectTrigger>
              <SelectContent>
                {DEAL_SIZES.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
