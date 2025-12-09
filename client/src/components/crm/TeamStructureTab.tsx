import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, UserCog, Network, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import avatar1 from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import avatar2 from "@assets/generated_images/Professional_user_avatar_2_9f00e114.png";

// Mock Data
const insideReps = [
  { id: "ir1", name: "Alex Johnson", role: "Inside Sales", avatar: avatar1 },
  { id: "ir2", name: "Sam Wilson", role: "Inside Sales", avatar: null },
  { id: "ir3", name: "Emily Davis", role: "Inside Sales", avatar: null },
];

const fieldReps = [
  { id: "fr1", name: "Mike Field", role: "Field Sales", avatar: null },
  { id: "fr2", name: "Jessica Wong", role: "Field Sales", avatar: null },
  { id: "fr3", name: "David Kim", role: "Field Sales", avatar: null },
  { id: "fr4", name: "Lisa Patel", role: "Field Sales", avatar: null },
];

const managers = [
  { id: "mg1", name: "Sarah Miller", role: "Manager", avatar: avatar2 },
  { id: "mg2", name: "Robert Stone", role: "Manager", avatar: null },
];

type Relationship = {
  insideRepId: string;
  fieldRepIds: string[];
  managerIds: string[];
};

export function TeamStructureTab() {
  const [selectedInsideRep, setSelectedInsideRep] = useState<string>(insideReps[0].id);
  
  // Mock State for relationships (initialized with some dummy data)
  const [relationships, setRelationships] = useState<Relationship[]>([
    { insideRepId: "ir1", fieldRepIds: ["fr1", "fr2"], managerIds: ["mg1"] },
    { insideRepId: "ir2", fieldRepIds: ["fr3"], managerIds: ["mg1", "mg2"] },
    { insideRepId: "ir3", fieldRepIds: ["fr4"], managerIds: ["mg2"] },
  ]);

  const activeRel = relationships.find(r => r.insideRepId === selectedInsideRep) || { 
    insideRepId: selectedInsideRep, 
    fieldRepIds: [], 
    managerIds: [] 
  };

  const toggleFieldRep = (fieldId: string) => {
    setRelationships(prev => {
      const existing = prev.find(r => r.insideRepId === selectedInsideRep);
      if (existing) {
        const newFieldIds = existing.fieldRepIds.includes(fieldId)
          ? existing.fieldRepIds.filter(id => id !== fieldId)
          : [...existing.fieldRepIds, fieldId];
        return prev.map(r => r.insideRepId === selectedInsideRep ? { ...r, fieldRepIds: newFieldIds } : r);
      }
      return [...prev, { insideRepId: selectedInsideRep, fieldRepIds: [fieldId], managerIds: [] }];
    });
  };

  const toggleManager = (managerId: string) => {
    setRelationships(prev => {
      const existing = prev.find(r => r.insideRepId === selectedInsideRep);
      if (existing) {
        const newManagerIds = existing.managerIds.includes(managerId)
            ? existing.managerIds.filter(id => id !== managerId)
            : [...existing.managerIds, managerId];
        return prev.map(r => r.insideRepId === selectedInsideRep ? { ...r, managerIds: newManagerIds } : r);
      }
       return [...prev, { insideRepId: selectedInsideRep, fieldRepIds: [], managerIds: [managerId] }];
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Structure & Assignments</CardTitle>
          <CardDescription>
            Manage many-to-many relationships between Inside Sales, Field Sales, and Managers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Select Inside Rep */}
            <div className="col-span-4 border-r pr-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCog className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">1. Select Inside Rep</h3>
              </div>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-2">
                  {insideReps.map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedInsideRep(rep.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                        selectedInsideRep === rep.id
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "hover:bg-muted border-transparent"
                      )}
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={rep.avatar || ""} />
                        <AvatarFallback className="text-xs">{rep.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none">{rep.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rep.role}</p>
                      </div>
                      {selectedInsideRep === rep.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Middle Column: Assign Field Reps */}
            <div className="col-span-4 px-2">
              <div className="flex items-center gap-2 mb-4">
                <Map className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-sm">2. Supports Field Reps</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 min-h-[400px] border border-dashed border-border">
                 <p className="text-xs text-muted-foreground mb-4">
                    Select which Field Sales Reps are supported by <span className="font-medium text-foreground">{insideReps.find(r => r.id === selectedInsideRep)?.name}</span>.
                 </p>
                 <div className="space-y-2">
                    {fieldReps.map((fieldRep) => {
                       const isChecked = activeRel.fieldRepIds.includes(fieldRep.id);
                       return (
                         <div 
                           key={fieldRep.id}
                           onClick={() => toggleFieldRep(fieldRep.id)}
                           className={cn(
                             "flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-all",
                             isChecked ? "bg-purple-500/10 border-purple-200" : "bg-card border-border hover:border-primary/30"
                           )}
                         >
                            <Checkbox checked={isChecked} onCheckedChange={() => toggleFieldRep(fieldRep.id)} />
                            <div className="flex-1">
                               <p className="text-sm font-medium">{fieldRep.name}</p>
                               <p className="text-[10px] text-muted-foreground">{fieldRep.role}</p>
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
            </div>

            {/* Right Column: Assign Managers */}
            <div className="col-span-4 border-l pl-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-sm">3. Reports To</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 min-h-[400px] border border-dashed border-border">
                 <p className="text-xs text-muted-foreground mb-4">
                    Select which Managers oversee <span className="font-medium text-foreground">{insideReps.find(r => r.id === selectedInsideRep)?.name}</span>.
                 </p>
                 <div className="space-y-2">
                    {managers.map((mgr) => {
                       const isChecked = activeRel.managerIds.includes(mgr.id);
                       return (
                         <div 
                           key={mgr.id}
                           onClick={() => toggleManager(mgr.id)}
                           className={cn(
                             "flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-all",
                             isChecked ? "bg-blue-500/10 border-blue-200" : "bg-card border-border hover:border-primary/30"
                           )}
                         >
                            <Checkbox checked={isChecked} onCheckedChange={() => toggleManager(mgr.id)} />
                            <Avatar className="h-6 w-6">
                               <AvatarImage src={mgr.avatar || ""} />
                               <AvatarFallback className="text-[10px]">{mgr.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                               <p className="text-sm font-medium">{mgr.name}</p>
                               <p className="text-[10px] text-muted-foreground">{mgr.role}</p>
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Summary */}
      <Card className="bg-muted/50">
         <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-background rounded-full border shadow-sm">
                  <Network className="h-5 w-5 text-muted-foreground" />
               </div>
               <div>
                  <h4 className="font-medium text-sm">Relationship Summary</h4>
                  <p className="text-xs text-muted-foreground">
                     {insideReps.find(r => r.id === selectedInsideRep)?.name} supports <span className="font-semibold text-foreground">{activeRel.fieldRepIds.length} Field Reps</span> and reports to <span className="font-semibold text-foreground">{activeRel.managerIds.length} Managers</span>.
                  </p>
               </div>
            </div>
            <Button variant="outline" size="sm">
               View Full Org Chart
            </Button>
         </CardContent>
      </Card>
    </div>
  );
}

