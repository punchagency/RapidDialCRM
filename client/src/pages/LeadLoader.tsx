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

export default function LeadLoader() {
  const { toast } = useToast();
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS>([]);
  const [pool, setPool] = useState(MOCK_POOL);
  const [isUploading, setIsUploading] = useState(false);

  const [territory, setTerritory] = useState("");
  const [isImportingAll, setIsImportingAll] = useState(false);

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
    if (!territory) {
      toast({
        title: "Missing Territory",
        description: "Please enter a territory first",
        variant: "destructive",
      });
      return;
    }

    setIsImportingAll(true);
    try {
      const res = await fetch("/api/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, territory, specialty: contacts[0]?.type || "Unknown" }),
      });
      const data = await res.json();
      
      const newPoolItems = contacts.map((c, i) => ({
        id: `nlp-${Date.now()}-${i}`,
        name: c.name,
        location: `${c.city}, ${c.state}`,
        type: c.type,
        source: "NLP Search",
        date: "Just now"
      }));
      setPool([...newPoolItems, ...pool]);
      setSearchResults([]);
      
      toast({
        title: "Import Complete",
        description: `Added ${data.added} contacts, skipped ${data.skipped}`,
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

  const addToPool = (lead: any) => {
    importContact([lead]);
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
                    <div className="space-y-4 mb-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Territory</Label>
                        <Input
                          placeholder="e.g., VA-North"
                          value={territory}
                          onChange={(e) => setTerritory(e.target.value)}
                          data-testid="input-territory"
                        />
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
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b text-xs font-medium text-muted-foreground flex justify-between">
                          <span>Search Results</span>
                          <span>{searchResults.length} found</span>
                        </div>
                        {searchResults.map((result) => (
                          <div 
                            key={result.id} 
                            className="flex items-start justify-between p-4 border-b last:border-0 hover:bg-muted/20 transition-colors"
                            data-testid={`card-result-${result.id}`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary">
                                <Building className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-foreground" data-testid={`text-name-${result.id}`}>
                                  {result.name}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1" data-testid={`text-address-${result.id}`}>
                                  {result.address}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                  {result.phone && (
                                    <p data-testid={`text-phone-${result.id}`}>📞 {result.phone}</p>
                                  )}
                                  {result.email && (
                                    <p data-testid={`text-email-${result.id}`}>✉️ {result.email}</p>
                                  )}
                                  {result.website && (
                                    <p data-testid={`text-website-${result.id}`}>🌐 {result.website}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button size="sm" variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground ml-4" onClick={() => addToPool(result)} data-testid={`button-add-${result.id}`}>
                              <Plus className="h-4 w-4" /> Add
                            </Button>
                          </div>
                        ))}
                        <div className="bg-muted/20 px-4 py-3 border-t">
                          <Button
                            onClick={() => importContact(searchResults)}
                            disabled={isImportingAll}
                            className="w-full bg-green-600 hover:bg-green-700"
                            data-testid="button-import-all"
                          >
                            {isImportingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                            Import All {searchResults.length} Results
                          </Button>
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
