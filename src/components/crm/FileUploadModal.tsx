import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploadModal({ isOpen, onClose, onFileSelect, isLoading = false }: FileUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
      onClose();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="file-upload-modal">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
          <DialogDescription>
            Import practices from a CSV file containing your leads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all",
              isDragging
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/2.5"
            )}
            data-testid="drag-drop-zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={isLoading}
            />

            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "p-3 rounded-full transition-colors",
                isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Upload className="h-6 w-6" />
              </div>
              
              <div>
                <p className="font-semibold text-foreground">
                  {isDragging ? "Drop your CSV file here" : "Drag and drop your CSV file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                CSV files only (.csv)
              </p>
            </div>
          </div>

          {/* File Requirements */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Required columns:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-6">
              <li>• Business Name</li>
              <li>• Phone Number</li>
              <li>• Address</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-2">
              Optional: Email, Full Name, City, ZIP Code, Category
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

