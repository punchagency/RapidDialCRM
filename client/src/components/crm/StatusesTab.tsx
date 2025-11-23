import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Save, Trash2, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CallOutcome {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  hoverColor?: string;
  sortOrder: number;
}

export function StatusesTab() {
  const { toast } = useToast();
  const [outcomes, setOutcomes] = useState<CallOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const loadOutcomes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/call-outcomes?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      if (!response.ok) throw new Error("Failed to load outcomes");
      const data = await response.json();
      setOutcomes(Array.isArray(data) ? data : []);
      setIsDirty(false);
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

  useEffect(() => {
    loadOutcomes();
  }, []);

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
        title: "Statuses Saved",
        description: "Your custom call outcome statuses have been updated.",
      });
      setIsDirty(false);
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
      title: "Reset Complete",
      description: "Changes discarded",
    });
  };

  const updateOutcome = (id: string, field: keyof CallOutcome, value: string | number) => {
    setOutcomes(outcomes.map(o => 
      o.id === id ? { ...o, [field]: value } : o
    ));
    setIsDirty(true);
  };

  const deleteOutcome = async (id: string) => {
    if (!confirm("Are you sure you want to delete this status?")) return;
    
    try {
      const response = await fetch(`/api/call-outcomes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete outcome");
      setOutcomes(outcomes.filter(o => o.id !== id));
      toast({
        title: "Status Deleted",
        description: "Call outcome removed successfully",
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading call outcomes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Call Outcome Statuses</h2>
          <p className="text-sm text-muted-foreground">Customize the outcomes agents can select after a call.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset} 
            disabled={isSaving || !isDirty}
            className="border-gray-300 text-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving || !isDirty}
            className="bg-pink-500 hover:bg-pink-600 text-white border-none shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card className="border shadow-sm bg-white overflow-hidden">
        {outcomes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No call outcomes configured</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[250px]">Label</TableHead>
                <TableHead className="w-[200px]">Background Color</TableHead>
                <TableHead className="w-[200px]">Text Color</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outcomes.map((outcome, index) => (
                <TableRow key={outcome.id} className="group hover:bg-muted/5">
                  <TableCell className="py-2">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground flex justify-center">
                      <GripHorizontal className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Input 
                      value={outcome.label} 
                      onChange={(e) => updateOutcome(outcome.id, "label", e.target.value)}
                      placeholder="e.g. Meeting Booked"
                      className="h-9 border-transparent hover:border-input focus:border-input transition-colors bg-transparent"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Input 
                      value={outcome.bgColor} 
                      onChange={(e) => updateOutcome(outcome.id, "bgColor", e.target.value)}
                      placeholder="e.g. bg-green-100"
                      className="h-9 border-transparent hover:border-input focus:border-input transition-colors bg-transparent font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <Input 
                      value={outcome.textColor} 
                      onChange={(e) => updateOutcome(outcome.id, "textColor", e.target.value)}
                      placeholder="e.g. text-green-700"
                      className="h-9 border-transparent hover:border-input focus:border-input transition-colors bg-transparent font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all" 
                      onClick={() => deleteOutcome(outcome.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      <p className="text-xs text-muted-foreground">
        Total: {outcomes.length} {outcomes.length === 1 ? "outcome" : "outcomes"}
      </p>
    </div>
  );
}
