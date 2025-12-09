import React, { useState, useEffect } from "react";
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const SelectedIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    className: 'selected-marker'
});

L.Marker.prototype.options.icon = DefaultIcon;

const TERRITORY_OPTIONS = [
  "Miami",
  "Washington, DC",
  "Los Angeles",
  "New York",
  "Chicago",
  "Dallas",
];

const MOCK_SEARCH_RESULTS = [
  { id: "s1", name: "Evergreen Dental", address: "123 Main St", city: "Seattle", zip: "98101", type: "Dentist", status: "new" },
  { id: "s2", name: "Seattle Smiles", address: "456 Pike St", city: "Seattle", zip: "98101", type: "Dentist", status: "new" },
  { id: "s3", name: "Downtown Orthodontics", address: "789 4th Ave", city: "Seattle", zip: "98104", type: "Dentist", status: "exists" },
  { id: "s4", name: "Pioneer Square Dental", address: "101 Yesler Way", city: "Seattle", zip: "98104", type: "Dentist", status: "new" },
  { id: "s5", name: "Westlake Family Dentistry", address: "400 Westlake Ave", city: "Seattle", zip: "98109", type: "Dentist", status: "new" },
];

const MOCK_POOL: any[] = [];

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

interface MapUpdaterProps {
  geocodeBounds: L.LatLngBounds | null;
  resultsBounds: L.LatLngBounds | null;
  selectedLocation: [number, number] | null;
}

function MapUpdater({ geocodeBounds, resultsBounds, selectedLocation }: MapUpdaterProps) {
  const map = useMap();
  const moveendHandlerRef = React.useRef<(() => void) | null>(null);
  
  // Priority 1: Fit to geocode bounds when location is searched (centers on town)
  useEffect(() => {
    if (geocodeBounds && geocodeBounds.isValid() && !resultsBounds) {
      map.fitBounds(geocodeBounds, { padding: [48, 48], maxZoom: 13 });
    }
  }, [geocodeBounds, resultsBounds, map]);
  
  // Priority 2: Fit to results bounds when results load (shows all markers)
  useEffect(() => {
    if (resultsBounds && resultsBounds.isValid()) {
      map.fitBounds(resultsBounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [resultsBounds, map]);
  
  // Priority 3: Pan to selected location with vertical offset
  useEffect(() => {
    // Clean up any existing moveend handler before setting a new one
    if (moveendHandlerRef.current) {
      map.off('moveend', moveendHandlerRef.current);
      moveendHandlerRef.current = null;
    }
    
    if (selectedLocation && selectedLocation[0] !== 0) {
      // Fly to the location
      map.flyTo(selectedLocation, Math.max(map.getZoom(), 14), { duration: 0.4 });
      
      // Create handler for after flight completes
      const handleMoveEnd = () => {
        const mapHeight = map.getSize().y;
        map.panBy([0, -mapHeight * 0.3], { animate: true, duration: 0.25 });
        // Clean up this handler after it runs
        map.off('moveend', handleMoveEnd);
        moveendHandlerRef.current = null;
      };
      
      moveendHandlerRef.current = handleMoveEnd;
      map.once('moveend', handleMoveEnd);
    }
    
    // Cleanup on unmount
    return () => {
      if (moveendHandlerRef.current) {
        map.off('moveend', moveendHandlerRef.current);
      }
    };
  }, [selectedLocation, map]);
  
  return null;
}

export default function LeadLoader() {
  const { toast } = useToast();
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pool, setPool] = useState(MOCK_POOL);
  const [isUploading, setIsUploading] = useState(false);

  const [territory, setTerritory] = useState("");
  const [isImportingAll, setIsImportingAll] = useState(false);
  const [showWithoutPhone, setShowWithoutPhone] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [geocodeBounds, setGeocodeBounds] = useState<L.LatLngBounds | null>(null);

  const [clientAdmins, setClientAdmins] = useState<SubContact[]>([{ id: "ca-1", name: "", role: "", email: "", phone: "" }]);
  const [providers, setProviders] = useState<SubContact[]>([{ id: "pv-1", name: "", role: "", email: "", phone: "" }]);

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
  }, [searchResults]);

  // Geocode location and return bounding box for proper map centering
  const geocodeLocation = async (location: string): Promise<L.LatLngBounds | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const result = data[0];
        // Nominatim returns boundingbox as [south, north, west, east]
        if (result.boundingbox) {
          const [south, north, west, east] = result.boundingbox.map(parseFloat);
          return L.latLngBounds(
            [south, west], // southwest corner
            [north, east]  // northeast corner
          );
        }
        // Fallback to center point if no bounding box
        const { lat, lon } = result;
        const center: L.LatLngTuple = [parseFloat(lat), parseFloat(lon)];
        // Create a small bounds around the center (roughly 5km)
        return L.latLngBounds(
          [center[0] - 0.05, center[1] - 0.05],
          [center[0] + 0.05, center[1] + 0.05]
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedIds(new Set());
    try {
      const query = searchQuery.toLowerCase();
      const parts = query.split(" in ");
      let specialty = parts[0].trim();
      let location = parts[1] ? parts[1].trim() : searchQuery.trim();
      
      if (specialty.endsWith("s")) {
        specialty = specialty.slice(0, -1);
      }
      
      // Geocode the location to center the map on the town
      const locationBounds = await geocodeLocation(location);
      if (locationBounds) {
        setGeocodeBounds(locationBounds);
      }
      
      const res = await fetch("/api/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, location }),
      });
      const data = await res.json();
      
      const results = (data.results || []).map((result: any, idx: number) => ({
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
      }));
      
      setSearchResults(results);
      toast({
        title: "Search Complete",
        description: `Found ${results.length} potential leads matching "${searchQuery}"`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search for leads",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const importContact = async (contacts: SearchResult[]) => {
    setIsImportingAll(true);
    try {
      const res = await fetch("/api/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, territory: territory || "Unassigned", specialty: contacts[0]?.type || "Unknown" }),
      });
      const data = await res.json();
      
      if (data.details?.added && data.details.added.length > 0) {
        const newPoolItems = data.details.added.map((c: any) => ({
          id: `nlp-${Date.now()}-${Math.random()}`,
          name: c.businessName,
          location: `${c.addressCity}, ${c.addressState}`,
          type: c.specialty,
          source: "NLP Search",
          date: "Just now"
        }));
        setPool([...newPoolItems, ...pool]);
      }
      
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
        message += `Skipped ${data.skipped} (no phone or duplicate)`;
      }
      
      toast({
        title: data.added > 0 ? "Import Complete" : "Contacts Skipped",
        description: message || "No contacts were added",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Unable to import contacts",
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
  
  // Compute bounds from all geo results
  const mapBounds = React.useMemo(() => {
    if (geoResults.length === 0) return null;
    const bounds = L.latLngBounds(
      geoResults.map(r => [r.latitude, r.longitude] as L.LatLngTuple)
    );
    return bounds;
  }, [geoResults]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Lead Management</h1>
          <Button size="sm" className="gap-2" onClick={() => document.getElementById('manual-trigger')?.click()}>
             <Plus className="h-4 w-4" /> Manual Entry
          </Button>
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
                            {TERRITORY_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
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
                          {geoResults.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                              <MapIcon className="h-16 w-16 mb-4 opacity-30" />
                              <h3 className="text-lg font-semibold mb-2">No Locations</h3>
                              <p className="text-sm text-center max-w-md">
                                Your search returned results, but they don't have location data.
                              </p>
                            </div>
                          ) : (
                            <MapContainer 
                              center={mapCenter} 
                              zoom={12} 
                              style={{ height: "100%", width: "100%" }}
                              zoomControl={true}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <MapUpdater geocodeBounds={geocodeBounds} resultsBounds={mapBounds} selectedLocation={selectedLocation} />
                              
                              {geoResults.map((result) => {
                                const isSelected = selectedIds.has(result.id);
                                return (
                                  <Marker 
                                    key={result.id} 
                                    position={[result.latitude, result.longitude]}
                                    icon={isSelected ? SelectedIcon : DefaultIcon}
                                    eventHandlers={{
                                      click: () => {
                                        toggleSelection(result.id);
                                        setSelectedLocation([result.latitude, result.longitude]);
                                      },
                                    }}
                                  >
                                    <Popup>
                                      <div className="min-w-[200px]">
                                        <div className="font-semibold text-sm">{result.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">{result.address}</div>
                                        {result.phone && <div className="text-xs mt-1">📞 {result.phone}</div>}
                                      </div>
                                    </Popup>
                                  </Marker>
                                );
                              })}
                            </MapContainer>
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
                              
                              <ScrollArea className="flex-1 px-4">
                                <div className="space-y-2 pb-4">
                                  {searchResults.map((result) => {
                                    const isSelected = selectedIds.has(result.id);
                                    return (
                                      <div 
                                        key={result.id}
                                        onClick={() => {
                                          toggleSelection(result.id);
                                          if (result.latitude && result.longitude) {
                                            setSelectedLocation([result.latitude, result.longitude]);
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
                                                setSelectedLocation([result.latitude, result.longitude]);
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
                            <Label>Business Name</Label>
                            <Input placeholder="e.g. Northside Clinic" />
                          </div>
                          <div className="space-y-2">
                            <Label>Main Phone</Label>
                            <Input placeholder="(555) 000-0000" />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label>Address</Label>
                            <Input placeholder="123 Medical Way" />
                          </div>
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input placeholder="Seattle" />
                          </div>
                          <div className="space-y-2">
                            <Label>Zip Code</Label>
                            <Input placeholder="98101" />
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
                                    <Input placeholder="Name" defaultValue={admin.name} className="bg-muted/20" />
                                    <Input placeholder="Role (e.g. Office Mgr)" defaultValue={admin.role} className="bg-muted/20" />
                                    <Input placeholder="Email" defaultValue={admin.email} className="bg-muted/20" />
                                    <Input placeholder="Phone" defaultValue={admin.phone} className="bg-muted/20" />
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
                                    <Input placeholder="Name (e.g. Dr. Smith)" defaultValue={provider.name} className="bg-muted/20" />
                                    <Input placeholder="Title (e.g. Surgeon)" defaultValue={provider.role} className="bg-muted/20" />
                                    <Input placeholder="Email" defaultValue={provider.email} className="bg-muted/20" />
                                    <Input placeholder="Phone" defaultValue={provider.phone} className="bg-muted/20" />
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
                      <Button variant="outline">Clear Form</Button>
                      <Button onClick={() => {
                        toast({ title: "Lead Added", description: `Added with ${clientAdmins.length} admins and ${providers.length} providers.` });
                        setPool([{ id: `man-${Date.now()}`, name: "Northside Clinic", location: "Seattle, WA", type: "Unknown", source: "Manual", date: "Just now" }, ...pool]);
                      }}>Save Lead</Button>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setPool(pool.filter(p => p.id !== lead.id))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {pool.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No unassigned leads. Use Search or Import to add some!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <style>{`
        .selected-marker {
          filter: hue-rotate(120deg) saturate(1.5);
        }
      `}</style>
    </div>
  );
}
