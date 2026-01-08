import { useState, useEffect } from "react";
import type { Prospect, Script } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { CustomServerApi } from "@/integrations/custom-server/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScriptsTabProps {
  prospect: Prospect;
}

export function ScriptsTab({ prospect }: ScriptsTabProps) {
  const [selectedScriptId, setSelectedScriptId] = useState<string>("none");
  const [processedContent, setProcessedContent] = useState<string>("");

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["scripts", prospect.specialty], // Include specialty to refresh if it changes, though usage suggests fetching all or by profession
    queryFn: async () => {
      // Pass specialty as profession if needed, or just fetch all.
      // The user request pointed to api.ts L888 which takes an optional profession.
      const { data, error } = await CustomServerApi.getScripts();
      if (error) throw new Error(error);
      return (data || []) as Script[];
    },
    staleTime: 60000,
  });

  // Effect to select the first script by default when scripts load
  useEffect(() => {
    if (scripts.length > 0 && selectedScriptId === "none") {
      const defaultScript = scripts.find((s) => s.isDefault) || scripts[0];
      if (defaultScript) {
        setSelectedScriptId(defaultScript.id);
      }
    }
  }, [scripts, selectedScriptId]);

  // Effect to process content when script or prospect changes
  useEffect(() => {
    const script = scripts.find((s) => s.id === selectedScriptId);
    if (script) {
      setProcessedContent(processScriptContent(script.content, prospect));
    } else {
      setProcessedContent("");
    }
  }, [selectedScriptId, scripts, prospect]);

  const processScriptContent = (content: string, prospect: Prospect) => {
    return content.replace(/\{\{([\w]+)\}\}/g, (match, key) => {
      const value = prospect[key as keyof Prospect];
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return String(value);
      }
      return match;
    });
  };

  const handlePrevious = () => {
    const currentIndex = scripts.findIndex((s) => s.id === selectedScriptId);
    if (currentIndex > 0) {
      setSelectedScriptId(scripts[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = scripts.findIndex((s) => s.id === selectedScriptId);
    if (currentIndex < scripts.length - 1 && currentIndex !== -1) {
      setSelectedScriptId(scripts[currentIndex + 1].id);
    }
  };

  const currentScript = scripts.find((s) => s.id === selectedScriptId);
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header / Config Area */}
      <div className="flex items-center justify-between gap-2 p-1">
        <div className="flex items-center gap-2 flex-1">
          <Select
            value={selectedScriptId}
            onValueChange={setSelectedScriptId}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full max-w-[280px] h-9 text-sm">
              <SelectValue
                placeholder={isLoading ? "Loading scripts..." : "Select Script"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select a script...</SelectItem>
              {scripts.map((script) => (
                <SelectItem key={script.id} value={script.id}>
                  {script.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Navigation Arrows */}
          <div className="flex items-center border rounded-md bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={handlePrevious}
              disabled={
                isLoading ||
                scripts.length === 0 ||
                scripts.findIndex((s) => s.id === selectedScriptId) <= 0
              }
              title="Previous Script"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-border" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={handleNext}
              disabled={
                isLoading ||
                scripts.length === 0 ||
                scripts.findIndex((s) => s.id === selectedScriptId) >=
                  scripts.length - 1
              }
              title="Next Script"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Script Content Area */}
      <Card className="flex-1 bg-muted/10 border-muted-foreground/20 shadow-none">
        <CardContent className="p-4 h-full">
          <ScrollArea className="h-[400px] w-full pr-4">
            {selectedScriptId !== "none" && currentScript ? (
              <div className="space-y-4">
                {/* Optional: Show script metadata like usage advice or profession */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2 mb-4">
                  <span className="font-semibold">{currentScript.name}</span>
                  {currentScript.profession && (
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      <Info className="h-3 w-3" />
                      {currentScript.profession}
                    </span>
                  )}
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground">
                  {processedContent}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-60 pt-20">
                <Info className="h-10 w-10" />
                <p>Select a script to get started</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Access / Missing Variables Warning (Optional Enhancement) */}
      {processedContent.includes("{{") && (
        <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <Info className="h-3 w-3" />
          <span>
            Some variables could not be replaced. Check missing prospect data.
          </span>
        </div>
      )}
    </div>
  );
}
