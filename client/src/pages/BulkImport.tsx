import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Upload, CheckCircle, AlertCircle } from "lucide-react";

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

export default function BulkImport() {
  const { toast } = useToast();
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [territory, setTerritory] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!specialty || !location) {
      toast({
        title: "Missing Fields",
        description: "Please enter specialty and location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bulk-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, location }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setSelectedIds(new Set());
      
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
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(results.map((_, i) => i.toString())));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleAddSelected = async () => {
    if (!territory) {
      toast({
        title: "Missing Territory",
        description: "Please enter a territory",
        variant: "destructive",
      });
      return;
    }

    const contacts = results.filter((_, i) => selectedIds.has(i.toString()));
    if (contacts.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select contacts to add",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts, territory, specialty }),
      });
      const data = await res.json();
      
      toast({
        title: "Import Complete",
        description: `Added ${data.added} contacts, skipped ${data.skipped}`,
      });

      setResults([]);
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Unable to add contacts",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Import Contacts</h1>
        <p className="text-muted-foreground">Search for professionals and add them to your database</p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Professionals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Specialty</label>
              <Input
                placeholder="e.g., Dentist, Orthodontist"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                data-testid="input-specialty-search"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="e.g., 10001, New York, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                data-testid="input-location-search"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Territory</label>
              <Input
                placeholder="e.g., NY-North"
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                data-testid="input-territory"
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full"
            data-testid="button-search-professionals"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Results ({results.length})</CardTitle>
            <Button
              variant="outline"
              onClick={() => handleSelectAll(selectedIds.size !== results.length)}
              data-testid="button-select-all"
            >
              {selectedIds.size === results.length ? "Deselect All" : "Select All"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  data-testid={`card-result-${idx}`}
                >
                  <Checkbox
                    checked={selectedIds.has(idx.toString())}
                    onCheckedChange={(checked) => handleSelectOne(idx.toString(), !!checked)}
                    data-testid={`checkbox-result-${idx}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground" data-testid={`text-name-${idx}`}>
                      {result.name}
                    </p>
                    {result.phone && (
                      <p className="text-sm text-muted-foreground" data-testid={`text-phone-${idx}`}>
                        {result.phone}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-1" data-testid={`text-address-${idx}`}>
                      {[result.address, result.city, result.state, result.zip].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAddSelected}
              disabled={adding || selectedIds.size === 0}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-add-selected"
            >
              {adding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Add {selectedIds.size} Contact{selectedIds.size !== 1 ? "s" : ""}
            </Button>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && !loading && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>Search for professionals to see results here</p>
        </Card>
      )}
    </div>
  );
}
