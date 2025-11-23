import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Save, Trash2, GripHorizontal, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CallOutcome {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  hoverColor?: string;
  sortOrder: number;
}

const BACKGROUND_COLORS = [
  { label: "Slate", value: "bg-slate-100", preview: "bg-slate-100" },
  { label: "Gray", value: "bg-gray-100", preview: "bg-gray-100" },
  { label: "Gray Dark", value: "bg-gray-700", preview: "bg-gray-700" },
  { label: "Red", value: "bg-red-100", preview: "bg-red-100" },
  { label: "Red Dark", value: "bg-red-600", preview: "bg-red-600" },
  { label: "Orange", value: "bg-orange-100", preview: "bg-orange-100" },
  { label: "Amber", value: "bg-amber-100", preview: "bg-amber-100" },
  { label: "Yellow", value: "bg-yellow-100", preview: "bg-yellow-100" },
  { label: "Lime", value: "bg-lime-100", preview: "bg-lime-100" },
  { label: "Green", value: "bg-green-100", preview: "bg-green-100" },
  { label: "Emerald", value: "bg-emerald-100", preview: "bg-emerald-100" },
  { label: "Teal", value: "bg-teal-100", preview: "bg-teal-100" },
  { label: "Cyan", value: "bg-cyan-100", preview: "bg-cyan-100" },
  { label: "Sky", value: "bg-sky-100", preview: "bg-sky-100" },
  { label: "Blue", value: "bg-blue-100", preview: "bg-blue-100" },
  { label: "Indigo", value: "bg-indigo-100", preview: "bg-indigo-100" },
  { label: "Violet", value: "bg-violet-100", preview: "bg-violet-100" },
  { label: "Purple", value: "bg-purple-100", preview: "bg-purple-100" },
  { label: "Purple Dark", value: "bg-purple-300", preview: "bg-purple-300" },
  { label: "Fuchsia", value: "bg-fuchsia-100", preview: "bg-fuchsia-100" },
  { label: "Pink", value: "bg-pink-100", preview: "bg-pink-100" },
];

const TEXT_COLORS = [
  { label: "Slate", value: "text-slate-700", preview: "bg-slate-700" },
  { label: "Gray", value: "text-gray-700", preview: "bg-gray-700" },
  { label: "Gray Dark", value: "text-gray-800", preview: "bg-gray-800" },
  { label: "White", value: "text-white", preview: "bg-white border border-gray-300" },
  { label: "Red", value: "text-red-700", preview: "bg-red-700" },
  { label: "Orange", value: "text-orange-700", preview: "bg-orange-700" },
  { label: "Amber", value: "text-amber-700", preview: "bg-amber-700" },
  { label: "Yellow", value: "text-yellow-700", preview: "bg-yellow-700" },
  { label: "Lime", value: "text-lime-700", preview: "bg-lime-700" },
  { label: "Green", value: "text-green-700", preview: "bg-green-700" },
  { label: "Emerald", value: "text-emerald-700", preview: "bg-emerald-700" },
  { label: "Teal", value: "text-teal-700", preview: "bg-teal-700" },
  { label: "Cyan", value: "text-cyan-700", preview: "bg-cyan-700" },
  { label: "Sky", value: "text-sky-700", preview: "bg-sky-700" },
  { label: "Blue", value: "text-blue-700", preview: "bg-blue-700" },
  { label: "Indigo", value: "text-indigo-700", preview: "bg-indigo-700" },
  { label: "Violet", value: "text-violet-700", preview: "bg-violet-700" },
  { label: "Purple", value: "text-purple-700", preview: "bg-purple-700" },
  { label: "Fuchsia", value: "text-fuchsia-700", preview: "bg-fuchsia-700" },
  { label: "Pink", value: "text-pink-700", preview: "bg-pink-700" },
];

function ColorPicker({ 
  value, 
  onChange, 
  colors, 
  type 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  colors: typeof BACKGROUND_COLORS; 
  type: 'bg' | 'text';
}) {
  const selectedColor = colors.find(c => c.value === value);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-full justify-between border-transparent hover:border-input bg-transparent px-2"
        >
          <div className="flex items-center gap-2">
            <div className={cn("w-5 h-5 rounded border", selectedColor?.preview || "bg-gray-200")} />
            <span className="text-xs text-muted-foreground truncate">
              {selectedColor?.label || value}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-4 gap-1.5">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onChange(color.value)}
              className={cn(
                "w-full h-10 rounded border-2 hover:scale-110 transition-transform",
                color.preview,
                value === color.value ? "border-primary ring-2 ring-primary ring-offset-1" : "border-gray-300"
              )}
              title={color.label}
            />
          ))}
        </div>
        <div className="mt-2 pt-2 border-t">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={type === 'bg' ? "e.g. bg-green-100" : "e.g. text-green-700"}
            className="h-8 text-xs font-mono"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
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
                <TableHead className="w-[220px]">Label</TableHead>
                <TableHead className="w-[180px]">Background Color</TableHead>
                <TableHead className="w-[180px]">Text Color</TableHead>
                <TableHead className="w-[120px]">Preview</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outcomes.map((outcome) => (
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
                    <ColorPicker
                      value={outcome.bgColor}
                      onChange={(value) => updateOutcome(outcome.id, "bgColor", value)}
                      colors={BACKGROUND_COLORS}
                      type="bg"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <ColorPicker
                      value={outcome.textColor}
                      onChange={(value) => updateOutcome(outcome.id, "textColor", value)}
                      colors={TEXT_COLORS}
                      type="text"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <div className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap w-fit border",
                      outcome.bgColor,
                      outcome.textColor
                    )}>
                      {outcome.label || "Preview"}
                    </div>
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
