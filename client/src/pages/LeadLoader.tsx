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
import { Search, Upload, Plus, Database, Globe, CheckCircle, MapPin, Building, Briefcase, FileUp, Loader2, Info, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function LeadLoader() {
  const { toast } = useToast();
  const [searchQuery, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS>([]);
  const [pool, setPool] = useState(MOCK_POOL);
  const [isUploading, setIsUploading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API search
    setTimeout(() => {
      setIsSearching(false);
      setSearchResults(MOCK_SEARCH_RESULTS);
      toast({
        title: "Search Complete",
        description: `Found ${MOCK_SEARCH_RESULTS.length} potential leads matching "${searchQuery}"`,
      });
    }, 1500);
  };

  const addToPool = (lead: typeof MOCK_SEARCH_RESULTS[0]) => {
    const newLead = {
      id: `new-${Date.now()}`,
      name: lead.name,
      location: `${lead.city}, WA`,
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
                          <div key={result.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/20 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 p-2 bg-primary/10 rounded-full">
                                <Building className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{result.name}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" /> {result.address}, {result.city} {result.zip}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Briefcase className="h-3 w-3" /> {result.type}
                                </p>
                              </div>
                            </div>
                            
                            {result.status === "exists" ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
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
              <TabsContent value="import">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Import Leads</CardTitle>
                    <CardDescription>Upload CSV or Excel files to bulk add leads to the unassigned pool.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer" onClick={handleBulkUpload}>
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">Drag & Drop file here</h3>
                      <p className="text-sm text-muted-foreground mb-4">or click to browse (CSV, XLSX)</p>
                      <Button disabled={isUploading}>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
                          </>
                        ) : "Select File"}
                      </Button>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Import Guidelines</p>
                        <p>Ensure your CSV has headers: Name, Phone, Email, Address, City, State, Zip, Profession.</p>
                        <p className="mt-1">Duplicates based on Phone/Email will be automatically skipped.</p>
                      </div>
                    </div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input placeholder="e.g. Northside Clinic" />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input placeholder="e.g. Dr. Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="(555) 000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input placeholder="contact@example.com" />
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
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="outline">Clear</Button>
                      <Button onClick={() => {
                        toast({ title: "Lead Added", description: "Manual entry added to unassigned pool." });
                        setPool([{ id: `man-${Date.now()}`, name: "Northside Clinic", location: "Seattle, WA", type: "Unknown", source: "Manual", date: "Just now" }, ...pool]);
                      }}>Add Lead</Button>
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
