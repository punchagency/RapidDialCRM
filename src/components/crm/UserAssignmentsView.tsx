import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Map, Briefcase, Save, Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { User } from "@/lib/types";

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

interface UserAssignmentsViewProps {
  users: User[];
  usersLoading: boolean;
  territories: string[];
  territoriesLoading: boolean;
  territoriesError: Error | null;
  professions: string[];
  professionsLoading: boolean;
  professionsError: Error | null;
  selectedUserId: string | null;
  selectedTerritories: string[];
  selectedProfessions: string[];
  hasChanges: boolean;
  assignmentsLoading: boolean;
  assignmentsError: Error | null;
  setUserAssignmentsMutation: {
    isPending: boolean;
    mutateAsync: (data: { userId: string; assignments: { territories: string[]; professions: string[] } }) => Promise<any>;
  };
  onUserSelect: (userId: string) => void;
  onTerritoryToggle: (territory: string) => void;
  onProfessionToggle: (profession: string) => void;
  onSave: () => void;
}

export function UserAssignmentsView({
  users,
  usersLoading,
  territories,
  territoriesLoading,
  territoriesError,
  professions,
  professionsLoading,
  professionsError,
  selectedUserId,
  selectedTerritories,
  selectedProfessions,
  hasChanges,
  assignmentsLoading,
  assignmentsError,
  setUserAssignmentsMutation,
  onUserSelect,
  onTerritoryToggle,
  onProfessionToggle,
  onSave,
}: UserAssignmentsViewProps) {
  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
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
                {usersLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Users className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        data-testid={`user-item-${user.id}`}
                        onClick={() => {
                          if (hasChanges) {
                            if (!confirm("You have unsaved changes. Discard?")) return;
                          }
                          onUserSelect(user.id);
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
                )}
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
                {!selectedUserId ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Map className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Select a user to assign territories</p>
                  </div>
                ) : territoriesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : territoriesError ? (
                  <div className="flex items-center gap-2 p-4 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>Failed to load territories</p>
                  </div>
                ) : selectedUser ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">
                      Assign territories for{" "}
                      <span className="font-medium text-foreground">{selectedUser.name}</span>
                    </p>
                    {territories.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <Map className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No territories available</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {territories.map((territory) => {
                          const isChecked = selectedTerritories.includes(territory);
                          return (
                            <div
                              key={territory}
                              data-testid={`territory-${territory.toLowerCase().replace(/\s+/g, "-")}`}
                              onClick={() => onTerritoryToggle(territory)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                                isChecked
                                  ? "bg-blue-500/10 border-blue-200"
                                  : "bg-card border-border hover:border-primary/30"
                              )}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => onTerritoryToggle(territory)}
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{territory}</p>
                              </div>
                              {isChecked && <Check className="h-4 w-4 text-blue-600" />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : null}
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
                {!selectedUserId ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Select a user to assign professions</p>
                  </div>
                ) : professionsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : professionsError ? (
                  <div className="flex items-center gap-2 p-4 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>Failed to load professions</p>
                  </div>
                ) : selectedUser ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">
                      Assign professions for{" "}
                      <span className="font-medium text-foreground">{selectedUser.name}</span>
                    </p>
                    <ScrollArea className="h-[380px]">
                      {professions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No professions available</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {professions.map((profession) => {
                            const isChecked = selectedProfessions.includes(profession);
                            return (
                              <div
                                key={profession}
                                data-testid={`profession-${profession.toLowerCase().replace(/\s+/g, "-")}`}
                                onClick={() => onProfessionToggle(profession)}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                                  isChecked
                                    ? "bg-purple-500/10 border-purple-200"
                                    : "bg-card border-border hover:border-primary/30"
                                )}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => onProfessionToggle(profession)}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{profession}</p>
                                </div>
                                {isChecked && <Check className="h-4 w-4 text-purple-600" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedUserId && (
        <Card className="bg-muted/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex flex-wrap gap-1 max-w-md">
                {assignmentsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading assignments...</span>
                  </div>
                ) : assignmentsError ? (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed to load assignments</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
            <Button
              data-testid="button-save-assignments"
              onClick={onSave}
              disabled={!hasChanges || setUserAssignmentsMutation.isPending || !selectedUserId || assignmentsLoading}
              className="gap-2 shrink-0"
            >
              {setUserAssignmentsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Assignments
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

