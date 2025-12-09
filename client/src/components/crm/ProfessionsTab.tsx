import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Briefcase, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_PROFESSIONS } from "@/lib/mockData";

export function ProfessionsTab() {
  const [professions, setProfessions] = useState<string[]>([]);
  const [newProfession, setNewProfession] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("crm_professions");
    if (stored) {
      setProfessions(JSON.parse(stored));
    } else {
      setProfessions(DEFAULT_PROFESSIONS);
      localStorage.setItem("crm_professions", JSON.stringify(DEFAULT_PROFESSIONS));
    }
  }, []);

  const handleAdd = () => {
    if (!newProfession.trim()) return;
    
    if (professions.some(p => p.toLowerCase() === newProfession.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Duplicate Entry",
            description: "This profession type already exists."
        });
        return;
    }

    const updated = [...professions, newProfession.trim()];
    setProfessions(updated);
    localStorage.setItem("crm_professions", JSON.stringify(updated));
    setNewProfession("");
    toast({
        title: "Profession Added",
        description: `${newProfession} added to the list.`
    });
  };

  const handleDelete = (profession: string) => {
    const updated = professions.filter(p => p !== profession);
    setProfessions(updated);
    localStorage.setItem("crm_professions", JSON.stringify(updated));
    toast({
        title: "Profession Removed",
        description: `${profession} removed from the list.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-medium">Profession Types</h3>
           <p className="text-sm text-muted-foreground">Define the types of medical professionals you serve. These are used for contact classification and template defaults.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Manage Professions</CardTitle>
            <CardDescription>Add or remove specialties to customize your CRM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Label htmlFor="new-profession" className="sr-only">New Profession</Label>
                    <Input 
                        id="new-profession"
                        placeholder="e.g. Med Spa Owner" 
                        value={newProfession}
                        onChange={(e) => setNewProfession(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Type
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {professions.map((profession) => (
                    <div key={profession} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border group hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <Briefcase className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm">{profession}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(profession)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            
            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-start gap-2 border border-blue-100">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Tip: Adding a new profession type here will make it available when creating Email Templates defaults.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

