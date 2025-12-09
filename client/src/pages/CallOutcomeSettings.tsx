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
    setIsLoading(true);
    try {
      const response = await fetch(`/api/call-outcomes?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
      if (!response.ok) throw new Error("Failed to load outcomes");
      const data = await response.json();
      setOutcomes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load outcomes error:", error);
      toast({
        title: "Error",
        description: "Failed to load call outcomes",
        variant: "destructive",
      });
      setOutcomes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const outcome of outcomes) {
        const response = await fetch(`/api/call-outcomes/${outcome.id}`, {
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
        if (!response.ok) throw new Error(`Failed to update outcome ${outcome.id}`);
      }
      toast({
        title: "Success",
        description: "Call outcomes updated successfully",
      });
      await loadOutcomes();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save call outcomes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    await loadOutcomes();
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

  const deleteOutcome = async (id: string) => {
    try {
      const response = await fetch(`/api/call-outcomes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete outcome");
      setOutcomes(outcomes.filter(o => o.id !== id));
      toast({
        title: "Success",
        description: "Call outcome deleted",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete call outcome",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <Button 
              variant="outline" 
              onClick={handleReset} 
              disabled={isSaving}
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-pink-600 hover:bg-pink-700"
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6">
                {outcomes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No call outcomes configured</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3 pb-4 border-b text-sm font-semibold text-muted-foreground">
                      <div>Label</div>
                      <div>Background Color</div>
                      <div>Text Color</div>
                      <div className="text-right">Action</div>
                    </div>
                    
                    {outcomes.map((outcome, index) => (
                      <div 
                        key={outcome.id} 
                        className="grid grid-cols-4 gap-3 items-center py-3 border-b last:border-b-0"
                        data-testid={`row-outcome-${outcome.id}`}
                      >
                        <Input
                          value={outcome.label}
                          onChange={(e) => updateOutcome(outcome.id, "label", e.target.value)}
                          className="text-sm"
                          data-testid={`input-label-${outcome.id}`}
                        />
                        <Input
                          value={outcome.bgColor}
                          onChange={(e) => updateOutcome(outcome.id, "bgColor", e.target.value)}
                          className="text-sm font-mono text-xs"
                          placeholder="e.g., bg-green-100"
                          data-testid={`input-bgcolor-${outcome.id}`}
                        />
                        <Input
                          value={outcome.textColor}
                          onChange={(e) => updateOutcome(outcome.id, "textColor", e.target.value)}
                          className="text-sm font-mono text-xs"
                          placeholder="e.g., text-green-700"
                          data-testid={`input-textcolor-${outcome.id}`}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Badge 
                            className={`${outcome.bgColor} ${outcome.textColor} font-semibold`}
                            data-testid={`badge-preview-${outcome.id}`}
                          >
                            {outcome.label || "Preview"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteOutcome(outcome.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-${outcome.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <p className="text-xs text-muted-foreground mt-4">
              Total: {outcomes.length} {outcomes.length === 1 ? "outcome" : "outcomes"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
