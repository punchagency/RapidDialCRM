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
import { Plus, Trash2, RotateCcw, Save, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
             <div>
               <CardTitle>Call Outcome Statuses</CardTitle>
               <CardDescription>Customize the list of outcomes agents can select after a call.</CardDescription>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={handleReset} className="border-gray-300 text-gray-700">
                 <RotateCcw className="h-4 w-4 mr-2" /> Reset Defaults
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
        </CardHeader>
        <CardContent>
           <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                 {statuses.map((status, index) => {
                    const Icon = ICON_MAP[status.iconName] || ICON_MAP.Star;
                    return (
                       <div key={index} className="flex items-start gap-4 p-6 border rounded-xl bg-white hover:border-gray-300 transition-colors group shadow-sm">
                          <div className="mt-8 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors">
                             <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Label */}
                             <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500">Label</Label>
                                <Input 
                                   value={status.label} 
                                   onChange={(e) => updateStatus(index, "label", e.target.value)}
                                   placeholder="e.g. Meeting Booked"
                                   className="h-10"
                                />
                             </div>

                             {/* Color */}
                             <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500">Color Theme</Label>
                                <Select value={status.color} onValueChange={(v) => updateStatus(index, "color", v)}>
                                   <SelectTrigger className="h-10">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                      {AVAILABLE_COLORS.map((c) => (
                                         <SelectItem key={c.value} value={c.value}>
                                            <div className="flex items-center gap-2">
                                               <div className={cn("w-4 h-4 rounded", c.value.split(" ")[0])} />
                                               {c.label}
                                            </div>
                                         </SelectItem>
                                      ))}
                                   </SelectContent>
                                </Select>
                             </div>

                             {/* Icon */}
                             <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500">Icon</Label>
                                <Select value={status.iconName} onValueChange={(v) => updateStatus(index, "iconName", v)}>
                                   <SelectTrigger className="h-10">
                                      <div className="flex items-center gap-2">
                                         <Icon className="h-4 w-4 text-gray-500" />
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
                             </div>
                          </div>

                          {/* Preview & Remove */}
                          <div className="flex flex-col items-center justify-center gap-4 mt-6 ml-4 w-24">
                             <div className={cn(
                                "px-3 py-1.5 rounded-md border text-xs font-semibold whitespace-nowrap shadow-sm min-w-[80px] text-center",
                                status.color
                             )}>
                                {status.label || "Preview"}
                             </div>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 transition-colors" 
                                onClick={() => removeStatus(index)}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                       </div>
                    );
                 })}

                 <Button variant="outline" className="w-full border-dashed h-12 text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50" onClick={addStatus}>
                    <Plus className="h-4 w-4 mr-2" /> Add New Status
                 </Button>
              </div>
           </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
