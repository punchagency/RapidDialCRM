import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Map, Briefcase, Save, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useUsers, useAllTerritories, useAllProfessions, useUserAssignments, useSetUserAssignments } from "@/hooks/useUsers";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  territory: string | null;
  isActive: boolean;
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Sales Manager",
  inside_sales_rep: "Inside Sales Rep",
  field_sales_rep: "Field Sales Rep",
  data_loader: "Data Loader",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-purple-100 text-purple-800",
  inside_sales_rep: "bg-blue-100 text-blue-800",
  field_sales_rep: "bg-green-100 text-green-800",
  data_loader: "bg-gray-100 text-gray-800",
};

export function UserAssignmentsTab() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Use React Query hooks
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: territories = [] } = useAllTerritories();
  const { data: professions = [] } = useAllProfessions();
  const { data: userAssignments } = useUserAssignments(selectedUserId || '');
  const setUserAssignmentsMutation = useSetUserAssignments();

  useEffect(() => {
    if (userAssignments) {
      setSelectedTerritories(userAssignments.territories || []);
      setSelectedProfessions(userAssignments.professions || []);
      setHasChanges(false);
    }
  }, [userAssignments]);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const toggleTerritory = (territory: string) => {
    setSelectedTerritories((prev) => {
      const newTerritories = prev.includes(territory)
        ? prev.filter((t) => t !== territory)
        : [...prev, territory];
      setHasChanges(true);
      return newTerritories;
    });
  };

  const toggleProfession = (profession: string) => {
    setSelectedProfessions((prev) => {
      const newProfessions = prev.includes(profession)
        ? prev.filter((p) => p !== profession)
        : [...prev, profession];
      setHasChanges(true);
      return newProfessions;
    });
  };

  const saveAssignments = async () => {
    if (!selectedUserId) return;
    
    try {
      await setUserAssignmentsMutation.mutateAsync({
        userId: selectedUserId,
        assignments: {
          territories: selectedTerritories,
          professions: selectedProfessions,
        },
      });
      
      toast({
        title: "Assignments saved",
        description: "User territories and professions have been updated.",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save assignments. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">User Territory & Profession Assignments</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Assign users to multiple territories and professions. Only admins and sales managers can modify assignments.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 min-h-[500px]">
            <div className="col-span-4 border-r">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Select User</h3>
                </div>
              </div>
              <ScrollArea className="h-[450px]">
                <div className="p-2 space-y-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      data-testid={`user-item-${user.id}`}
                      onClick={() => {
                        if (hasChanges) {
                          if (!confirm("You have unsaved changes. Discard?")) return;
                        }
                        setSelectedUserId(user.id);
                        setHasChanges(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                        selectedUserId === user.id
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "hover:bg-muted border-transparent"
                      )}
                    >
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="text-xs font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                          <Link href={`/users/${user.id}`}>
                            <ExternalLink 
                              className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" 
                              data-testid={`link-user-profile-${user.id}`}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Link>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px] mt-1", roleColors[user.role])}
                        >
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </div>
                      {selectedUserId === user.id && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="col-span-4 border-r">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Territories</h3>
                </div>
              </div>
              <div className="p-4">
                {selectedUser && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Assign territories for{" "}
                    <span className="font-medium text-foreground">{selectedUser.name}</span>
                  </p>
                )}
                <div className="space-y-2">
                  {territories.map((territory) => {
                    const isChecked = selectedTerritories.includes(territory);
                    return (
                      <div
                        key={territory}
                        data-testid={`territory-${territory.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => toggleTerritory(territory)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                          isChecked
                            ? "bg-blue-500/10 border-blue-200"
                            : "bg-card border-border hover:border-primary/30"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleTerritory(territory)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{territory}</p>
                        </div>
                        {isChecked && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-span-4">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                  <h3 className="font-semibold text-sm">Professions</h3>
                </div>
              </div>
              <div className="p-4">
                {selectedUser && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Assign professions for{" "}
                    <span className="font-medium text-foreground">{selectedUser.name}</span>
                  </p>
                )}
                <ScrollArea className="h-[380px]">
                  <div className="space-y-2">
                    {professions.map((profession) => {
                      const isChecked = selectedProfessions.includes(profession);
                      return (
                        <div
                          key={profession}
                          data-testid={`profession-${profession.toLowerCase().replace(/\s+/g, "-")}`}
                          onClick={() => toggleProfession(profession)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                            isChecked
                              ? "bg-purple-500/10 border-purple-200"
                              : "bg-card border-border hover:border-primary/30"
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleProfession(profession)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{profession}</p>
                          </div>
                          {isChecked && <Check className="h-4 w-4 text-purple-600" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-1 max-w-md">
              {selectedTerritories.length > 0 ? (
                selectedTerritories.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-blue-100 text-blue-800">
                    {t}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No territories assigned</span>
              )}
            </div>
            <span className="text-muted-foreground">|</span>
            <div className="flex flex-wrap gap-1 max-w-md">
              {selectedProfessions.length > 0 ? (
                selectedProfessions.map((p) => (
                  <Badge key={p} variant="secondary" className="bg-purple-100 text-purple-800">
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No professions assigned</span>
              )}
            </div>
          </div>
          <Button
            data-testid="button-save-assignments"
            onClick={saveAssignments}
            disabled={!hasChanges || setUserAssignmentsMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {setUserAssignmentsMutation.isPending ? "Saving..." : "Save Assignments"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

