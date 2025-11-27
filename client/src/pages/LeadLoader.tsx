import React, { useState } from "react";
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
import { Search, Upload, Plus, Database, Globe, CheckCircle, MapPin, Building, Briefcase, FileUp, Loader2, Info, Trash2, UserCog, Stethoscope, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SubContact } from "@/lib/mockData";

// Mock Search Results
const MOCK_SEARCH_RESULTS = [
  { id: "s1", name: "Evergreen Dental", address: "123 Main St", city: "Seattle", zip: "98101", type: "Dentist", status: "new" },
  { id: "s2", name: "Seattle Smiles", address: "456 Pike St", city: "Seattle", zip: "98101", type: "Dentist", status: "new" },
  { id: "s3", name: "Downtown Orthodontics", address: "789 4th Ave", city: "Seattle", zip: "98104", type: "Dentist", status: "exists" },
  { id: "s4", name: "Pioneer Square Dental", address: "101 Yesler Way", city: "Seattle", zip: "98104", type: "Dentist", status: "new" },
  { id: "s5", name: "Westlake Family Dentistry", address: "400 Westlake Ave", city: "Seattle", zip: "98109", type: "Dentist", status: "new" },
];

// Mock Unassigned Pool
const MOCK_POOL = [
  { id: "p1", name: "Bellevue Dermatology", location: "Bellevue, WA", type: "Dermatology", source: "Bulk Upload", date: "2 hrs ago" },
  { id: "p2", name: "Redmond Pediatrics", location: "Redmond, WA", type: "Pediatrics", source: "Manual Entry", date: "4 hrs ago" },
  { id: "p3", name: "Kirkland Vision Center", location: "Kirkland, WA", type: "Optometry", source: "NLP Search", date: "Yesterday" },
  { id: "p4", name: "Sammamish Medical", location: "Sammamish, WA", type: "General Practice", source: "Bulk Upload", date: "Yesterday" },
];

interface SearchResult {
  name: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude: number;
  longitude: number;
}

export default function LeadLoader() {
  const { toast } = useToast();
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS>([]);
  const [pool, setPool] = useState(MOCK_POOL);
  const [isUploading, setIsUploading] = useState(false);

  // Bulk Import State
  const [bulkSpecialty, setBulkSpecialty] = useState("");
  const [bulkLocation, setBulkLocation] = useState("");
  const [bulkTerritory, setBulkTerritory] = useState("");
  const [bulkResults, setBulkResults] = useState<SearchResult[]>([]);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

  // Manual Entry State
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Parse search query to extract specialty and location
      const query = searchQuery.toLowerCase();
      
      // Try to extract specialty and location from natural language query
      // e.g., "dentists in mclean va" -> specialty: "dentist", location: "mclean va"
      const parts = query.split(" in ");
      let specialty = parts[0].trim();
      let location = parts[1] ? parts[1].trim() : searchQuery.trim();
      
      // Remove trailing 's' from specialty if present
      if (specialty.endsWith("s")) {
        specialty = specialty.slice(0, -1);
      }
      
      const res = await fetch("/api/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, location }),
      });
      const data = await res.json();
      
      // Convert API results to the format expected by the UI
      const results = (data.results || []).map((result: any, idx: number) => ({
        id: `s${idx}`,
        name: result.name,
        address: result.address,
        city: result.city,
        zip: result.zip,
        type: result.category || specialty,
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

  const addToPool = (lead: any) => {
    const newLead = {
      id: `new-${Date.now()}`,
      name: lead.name,
      location: `${lead.city || "Unknown"}`,
      type: lead.type,
      source: "NLP Search",
      date: "Just now"
    };
    setPool([newLead, ...pool]);
    
    // Remove from results visually to show it's done
    setSearchResults(searchResults.filter(r => r.id !== lead.id));
    
    toast({
      title: "Lead Added",
      description: `${lead.name} added to Unassigned Pool.`,
    });
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

  const handleBulkSearch = async () => {
    if (!bulkSpecialty || !bulkLocation) {
      toast({
        title: "Missing Fields",
        description: "Please enter specialty and location",
        variant: "destructive",
      });
      return;
    }

    setBulkLoading(true);
    try {
      const res = await fetch("/api/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty: bulkSpecialty, location: bulkLocation }),
      });
      const data = await res.json();
      setBulkResults(data.results || []);
      setBulkSelectedIds(new Set());
      
      toast({
        title: "Search Complete",
        description: `Found ${data.results?.length || 0} professionals`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search professionals",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkSelectAll = (checked: boolean) => {
    if (checked) {
      setBulkSelectedIds(new Set(bulkResults.map((_, i) => i.toString())));
    } else {
      setBulkSelectedIds(new Set());
    }
  };

  const handleBulkSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(bulkSelectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setBulkSelectedIds(newSet);
  };

  const handleBulkAddSelected = async () => {
    if (!bulkTerritory) {
      toast({
        title: "Missing Territory",
        description: "Please enter a territory",
        variant: "destructive",
      });
      return;
    }

    const contacts = bulkResults.filter((_, i) => bulkSelectedIds.has(i.toString()));
    if (contacts.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select contacts to add",
        variant: "destructive",
      });
      return;
    }

    setBulkAdding(true);
    try {
      const res = await fetch("/api/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, territory: bulkTerritory, specialty: bulkSpecialty }),
      });
      const data = await res.json();
      
      // Add to pool
      const newPoolItems = contacts.map((c, i) => ({
        id: `bulk-${Date.now()}-${i}`,
        name: c.name,
        location: `${c.city}, ${c.state}`,
        type: bulkSpecialty,
        source: "Bulk Search",
        date: "Just now"
      }));
      setPool([...newPoolItems, ...pool]);

      toast({
        title: "Import Complete",
        description: `Added ${data.added} contacts, skipped ${data.skipped}`,
      });

      setBulkResults([]);
      setBulkSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Unable to add contacts",
        variant: "destructive",
      });
    } finally {
      setBulkAdding(false);
    }
  };

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
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="search" className="space-y-6">
              <TabsList className="bg-card border border-border p-1 w-full justify-start">
                <TabsTrigger value="search" className="gap-2"><Globe className="h-4 w-4" /> Lead Discovery (NLP)</TabsTrigger>
                <TabsTrigger value="import" className="gap-2"><Upload className="h-4 w-4" /> Bulk Import</TabsTrigger>
                <TabsTrigger value="manual" id="manual-trigger" className="gap-2"><Plus className="h-4 w-4" /> Manual Entry</TabsTrigger>
                <TabsTrigger value="pool" className="gap-2"><Database className="h-4 w-4" /> Unassigned Pool <Badge variant="secondary" className="ml-2 h-5 px-1.5">{pool.length}</Badge></TabsTrigger>
              </TabsList>

              {/* TAB: DISCOVERY */}
              <TabsContent value="search" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Find New Business Leads</CardTitle>
                    <CardDescription>
                      Use natural language to find businesses. Try "Dentists in 98101" or "Cardiologists in Seattle".
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="e.g. Find all orthopedic surgeons near Everett, WA" 
                          className="pl-10 h-10 text-base"
                          value={searchQuery}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button type="submit" disabled={isSearching} className="w-32">
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                      </Button>
                    </form>

                    {searchResults.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b text-xs font-medium text-muted-foreground flex justify-between">
                          <span>Search Results</span>
                          <span>{searchResults.length} found</span>
                        </div>
                        {searchResults.map((result) => (
                          <div 
                            key={result.id} 
                            className={cn(
                              "flex items-center justify-between p-4 border-b last:border-0 transition-colors",
                              result.status === "exists" ? "bg-muted/40 opacity-60" : "hover:bg-muted/20"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "mt-1 p-2 rounded-full",
                                result.status === "exists" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                              )}>
                                <Building className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className={cn("font-semibold text-sm", result.status === "exists" && "text-muted-foreground")}>
                                  {result.name}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" /> {result.address}, {result.city} {result.zip}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Briefcase className="h-3 w-3" /> {result.type}
                                </p>
                              </div>
                            </div>
                            
                            {result.status === "exists" ? (
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1 pointer-events-none select-none">
                                <Info className="h-3 w-3" /> In System
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground" onClick={() => addToPool(result)}>
                                <Plus className="h-4 w-4" /> Add to Pool
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: IMPORT */}
              <TabsContent value="import" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Search & Bulk Add Professionals</CardTitle>
                    <CardDescription>Search for professionals by specialty and location, then add them to your database.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Specialty</Label>
                        <Input
                          placeholder="e.g., Dentist, Orthodontist"
                          value={bulkSpecialty}
                          onChange={(e) => setBulkSpecialty(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Location</Label>
                        <Input
                          placeholder="e.g., 10001, New York, NY"
                          value={bulkLocation}
                          onChange={(e) => setBulkLocation(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Territory</Label>
                        <Input
                          placeholder="e.g., NY-North"
                          value={bulkTerritory}
                          onChange={(e) => setBulkTerritory(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleBulkSearch}
                      disabled={bulkLoading}
                      className="w-full"
                    >
                      {bulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                      Search Professionals
                    </Button>
                  </CardContent>
                </Card>

                {bulkResults.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Results ({bulkResults.length})</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkSelectAll(bulkSelectedIds.size !== bulkResults.length)}
                      >
                        {bulkSelectedIds.size === bulkResults.length ? "Deselect All" : "Select All"}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {bulkResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={bulkSelectedIds.has(idx.toString())}
                              onCheckedChange={(checked) => handleBulkSelectOne(idx.toString(), !!checked)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">{result.name}</p>
                              {result.phone && (
                                <p className="text-sm text-muted-foreground">{result.phone}</p>
                              )}
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {[result.address, result.city, result.state, result.zip].filter(Boolean).join(", ")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={handleBulkAddSelected}
                        disabled={bulkAdding || bulkSelectedIds.size === 0}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {bulkAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Add {bulkSelectedIds.size} Contact{bulkSelectedIds.size !== 1 ? "s" : ""} to Pool
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {bulkResults.length === 0 && !bulkLoading && (
                  <Card className="p-8 text-center text-muted-foreground">
                    <p>Search for professionals to see results here</p>
                  </Card>
                )}
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
                      {/* Business Info */}
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

                      {/* Client Admins */}
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

                      {/* Providers */}
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
    </div>
  );
}
