import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Upload, Plus, Database, Globe, CheckCircle, MapPin, Building, Briefcase, FileUp, Loader2, Info, Trash2, UserCog, Stethoscope, X, User, Map as MapIcon, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SubContact } from "@/lib/mockData";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import type { Prospect } from "@/lib/types";

// Territory options will be fetched from backend
const DEFAULT_TERRITORY_OPTIONS = [
  "Miami",
  "Washington, DC",
  "Los Angeles",
  "New York",
  "Chicago",
  "Dallas",
  "Unassigned",
];

interface SearchResult {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude: number;
  longitude: number;
  profession?: string;
  type?: string;
  status?: string;
}

// Google Maps configuration
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

// Libraries needed for Google Maps
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

interface PoolItem {
  id: string;
  name: string;
  location: string;
  type: string;
  source: string;
  date: string;
}

export default function LeadLoaderWithGoogleMap() {
  const { toast } = useToast();
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pool, setPool] = useState<PoolItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>(DEFAULT_TERRITORY_OPTIONS);

  const [territory, setTerritory] = useState("");
  const [isImportingAll, setIsImportingAll] = useState(false);
  const [showWithoutPhone, setShowWithoutPhone] = useState(false);

  // Manual entry form state
  const [manualFormData, setManualFormData] = useState({
    businessName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    office_email: "",
    specialty: "Unknown",
  });
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultCenter);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Initialize Google Places services when API is loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (it needs a map or div element)
      const dummyDiv = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv);
    }
  }, [isLoaded]);

  const [clientAdmins, setClientAdmins] = useState<SubContact[]>([{ id: "ca-1", name: "", role: "", email: "", phone: "", contactType: "client-admin" }]);
  const [providers, setProviders] = useState<SubContact[]>([{ id: "pv-1", name: "", role: "", email: "", phone: "", contactType: "provider" }]);

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle address autocomplete - supports name, zip, city, state, street, street number
  const handleAddressInputChange = useCallback((value: string) => {
    setManualFormData((prev) => ({ ...prev, address: value }));

    if (!isLoaded || !autocompleteServiceRef.current || value.length < 2) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    // Use a more flexible request that can find:
    // - Places by name (establishment)
    // - Addresses by street number and name (geocode)
    // - Cities, states, ZIP codes (geocode)
    const request: google.maps.places.AutocompletionRequest = {
      input: value,
      // Include multiple types to support various search criteria:
      // 'geocode' - finds addresses, cities, states, ZIP codes
      // 'establishment' - finds places by name (businesses, landmarks, etc.)
      types: ['geocode', 'establishment'],
      // componentRestrictions: { country: 'us' }, // Restrict to US
    };

    autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setAddressSuggestions(predictions);
        setShowAddressSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    });
  }, [isLoaded]);

  // Handle address selection from autocomplete
  // Supports: place name, zip/post code, city, state, street, street number
  const handleAddressSelect = useCallback((placeId: string) => {
    if (!isLoaded || !placesServiceRef.current) return;

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: [
        'formatted_address',
        'address_components',
        'geometry',
        'name', // For place names
        'types' // To determine if it's a place or address
      ],
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // Extract address components
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zip = '';
        let placeName = place.name || '';

        // Check if this is a place (establishment) or an address
        const isPlace = place.types?.some(type =>
          type === 'establishment' ||
          type === 'point_of_interest' ||
          type === 'store' ||
          type === 'restaurant' ||
          type === 'hospital' ||
          type === 'doctor' ||
          type === 'pharmacy'
        ) || false;

        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          } else if (types.includes('route')) {
            route = component.long_name;
          } else if (types.includes('locality')) {
            city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (types.includes('postal_code')) {
            zip = component.long_name;
          }
        });

        // Build address string
        // If it's a place, use the place name, otherwise use street address
        let fullAddress = '';
        if (isPlace && placeName) {
          // For places, use: "Place Name, Street Address" or just "Place Name"
          const streetAddress = `${streetNumber} ${route}`.trim();
          fullAddress = streetAddress ? `${placeName}, ${streetAddress}` : placeName;
        } else {
          // For addresses, use street number + route
          fullAddress = `${streetNumber} ${route}`.trim() || place.formatted_address || '';
        }

        setManualFormData((prev) => ({
          ...prev,
          address: fullAddress,
          city: city || prev.city,
          zip: zip || prev.zip,
          state: state || prev.state,
        }));

        setAddressSuggestions([]);
        setShowAddressSuggestions(false);

        // Update map center if geometry is available
        if (place.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setMapCenter(location);
          setSelectedLocation(location);
        }
      }
    });
  }, [isLoaded]);

  // Handle keyboard navigation in suggestions
  const handleAddressKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAddressSuggestions || addressSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < addressSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const selected = addressSuggestions[selectedSuggestionIndex];
      if (selected.place_id) {
        handleAddressSelect(selected.place_id);
      }
    } else if (e.key === 'Escape') {
      setShowAddressSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [showAddressSuggestions, addressSuggestions, selectedSuggestionIndex, handleAddressSelect]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch pool data from backend (prospects with territory "Unassigned" or empty)
  const fetchPool = async () => {
    setIsLoadingPool(true);
    try {
      // Fetch all prospects and filter for unassigned ones
      const { data: allData, error: allError } = await CustomServerApi.getProspects();
      if (allError) throw new Error(allError);

      // Filter for unassigned prospects (territory is "Unassigned", empty, or null)
      const unassignedProspects = (allData || []).filter((p: Prospect) =>
        !p.territory || p.territory.trim() === "" || p.territory === "Unassigned"
      );

      const poolItems: PoolItem[] = unassignedProspects.map((p: Prospect) => ({
        id: p.id,
        name: p.businessName,
        location: `${p.addressCity || ""}${p.addressCity && p.addressState ? ", " : ""}${p.addressState || ""}`.trim() || "Unknown",
        type: p.specialty || "Unknown",
        source: "NLP Search", // We can enhance this later with actual source tracking
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Unknown",
      }));

      setPool(poolItems);
    } catch (error) {
      console.error("Failed to fetch pool:", error);
      toast({
        title: "Failed to Load Pool",
        description: error instanceof Error ? error.message : "Unable to fetch unassigned leads",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPool(false);
    }
  };

  // Fetch territories from backend
  const fetchTerritories = async () => {
    try {
      const { data, error } = await CustomServerApi.getAllTerritories();
      if (error) {
        console.warn("Failed to fetch territories:", error);
        return; // Use default options
      }
      if (data && Array.isArray(data) && data.length > 0) {
        const territories = data.map((territory: any) => territory.name) || [];
        setTerritoryOptions([...territories, "Unassigned"]);
      }
    } catch (error) {
      console.warn("Error fetching territories:", error);
      // Use default options on error
    }
  };

  // Load pool and territories on mount
  useEffect(() => {
    fetchPool();
    fetchTerritories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAdminRow = () => {
    setClientAdmins([...clientAdmins, { id: `ca-${Date.now()}`, name: "", role: "", email: "", phone: "" }]);
  };

  const removeAdminRow = (id: string) => {
    if (clientAdmins.length > 1) {
      setClientAdmins(clientAdmins.filter(a => a.id !== id));
    }
  };

  const addProviderRow = () => {
    setProviders([...providers, { id: `pv-${Date.now()}`, name: "", role: "", email: "", phone: "" }]);
  };

  const removeProviderRow = (id: string) => {
    if (providers.length > 1) {
      setProviders(providers.filter(p => p.id !== id));
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    const geoResults = searchResults.filter(r => r.latitude && r.longitude);
    setSelectedIds(new Set(geoResults.map(r => r.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Reset selected location when search results change
  useEffect(() => {
    setSelectedLocation(null);
    setInfoWindowOpen(null);
  }, [searchResults]);

  // Handle map bounds updates
  useEffect(() => {
    if (!map) return;

    const geoResults = searchResults.filter(r => r.latitude && r.longitude);
    if (geoResults.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    geoResults.forEach(result => {
      bounds.extend(new google.maps.LatLng(result.latitude, result.longitude));
    });

    map.fitBounds(bounds, {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    });
  }, [searchResults, map]);

  // Handle selected location change
  useEffect(() => {
    if (!map || !selectedLocation) return;

    map.panTo(selectedLocation);
    map.setZoom(14);
  }, [selectedLocation, map]);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSelectedIds(new Set());
    try {
      const query = searchQuery.toLowerCase();
      const parts = query.split(" in ");
      let specialty = parts[0].trim();
      let location = territory ? territory : parts[1] ? parts[1].trim() : searchQuery.trim();

      if (specialty.endsWith("s")) {
        specialty = specialty.slice(0, -1);
      }

      const { data, error } = await CustomServerApi.bulkSearch(specialty, location);

      if (error) {
        throw new Error(error);
      }

      const results = ((data?.results || []) as any[]).map((result: any, idx: number) => ({
        id: `s${idx}`,
        name: result.name,
        phone: result.phone,
        email: result.email,
        website: result.website,
        address: result.address,
        city: result.city,
        state: result.state,
        zip: result.zip,
        latitude: result.latitude,
        longitude: result.longitude,
        type: result.profession || result.category || specialty,
        status: "new",
      })).filter(r => !!r.phone);

      setSearchResults(results);
      toast({
        title: "Search Complete",
        description: `Found ${results.length} potential leads matching "${searchQuery}"`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to search for leads";
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const importContact = async (contacts: SearchResult[]) => {
    setIsImportingAll(true);
    try {
      const { data, error } = await CustomServerApi.bulkAdd(
        contacts,
        territory || "Unassigned",
        contacts[0]?.type || "Unknown"
      );

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("No data returned from server");
      }

      // Refresh pool after successful import
      await fetchPool();

      setSearchResults(searchResults.filter(r => !contacts.find(c => c.name === r.name)));
      setSelectedIds(prev => {
        const next = new Set(prev);
        contacts.forEach(c => next.delete(c.id));
        return next;
      });

      let message = "";
      if (data.added > 0) {
        message = `Added ${data.added} contact${data.added !== 1 ? "s" : ""}`;
      }
      if (data.skipped > 0) {
        if (message) message += ", ";
        message += `Skipped ${data.skipped} (duplicate)`;
        // message += `Skipped ${data.skipped} (no phone or duplicate)`;
      }

      toast({
        title: data.added > 0 ? "Import Complete" : "Contacts Skipped",
        description: message || "No contacts were added",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to import contacts";
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImportingAll(false);
    }
  };

  const addToPool = (lead: SearchResult) => {
    importContact([lead]);
  };

  const addSelectedToPool = () => {
    const selectedLeads = searchResults.filter(r => selectedIds.has(r.id));
    if (selectedLeads.length > 0) {
      importContact(selectedLeads);
    }
  };

  // Handle manual lead entry form submission
  const handleSaveManualLead = async () => {
    if (!manualFormData.businessName.trim() || !manualFormData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Business name and phone are required",
        variant: "destructive",
      });
      return;
    }

    setIsSavingManual(true);
    try {
      // Create the prospect
      const { data: prospect, error: prospectError } = await CustomServerApi.createProspect({
        businessName: manualFormData.businessName.trim(),
        phoneNumber: manualFormData.phone.trim(),
        addressStreet: manualFormData.address.trim() || undefined,
        addressCity: manualFormData.city.trim() || undefined,
        addressZip: manualFormData.zip.trim() || undefined,
        specialty: manualFormData.specialty || "Unknown",
        territory: territory || "Unassigned",
        officeEmail: manualFormData.office_email.trim() || undefined,
        addressState: manualFormData.state.trim() || undefined,
      });

      if (prospectError || !prospect) {
        throw new Error(prospectError || "Failed to create prospect");
      }

      // Create stakeholders for client admins
      const adminPromises = clientAdmins
        .filter(admin => admin.name.trim())
        .map(admin =>
          CustomServerApi.createStakeholder({
            prospectId: prospect.id,
            name: admin.name.trim(),
            title: admin.role.trim() || undefined,
            email: admin.email.trim() || undefined,
            phoneNumber: admin.phone.trim() || undefined,
            isPrimary: false,
            contactType: "client-admin",
          })
        );

      // Create stakeholders for providers
      const providerPromises = providers
        .filter(provider => provider.name.trim())
        .map((provider, idx) =>
          CustomServerApi.createStakeholder({
            prospectId: prospect.id,
            name: provider.name.trim(),
            title: provider.role.trim() || undefined,
            email: provider.email.trim() || undefined,
            phoneNumber: provider.phone.trim() || undefined,
            isPrimary: idx === 0, // First provider is primary
            contactType: "provider",
          })
        );

      // Wait for all stakeholders to be created
      await Promise.all([...adminPromises, ...providerPromises]);

      toast({
        title: "Lead Added Successfully",
        description: `Added "${manualFormData.businessName}" with ${clientAdmins.filter(a => a.name.trim()).length} admin(s) and ${providers.filter(p => p.name.trim()).length} provider(s).`,
      });

      // Clear form
      setManualFormData({
        businessName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        specialty: "Unknown",
        office_email: "",
      });
      setClientAdmins([{ id: "ca-1", name: "", role: "", email: "", phone: "" }]);
      setProviders([{ id: "pv-1", name: "", role: "", email: "", phone: "" }]);
      setTerritory("");

      // Refresh pool
      await fetchPool();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save lead";
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingManual(false);
    }
  };

  // Handle delete from pool
  const handleDeleteFromPool = async (leadId: string) => {
    try {
      const { error } = await CustomServerApi.deleteProspect(leadId);

      if (error) {
        throw new Error(error);
      }

      // Remove from local state
      setPool(pool.filter(p => p.id !== leadId));

      toast({
        title: "Lead Removed",
        description: "Lead has been removed from the pool",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to delete lead";
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Upload Successful",
        description: "Processed 45 records. 42 new leads added to pool, 3 duplicates skipped.",
      });
    }, 2000);
  };

  const geoResults = searchResults.filter(r => r.latitude && r.longitude);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Lead Management</h1>
          {/* <Button size="sm" className="gap-2" onClick={() => document.getElementById('manual-trigger')?.click()}>
            <Plus className="h-4 w-4" /> Manual Entry
          </Button> */}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="search" className="space-y-6">
              <TabsList className="bg-card border border-border p-1 w-full justify-start">
                <TabsTrigger value="search" className="gap-2"><Globe className="h-4 w-4" /> Lead Discovery {selectedIds.size > 0 && <Badge variant="default" className="ml-2 h-5 px-1.5 bg-primary">{selectedIds.size}</Badge>}</TabsTrigger>
                <TabsTrigger value="manual" id="manual-trigger" className="gap-2"><Plus className="h-4 w-4" /> Manual Entry</TabsTrigger>
                <TabsTrigger value="pool" className="gap-2"><Database className="h-4 w-4" /> Unassigned Pool <Badge variant="secondary" className="ml-2 h-5 px-1.5">{pool.length}</Badge></TabsTrigger>
              </TabsList>

              {/* TAB: DISCOVERY */}
              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Find New Business Leads</CardTitle>
                    <CardDescription>
                      Use natural language to find businesses. Try "Dentists in 98101" or "Cardiologists in Seattle". Results appear on the map.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col">
                    <div className="space-y-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Territory <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                        <Select value={territory} onValueChange={setTerritory}>
                          <SelectTrigger data-testid="select-territory">
                            <SelectValue placeholder="Select a territory or leave empty" />
                          </SelectTrigger>
                          <SelectContent>
                            {territoryOptions?.map((t, i) => (
                              <SelectItem key={i} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. Find all orthopedic surgeons near Everett, WA"
                            className="pl-10 h-10 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            data-testid="input-search-query"
                          />
                        </div>
                        <Button type="submit" disabled={isSearching} className="w-32">
                          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                      </form>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="grid grid-cols-12 gap-4 h-[520px] overflow-hidden">
                        <div className="col-span-8 rounded-lg overflow-hidden border bg-card h-full">
                          {loadError ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                              <MapIcon className="h-16 w-16 mb-4 opacity-30" />
                              <h3 className="text-lg font-semibold mb-2">Map Error</h3>
                              <p className="text-sm text-center max-w-md">
                                Failed to load Google Maps. Please check your API key configuration.
                              </p>
                            </div>
                          ) : !isLoaded ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                              <Loader2 className="h-16 w-16 mb-4 opacity-30 animate-spin" />
                              <h3 className="text-lg font-semibold mb-2">Loading Map...</h3>
                            </div>
                          ) : geoResults.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                              <MapIcon className="h-16 w-16 mb-4 opacity-30" />
                              <h3 className="text-lg font-semibold mb-2">No Locations</h3>
                              <p className="text-sm text-center max-w-md">
                                Your search returned results, but they don't have location data.
                              </p>
                            </div>
                          ) : (
                            <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={mapCenter}
                              zoom={12}
                              onLoad={(map) => setMap(map)}
                              options={{
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: true,
                              }}
                            >
                              {geoResults.map((result) => {
                                const isSelected = selectedIds.has(result.id);
                                return (
                                  <React.Fragment key={result.id}>
                                    <Marker
                                      position={{ lat: result.latitude, lng: result.longitude }}
                                      icon={{
                                        url: isSelected
                                          ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                          : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                        scaledSize: isSelected ? new google.maps.Size(40, 40) : new google.maps.Size(32, 32),
                                      }}
                                      onClick={() => {
                                        toggleSelection(result.id);
                                        setSelectedLocation({ lat: result.latitude, lng: result.longitude });
                                        setInfoWindowOpen(result.id);
                                      }}
                                    />
                                    {infoWindowOpen === result.id && (
                                      <InfoWindow
                                        position={{ lat: result.latitude, lng: result.longitude }}
                                        onCloseClick={() => setInfoWindowOpen(null)}
                                      >
                                        <div className="min-w-[200px]">
                                          <div className="font-semibold text-sm">{result.name}</div>
                                          <div className="text-xs text-gray-600 mt-1">{result.address}</div>
                                          {result.phone && <div className="text-xs mt-1">📞 {result.phone}</div>}
                                        </div>
                                      </InfoWindow>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </GoogleMap>
                          )}
                        </div>

                        <div className="col-span-4 flex flex-col gap-4">
                          <Card className="flex-1 flex flex-col">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Results</CardTitle>
                                <Badge variant={selectedIds.size > 0 ? "default" : "secondary"}>
                                  {selectedIds.size} selected
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col p-0">
                              <div className="px-4 pb-3 flex gap-2 text-xs">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={selectAll}
                                  disabled={searchResults.length === 0}
                                  data-testid="button-select-all"
                                >
                                  All ({searchResults.length})
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={clearSelection}
                                  disabled={selectedIds.size === 0}
                                  data-testid="button-clear-selection"
                                >
                                  Clear
                                </Button>
                              </div>

                              <ScrollArea className="flex-1 px-4 max-h-[300px]">
                                <div className="space-y-2 pb-4">
                                  {searchResults.map((result) => {
                                    const isSelected = selectedIds.has(result.id);
                                    return (
                                      <div
                                        key={result.id}
                                        onClick={() => {
                                          toggleSelection(result.id);
                                          if (result.latitude && result.longitude) {
                                            setSelectedLocation({ lat: result.latitude, lng: result.longitude });
                                            setInfoWindowOpen(result.id);
                                          }
                                        }}
                                        className={cn(
                                          "p-2 rounded-lg border cursor-pointer transition-all text-xs",
                                          isSelected
                                            ? "bg-primary/10 border-primary"
                                            : "bg-card border-border hover:border-primary/50"
                                        )}
                                        data-testid={`lead-result-${result.id}`}
                                      >
                                        <div className="flex items-start gap-2">
                                          <Checkbox
                                            checked={isSelected}
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={() => {
                                              toggleSelection(result.id);
                                              if (result.latitude && result.longitude) {
                                                setSelectedLocation({ lat: result.latitude, lng: result.longitude });
                                                setInfoWindowOpen(result.id);
                                              }
                                            }}
                                            className="mt-0.5"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{result.name}</p>
                                            {result.phone && <p className="text-xs text-muted-foreground truncate">📞 {result.phone}</p>}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </ScrollArea>

                              <div className="p-3 border-t bg-muted/30 space-y-2">
                                <Button
                                  onClick={addSelectedToPool}
                                  disabled={selectedIds.size === 0 || isImportingAll}
                                  className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                                  data-testid="button-add-selected-to-pool"
                                >
                                  {isImportingAll ? (
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  ) : (
                                    <Plus className="h-3 w-3 mr-2" />
                                  )}
                                  Add {selectedIds.size} to Pool
                                </Button>
                                <Button
                                  onClick={() => importContact(searchResults.filter(r => showWithoutPhone || r.phone))}
                                  disabled={isImportingAll || searchResults.filter(r => showWithoutPhone || r.phone).length === 0}
                                  className="w-full text-xs h-8"
                                  variant="outline"
                                  data-testid="button-import-all"
                                >
                                  {isImportingAll ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Upload className="h-3 w-3 mr-2" />}
                                  All Results
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={showWithoutPhone ? "secondary" : "outline"}
                              onClick={() => setShowWithoutPhone(!showWithoutPhone)}
                              data-testid="button-toggle-no-phone"
                              className="text-xs w-full"
                            >
                              {showWithoutPhone ? "Show All" : "Hide No Phone"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>



              {/* TAB: MANUAL */}
              <TabsContent value="manual">
                <Card>
                  <CardHeader>
                    <CardTitle>Manual Lead Entry</CardTitle>
                    <CardDescription>Enter a single lead record manually.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                          <Building className="h-4 w-4" /> Business Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Business Name *</Label>
                            <Input
                              placeholder="e.g. Northside Clinic"
                              value={manualFormData.businessName}
                              onChange={(e) => setManualFormData({ ...manualFormData, businessName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Main Phone *</Label>
                            <Input
                              placeholder="(555) 000-0000"
                              value={manualFormData.phone}
                              onChange={(e) => setManualFormData({ ...manualFormData, phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-span-2 space-y-2 relative">
                            <Label>Address</Label>
                            <div className="relative">
                              <Input
                                ref={addressInputRef}
                                placeholder="123 Medical Way"
                                value={manualFormData.address}
                                onChange={(e) => handleAddressInputChange(e.target.value)}
                                onKeyDown={handleAddressKeyDown}
                                onFocus={() => {
                                  if (addressSuggestions.length > 0) {
                                    setShowAddressSuggestions(true);
                                  }
                                }}
                                className="w-full"
                              />
                              {showAddressSuggestions && addressSuggestions.length > 0 && (
                                <div
                                  ref={suggestionsRef}
                                  className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                                >
                                  {addressSuggestions.map((suggestion, index) => (
                                    <div
                                      key={suggestion.place_id}
                                      onClick={() => {
                                        if (suggestion.place_id) {
                                          handleAddressSelect(suggestion.place_id);
                                        }
                                      }}
                                      className={cn(
                                        "px-4 py-3 cursor-pointer hover:bg-muted transition-colors",
                                        index === selectedSuggestionIndex && "bg-muted"
                                      )}
                                    >
                                      <div className="flex items-start gap-2">
                                        {suggestion.types?.includes('establishment') ? (
                                          <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        ) : (
                                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm text-foreground truncate">
                                            {suggestion.structured_formatting.main_text}
                                          </div>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {suggestion.structured_formatting.secondary_text}
                                          </div>
                                          {/* Show type hint if available */}
                                          {suggestion.types && suggestion.types.length > 0 && (
                                            <div className="text-xs text-muted-foreground/70 mt-0.5">
                                              {suggestion.types[0].replace(/_/g, ' ')}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              placeholder="Seattle"
                              value={manualFormData.city}
                              onChange={(e) => setManualFormData({ ...manualFormData, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Zip Code</Label>
                            <Input
                              placeholder="98101"
                              value={manualFormData.zip}
                              onChange={(e) => setManualFormData({ ...manualFormData, zip: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Input
                              placeholder="CA"
                              value={manualFormData.state}
                              onChange={(e) => setManualFormData({ ...manualFormData, state: e.target.value })}
                            />  
                          </div>
                          <div className="space-y-2">
                            <Label>Office Email (optional)</Label>
                            <Input
                              placeholder="office@example.com"
                              value={manualFormData.office_email}
                              onChange={(e) => setManualFormData({ ...manualFormData, office_email: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label>Territory</Label>
                            <Select value={territory} onValueChange={setTerritory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a territory or leave empty" />
                              </SelectTrigger>
                              <SelectContent>
                                {territoryOptions?.map((t,i) => (
                                  <SelectItem key={i} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <UserCog className="h-4 w-4" /> Client Admin Contacts
                          </h3>
                          <Button size="sm" variant="outline" onClick={addAdminRow} className="h-7 text-xs gap-1">
                            <Plus className="h-3 w-3" /> Add Admin
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {clientAdmins.map((admin, idx) => (
                            <div key={admin.id} className="flex gap-3 items-start">
                              <div className="grid grid-cols-4 gap-3 flex-1">
                                <Input
                                  placeholder="Name"
                                  value={admin.name}
                                  onChange={(e) => {
                                    const updated = [...clientAdmins];
                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                    setClientAdmins(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                                <Input
                                  placeholder="Role (e.g. Office Mgr)"
                                  value={admin.role}
                                  onChange={(e) => {
                                    const updated = [...clientAdmins];
                                    updated[idx] = { ...updated[idx], role: e.target.value };
                                    setClientAdmins(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                                <Input
                                  placeholder="Email"
                                  value={admin.email}
                                  onChange={(e) => {
                                    const updated = [...clientAdmins];
                                    updated[idx] = { ...updated[idx], email: e.target.value };
                                    setClientAdmins(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                                <Input
                                  placeholder="Phone"
                                  value={admin.phone}
                                  onChange={(e) => {
                                    const updated = [...clientAdmins];
                                    updated[idx] = { ...updated[idx], phone: e.target.value };
                                    setClientAdmins(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                onClick={() => removeAdminRow(admin.id)}
                                disabled={clientAdmins.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" /> Provider Contacts
                          </h3>
                          <Button size="sm" variant="outline" onClick={addProviderRow} className="h-7 text-xs gap-1">
                            <Plus className="h-3 w-3" /> Add Provider
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {providers.map((provider, idx) => (
                            <div key={provider.id} className="flex gap-3 items-start">
                              <div className="grid grid-cols-4 gap-3 flex-1">
                                <Input
                                  placeholder="Name (e.g. Dr. Smith)"
                                  value={provider.name}
                                  onChange={(e) => {
                                    const updated = [...providers];
                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                    setProviders(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                                <Input
                                  placeholder="Title (e.g. Surgeon)"
                                  value={provider.role}
                                  onChange={(e) => {
                                    const updated = [...providers];
                                    updated[idx] = { ...updated[idx], role: e.target.value };
                                    setProviders(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                                <Input
                                  placeholder="Email"
                                  value={provider.email}
                                  onChange={(e) => {
                                    const updated = [...providers];
                                    updated[idx] = { ...updated[idx], email: e.target.value };
                                    setProviders(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                                <Input
                                  placeholder="Phone"
                                  value={provider.phone}
                                  onChange={(e) => {
                                    const updated = [...providers];
                                    updated[idx] = { ...updated[idx], phone: e.target.value };
                                    setProviders(updated);
                                  }}
                                  className="bg-muted/20"
                                />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                onClick={() => removeProviderRow(provider.id)}
                                disabled={providers.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="mt-8 flex justify-end gap-2 border-t pt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setManualFormData({
                            businessName: "",
                            phone: "",
                            address: "",
                            city: "",
                            zip: "",
                            state: "",
                            office_email: "",
                            specialty: "Unknown",
                          });
                          setClientAdmins([{ id: "ca-1", name: "", role: "", email: "", phone: "" }]);
                          setProviders([{ id: "pv-1", name: "", role: "", email: "", phone: "" }]);
                          setTerritory("");
                        }}
                      >
                        Clear Form
                      </Button>
                      <Button
                        onClick={handleSaveManualLead}
                        disabled={isSavingManual || !manualFormData.businessName.trim() || !manualFormData.phone.trim()}
                      >
                        {isSavingManual ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Lead"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: POOL */}
              <TabsContent value="pool">
                <Card>
                  <CardHeader>
                    <CardTitle>Unassigned Lead Pool</CardTitle>
                    <CardDescription>Leads waiting to be distributed to territories or reps.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lead Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pool.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.location}</TableCell>
                            <TableCell>{lead.type}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.source}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{lead.date}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteFromPool(lead.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {isLoadingPool ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ) : pool.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No unassigned leads. Use Search or Manual Entry to add some!
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

