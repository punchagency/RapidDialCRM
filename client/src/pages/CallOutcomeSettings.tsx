import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallOutcome {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  hoverColor?: string;
  sortOrder: number;
}

export default function CallOutcomeSettings() {
  const [outcomes, setOutcomes] = useState<CallOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOutcomes();
  }, []);

  const loadOutcomes = async () => {
    try {
      const response = await fetch("/api/call-outcomes");
      if (!response.ok) throw new Error("Failed to load outcomes");
      const data = await response.json();
      setOutcomes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load call outcomes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const outcome of outcomes) {
        await fetch(`/api/call-outcomes/${outcome.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: outcome.label,
            bgColor: outcome.bgColor,
            textColor: outcome.textColor,
            borderColor: outcome.borderColor,
            hoverColor: outcome.hoverColor,
            sortOrder: outcome.sortOrder,
          }),
        });
      }
      toast({
        title: "Success",
        description: "Call outcomes updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save call outcomes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadOutcomes();
    toast({
      title: "Reset",
      description: "Changes discarded",
    });
  };

  const updateOutcome = (id: string, field: string, value: string) => {
    setOutcomes(outcomes.map(o => 
      o.id === id ? { ...o, [field]: value } : o
    ));
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">Call Outcome Statuses</h1>
            <p className="text-sm text-muted-foreground">Customize the outcomes agents can select after a call.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 pb-4 border-b text-sm font-semibold text-muted-foreground">
                    <div>Label</div>
                    <div>Background Color</div>
                    <div>Text Color</div>
                    <div>Preview</div>
                    <div></div>
                  </div>
                  
                  {outcomes.map((outcome) => (
                    <div key={outcome.id} className="grid grid-cols-5 gap-4 items-center py-4 border-b">
                      <Input
                        value={outcome.label}
                        onChange={(e) => updateOutcome(outcome.id, "label", e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        value={outcome.bgColor}
                        onChange={(e) => updateOutcome(outcome.id, "bgColor", e.target.value)}
                        className="text-sm font-mono text-xs"
                        placeholder="e.g., bg-green-100"
                      />
                      <Input
                        value={outcome.textColor}
                        onChange={(e) => updateOutcome(outcome.id, "textColor", e.target.value)}
                        className="text-sm font-mono text-xs"
                        placeholder="e.g., text-green-700"
                      />
                      <Badge 
                        className={`${outcome.bgColor} ${outcome.textColor} font-semibold`}
                      >
                        {outcome.label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOutcomes(outcomes.filter(o => o.id !== outcome.id))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
