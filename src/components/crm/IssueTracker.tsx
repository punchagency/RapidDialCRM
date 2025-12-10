import React, { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bug, Camera, Pencil, Type, Highlighter, Undo, Check, X, ChevronRight, ChevronLeft, ExternalLink, Upload, Clipboard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface IssueTrackerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tool = "pen" | "highlighter" | "text" | "arrow";
type Step = "capture" | "annotate" | "describe";

const PRIORITY_OPTIONS = [
  { value: "0", label: "Urgent", color: "bg-red-500" },
  { value: "1", label: "High", color: "bg-orange-500" },
  { value: "2", label: "Medium", color: "bg-yellow-500" },
  { value: "3", label: "Low", color: "bg-blue-500" },
  { value: "4", label: "No Priority", color: "bg-gray-400" },
];

const STATUS_OPTIONS = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export function IssueTracker({ isOpen, onClose }: IssueTrackerProps) {
  const [step, setStep] = useState<Step>("capture");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>("pen");
  const [penColor, setPenColor] = useState("#ff0000");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("2");
  const [status, setStatus] = useState("backlog");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const drawHistory = useRef<ImageData[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createIssueMutation = useMutation({
    mutationFn: async (issueData: any) => {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueData),
      });
      if (!response.ok) throw new Error("Failed to create issue");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Issue Created",
        description: data.linearIssueUrl 
          ? "Issue created and synced to Linear!" 
          : "Issue created successfully!",
      });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create issue",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep("capture");
    setScreenshot(null);
    setAnnotatedImage(null);
    setTitle("");
    setDescription("");
    setPriority("2");
    setStatus("backlog");
    setIsDragging(false);
    drawHistory.current = [];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setScreenshot(dataUrl);
        setStep("annotate");
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file);
          return;
        }
      }
    }
  }, [handleImageFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  }, [handleImageFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  }, [handleImageFile]);

  useEffect(() => {
    if (isOpen && step === "capture") {
      document.addEventListener('paste', handlePaste);
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [isOpen, step, handlePaste]);

  useEffect(() => {
    if (step === "annotate" && screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawHistory.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
      };
      img.src = screenshot;
    }
  }, [step, screenshot]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const pos = getCanvasCoordinates(e);
    lastPos.current = pos;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const pos = getCanvasCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    
    if (selectedTool === "pen") {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.globalAlpha = 1;
    } else if (selectedTool === "highlighter") {
      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.3;
    }
    
    ctx.stroke();
    ctx.globalAlpha = 1;
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    if (isDrawing.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawHistory.current.push(
          ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
        );
      }
    }
    isDrawing.current = false;
  };

  const undo = () => {
    if (drawHistory.current.length > 1 && canvasRef.current) {
      drawHistory.current.pop();
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.putImageData(drawHistory.current[drawHistory.current.length - 1], 0, 0);
      }
    }
  };

  const saveAnnotatedImage = () => {
    if (canvasRef.current) {
      setAnnotatedImage(canvasRef.current.toDataURL("image/png"));
      setStep("describe");
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the issue",
        variant: "destructive",
      });
      return;
    }

    createIssueMutation.mutate({
      title,
      description,
      priority: parseInt(priority),
      status,
      screenshotData: annotatedImage || screenshot,
      pagePath: window.location.pathname,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto issue-tracker-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report Issue
            <div className="flex gap-1 ml-4">
              {["capture", "annotate", "describe"].map((s, i) => (
                <Badge 
                  key={s} 
                  variant={step === s ? "default" : "outline"}
                  className="text-xs"
                >
                  {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
                </Badge>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === "capture" && (
          <div className="space-y-6 py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
              data-testid="file-input"
            />
            
            <div 
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                ${isDragging 
                  ? "border-primary bg-primary/10" 
                  : "border-gray-300 hover:border-primary hover:bg-primary/5"
                }
              `}
              onClick={() => fileInputRef.current?.click()}
              data-testid="drop-zone"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Add Screenshot</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    <span className="font-medium">Drag & drop</span> an image here, or <span className="font-medium text-primary">click to browse</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clipboard className="h-4 w-4" />
                <span>Take a screenshot with your system tool, then <span className="font-medium">paste here</span> (Ctrl/Cmd+V)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Windows: Win+Shift+S | Mac: Cmd+Shift+4 | Then paste with Ctrl/Cmd+V
              </p>
            </div>
            
            <div className="text-center pt-2">
              <Button 
                variant="ghost" 
                className="text-muted-foreground"
                onClick={() => setStep("describe")}
              >
                Skip Screenshot
              </Button>
            </div>
          </div>
        )}

        {step === "annotate" && screenshot && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={selectedTool === "pen" ? "default" : "outline"}
                onClick={() => setSelectedTool("pen")}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Pen
              </Button>
              <Button
                size="sm"
                variant={selectedTool === "highlighter" ? "default" : "outline"}
                onClick={() => setSelectedTool("highlighter")}
              >
                <Highlighter className="h-4 w-4 mr-1" />
                Highlight
              </Button>
              
              {selectedTool === "pen" && (
                <div className="flex gap-1 ml-2">
                  {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#000000"].map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${penColor === color ? "border-primary" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setPenColor(color)}
                    />
                  ))}
                </div>
              )}
              
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={undo}>
                  <Undo className="h-4 w-4 mr-1" />
                  Undo
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-muted/20">
              <canvas
                ref={canvasRef}
                className="max-w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("capture")}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={saveAnnotatedImage} data-testid="save-annotation-button">
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "describe" && (
          <div className="space-y-4 py-4">
            {(annotatedImage || screenshot) && (
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <img 
                  src={annotatedImage || screenshot || ""} 
                  alt="Screenshot" 
                  className="max-w-full max-h-48 object-contain mx-auto"
                />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="issue-title">Title *</Label>
                <Input
                  id="issue-title"
                  placeholder="Brief description of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="issue-title-input"
                />
              </div>
              
              <div>
                <Label htmlFor="issue-description">Description</Label>
                <Textarea
                  id="issue-description"
                  placeholder="Detailed description, steps to reproduce, expected behavior..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  data-testid="issue-description-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger data-testid="issue-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="issue-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(screenshot ? "annotate" : "capture")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createIssueMutation.isPending}
                data-testid="submit-issue-button"
              >
                {createIssueMutation.isPending ? "Creating..." : "Create Issue"}
                <Check className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function IssueTrackerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        onClick={() => setIsOpen(true)}
        data-testid="open-issue-tracker-button"
      >
        <Bug className="h-4 w-4 mr-2" />
        Report Issue
      </Button>
      <IssueTracker isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

