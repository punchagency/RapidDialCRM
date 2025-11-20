import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  getStatuses, saveStatuses, getDefaultStatusConfig, 
  StatusConfig, ICON_MAP, AVAILABLE_COLORS 
} from "@/lib/statusUtils";
import { Plus, Trash2, RotateCcw, Save, GripVertical, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function StatusesTab() {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<StatusConfig[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Load statuses on mount
  useEffect(() => {
    const saved = localStorage.getItem("custom_statuses");
    if (saved) {
       try {
         setStatuses(JSON.parse(saved));
       } catch(e) {
         setStatuses(getDefaultStatusConfig());
       }
    } else {
       setStatuses(getDefaultStatusConfig());
    }
  }, []);

  const handleSave = () => {
    saveStatuses(statuses);
    setIsDirty(false);
    toast({
      title: "Statuses Saved",
      description: "Your custom call outcome statuses have been updated.",
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default statuses? This will lose your changes.")) {
      const defaults = getDefaultStatusConfig();
      setStatuses(defaults);
      saveStatuses(defaults);
      setIsDirty(false);
      toast({
        title: "Reset Complete",
        description: "Statuses restored to system defaults.",
      });
    }
  };

  const addStatus = () => {
    const newStatus: StatusConfig = {
      label: "New Status",
      value: `custom-${Date.now()}`,
      color: AVAILABLE_COLORS[0].value,
      iconName: "Star"
    };
    setStatuses([...statuses, newStatus]);
    setIsDirty(true);
  };

  const removeStatus = (index: number) => {
    const newStatuses = [...statuses];
    newStatuses.splice(index, 1);
    setStatuses(newStatuses);
    setIsDirty(true);
  };

  const updateStatus = (index: number, field: keyof StatusConfig, value: string) => {
    const newStatuses = [...statuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    
    if (field === "label") {
       newStatuses[index].value = value; 
    }

    setStatuses(newStatuses);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
         <div>
           <h2 className="text-lg font-semibold">Call Outcome Statuses</h2>
           <p className="text-sm text-muted-foreground">Customize the outcomes agents can select after a call.</p>
         </div>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleReset} className="border-gray-300 text-gray-700">
             <RotateCcw className="h-4 w-4 mr-2" /> Reset
           </Button>
           <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={!isDirty}
              className="bg-pink-500 hover:bg-pink-600 text-white border-none shadow-sm"
           >
             <Save className="h-4 w-4 mr-2" /> Save Changes
           </Button>
         </div>
      </div>

      <Card className="border shadow-sm bg-white overflow-hidden">
        <Table>
           <TableHeader className="bg-muted/40">
              <TableRow>
                 <TableHead className="w-[40px]"></TableHead>
                 <TableHead className="w-[250px]">Label</TableHead>
                 <TableHead className="w-[200px]">Color Theme</TableHead>
                 <TableHead className="w-[200px]">Icon</TableHead>
                 <TableHead>Preview</TableHead>
                 <TableHead className="w-[50px]"></TableHead>
              </TableRow>
           </TableHeader>
           <TableBody>
              {statuses.map((status, index) => {
                 const Icon = ICON_MAP[status.iconName] || ICON_MAP.Star;
                 return (
                    <TableRow key={index} className="group hover:bg-muted/5">
                       <TableCell className="py-2">
                          <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground flex justify-center">
                             <GripHorizontal className="h-4 w-4" />
                          </div>
                       </TableCell>
                       <TableCell className="py-2">
                          <Input 
                             value={status.label} 
                             onChange={(e) => updateStatus(index, "label", e.target.value)}
                             placeholder="e.g. Meeting Booked"
                             className="h-9 border-transparent hover:border-input focus:border-input transition-colors bg-transparent"
                          />
                       </TableCell>
                       <TableCell className="py-2">
                          <Select value={status.color} onValueChange={(v) => updateStatus(index, "color", v)}>
                             <SelectTrigger className="h-9 border-transparent hover:border-input focus:border-input bg-transparent">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                                {AVAILABLE_COLORS.map((c) => (
                                   <SelectItem key={c.value} value={c.value}>
                                      <div className="flex items-center gap-2">
                                         <div className={cn("w-3 h-3 rounded-full", c.value.split(" ")[0])} />
                                         {c.label}
                                      </div>
                                   </SelectItem>
                                ))}
                             </SelectContent>
                          </Select>
                       </TableCell>
                       <TableCell className="py-2">
                          <Select value={status.iconName} onValueChange={(v) => updateStatus(index, "iconName", v)}>
                             <SelectTrigger className="h-9 border-transparent hover:border-input focus:border-input bg-transparent">
                                <div className="flex items-center gap-2">
                                   <Icon className="h-4 w-4 text-muted-foreground" />
                                   <span>{status.iconName}</span>
                                </div>
                             </SelectTrigger>
                             <SelectContent>
                                <ScrollArea className="h-[200px]">
                                   {Object.keys(ICON_MAP).map((iconName) => {
                                      const ItemIcon = ICON_MAP[iconName];
                                      return (
                                         <SelectItem key={iconName} value={iconName}>
                                            <div className="flex items-center gap-2">
                                               <ItemIcon className="h-4 w-4" />
                                               {iconName}
                                            </div>
                                         </SelectItem>
                                      );
                                   })}
                                </ScrollArea>
                             </SelectContent>
                          </Select>
                       </TableCell>
                       <TableCell className="py-2">
                          <div className={cn(
                             "px-2.5 py-1 rounded-md border text-xs font-semibold whitespace-nowrap w-fit flex items-center gap-1.5",
                             status.color
                          )}>
                             <Icon className="h-3 w-3" />
                             {status.label || "Preview"}
                          </div>
                       </TableCell>
                       <TableCell className="py-2 text-right">
                          <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all" 
                             onClick={() => removeStatus(index)}
                          >
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </TableCell>
                    </TableRow>
                 );
              })}
              
              <TableRow>
                 <TableCell colSpan={6} className="p-2">
                    <Button 
                       variant="ghost" 
                       className="w-full border border-dashed border-muted-foreground/20 text-muted-foreground h-10 hover:bg-muted/5 hover:text-primary hover:border-primary/30" 
                       onClick={addStatus}
                    >
                       <Plus className="h-4 w-4 mr-2" /> Add New Status
                    </Button>
                 </TableCell>
              </TableRow>
           </TableBody>
        </Table>
      </Card>
    </div>
  );
}
