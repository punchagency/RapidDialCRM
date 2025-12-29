import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, UserCog, Network, Map, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import type { FieldRep } from "@/lib/types";

type TeamRelationship = {
  id: string;
  insideRepId: string;
  fieldRepId?: string;
  managerId?: string;
};

type Relationship = {
  insideRepId: string;
  fieldRepIds: string[];
  managerIds: string[];
};

export function TeamStructureTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();

  // Fetch field reps
  const { data: fieldReps = [], isLoading: fieldRepsLoading } = useQuery({
    queryKey: ['fieldReps'],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getFieldReps();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  // Filter users by role
  const insideReps = useMemo(() => {
    return allUsers.filter((u: User) => u.role === 'inside_sales_rep' && u.isActive);
  }, [allUsers]);

  const managers = useMemo(() => {
    return allUsers.filter((u: User) => u.role === 'manager' && u.isActive);
  }, [allUsers]);

  // Set initial selected inside rep
  const [selectedInsideRep, setSelectedInsideRep] = useState<string>("");

  useEffect(() => {
    if (insideReps.length > 0 && !selectedInsideRep) {
      setSelectedInsideRep(insideReps[0].id);
    }
  }, [insideReps, selectedInsideRep]);

  // Fetch relationships for selected inside rep
  const { data: relationshipsData = [], isLoading: relationshipsLoading } = useQuery({
    queryKey: ['teamRelationships', selectedInsideRep],
    queryFn: async () => {
      if (!selectedInsideRep) return [];
      const { data, error } = await CustomServerApi.getTeamRelationships(selectedInsideRep);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!selectedInsideRep,
  });

  // Transform relationships data into our format
  const activeRel = useMemo(() => {
    if (!selectedInsideRep) {
      return { insideRepId: selectedInsideRep, fieldRepIds: [], managerIds: [] };
    }

    const fieldRepIds = relationshipsData
      .filter((rel: TeamRelationship) => rel.fieldRepId)
      .map((rel: TeamRelationship) => rel.fieldRepId!);

    const managerIds = relationshipsData
      .filter((rel: TeamRelationship) => rel.managerId)
      .map((rel: TeamRelationship) => rel.managerId!);

    return {
      insideRepId: selectedInsideRep,
      fieldRepIds,
      managerIds,
    };
  }, [relationshipsData, selectedInsideRep]);

  // Save relationships mutation
  const saveRelationshipsMutation = useMutation({
    mutationFn: async (payload: { insideRepId: string; fieldRepIds: string[]; managerIds: string[] }) => {
      const { data, error } = await CustomServerApi.saveTeamRelationships(payload);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamRelationships', selectedInsideRep] });
      toast({
        title: "Success",
        description: "Team relationships saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save team relationships",
        variant: "destructive",
      });
    },
  });

  const toggleFieldRep = (fieldId: string) => {
    if (!selectedInsideRep) return;

    const newFieldIds = activeRel.fieldRepIds.includes(fieldId)
      ? activeRel.fieldRepIds.filter(id => id !== fieldId)
      : [...activeRel.fieldRepIds, fieldId];

    saveRelationshipsMutation.mutate({
      insideRepId: selectedInsideRep,
      fieldRepIds: newFieldIds,
      managerIds: activeRel.managerIds,
    });
  };

  const toggleManager = (managerId: string) => {
    if (!selectedInsideRep) return;

    const newManagerIds = activeRel.managerIds.includes(managerId)
      ? activeRel.managerIds.filter(id => id !== managerId)
      : [...activeRel.managerIds, managerId];

    saveRelationshipsMutation.mutate({
      insideRepId: selectedInsideRep,
      fieldRepIds: activeRel.fieldRepIds,
      managerIds: newManagerIds,
    });
  };

  const isLoading = usersLoading || fieldRepsLoading || relationshipsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (insideReps.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No inside sales reps found. Please create users with the "inside_sales_rep" role.</p>
        </CardContent>
      </Card>
    );
  }

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
                  {insideReps.map((rep: User) => (
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
                        <AvatarFallback className="text-xs">{rep.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none">{rep.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Inside Sales</p>
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
                  Select which Field Sales Reps are supported by <span className="font-medium text-foreground">{insideReps.find((r: User) => r.id === selectedInsideRep)?.name}</span>.
                </p>
                {fieldReps.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No field reps available</p>
                ) : (
                  <div className="space-y-2">
                    {fieldReps.map((fieldRep: FieldRep) => {
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
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleFieldRep(fieldRep.id)}
                            disabled={saveRelationshipsMutation.isPending || !selectedInsideRep}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{fieldRep.name}</p>
                            <p className="text-[10px] text-muted-foreground">Field Sales • {fieldRep.territory}</p>
                          </div>
                          {saveRelationshipsMutation.isPending && isChecked && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  Select which Managers oversee <span className="font-medium text-foreground">{insideReps.find((r: User) => r.id === selectedInsideRep)?.name}</span>.
                </p>
                {managers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No managers available</p>
                ) : (
                  <div className="space-y-2">
                    {managers.map((mgr: User) => {
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
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleManager(mgr.id)}
                            disabled={saveRelationshipsMutation.isPending || !selectedInsideRep}
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{mgr.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{mgr.name}</p>
                            <p className="text-[10px] text-muted-foreground">Manager</p>
                          </div>
                          {saveRelationshipsMutation.isPending && isChecked && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                {insideReps.find((r: User) => r.id === selectedInsideRep)?.name} supports <span className="font-semibold text-foreground">{activeRel.fieldRepIds.length} Field Reps</span> and reports to <span className="font-semibold text-foreground">{activeRel.managerIds.length} Managers</span>.
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

