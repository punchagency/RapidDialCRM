import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImportModal() {
  const [step, setStep] = useState<"upload" | "mapping" | "success">("upload");
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setStep("mapping");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Leads from Google Sheets</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div
            className={cn(
              "mt-4 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => setStep("mapping")}
          >
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Drag and drop your CSV or Excel file</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </div>
        )}

        {step === "mapping" && (
          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>We detected 342 rows. Please confirm the column mapping below.</p>
            </div>
            
            <div className="space-y-2">
              <MappingRow source="Client Name" target="Contact Name" />
              <MappingRow source="Ph Number" target="Phone" />
              <MappingRow source="Zip" target="Zip Code" />
            </div>

            <DialogFooter className="mt-6">
               <Button variant="ghost" onClick={() => setStep("upload")}>Back</Button>
               <Button onClick={() => setStep("success")}>Import 342 Records</Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && (
          <div className="mt-4 flex flex-col items-center justify-center text-center py-6">
             <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Import Complete!</h3>
            <p className="text-sm text-muted-foreground mt-2">342 new leads have been added to the queue.</p>
            <DialogFooter className="mt-6 w-full">
               <Button className="w-full" onClick={() => setStep("upload")}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MappingRow({ source, target }: { source: string, target: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
       <span className="text-sm text-muted-foreground">{source}</span>
       <span className="text-xs text-muted-foreground px-2">→</span>
       <span className="text-sm font-medium">{target}</span>
    </div>
  );
}
