import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Phone, Mail, MapPin, Briefcase, Calendar, ArrowLeft, Eye, Edit2, Save, X, Shield, ChevronRight } from "lucide-react";
import { User as UserType } from "@/lib/types";
import { useUserRole } from "@/lib/UserRoleContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TERRITORIES = ["Miami", "Washington DC", "Los Angeles", "New York", "Chicago", "Dallas"];
const PROFESSIONS = ["Dental", "Chiropractor", "Optometry", "Physical Therapy", "Orthodontics", "Legal", "Financial", "Real Estate"];

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Sales Manager",
  inside_sales_rep: "Inside Sales Rep",
  field_sales_rep: "Field Sales Rep",
  data_loader: "Data Loader",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  inside_sales_rep: "bg-green-100 text-green-800",
  field_sales_rep: "bg-emerald-100 text-emerald-800",
  data_loader: "bg-purple-100 text-purple-800",
};

export default function UserProfile() {
  const [, params] = useRoute("/users/:id");
  const userId = params?.id;
  const { actualRole, startImpersonation } = useUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTerritories, setEditedTerritories] = useState<string[]>([]);
  const [editedProfessions, setEditedProfessions] = useState<string[]>([]);

  const canEdit = actualRole === "admin" || actualRole === "manager";

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<{ territories: string[], professions: string[] }>({
    queryKey: [`/api/users/${userId}/assignments`],
    enabled: !!userId,
  });

  const updateAssignmentsMutation = useMutation({
    mutationFn: async (data: { territories: string[], professions: string[] }) => {
      return apiRequest("PUT", `/api/users/${userId}/assignments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/assignments`] });
      toast({ title: "Assignments updated", description: "User assignments have been saved." });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update assignments", variant: "destructive" });
    },
  });

  const startEditing = () => {
    setEditedTerritories(assignments?.territories || []);
    setEditedProfessions(assignments?.professions || []);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveAssignments = () => {
    updateAssignmentsMutation.mutate({
      territories: editedTerritories,
      professions: editedProfessions,
    });
  };

  const toggleTerritory = (territory: string) => {
    setEditedTerritories(prev => 
      prev.includes(territory) 
        ? prev.filter(t => t !== territory) 
        : [...prev, territory]
    );
  };

  const toggleProfession = (profession: string) => {
    setEditedProfessions(prev => 
      prev.includes(profession) 
        ? prev.filter(p => p !== profession) 
        : [...prev, profession]
    );
  };

  const getUserInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (userLoading || assignmentsLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-48 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">User not found</p>
                <div className="flex justify-center mt-4">
                  <Link href="/settings">
                    <Button variant="outline" data-testid="button-back-settings">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/settings">
              <span className="hover:text-foreground cursor-pointer">Settings</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">User Profile</span>
          </div>

          <Card className="mb-6" data-testid={`card-user-${userId}`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {getUserInitials(user.name)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl" data-testid="text-user-name">{user.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={roleColors[user.role] || "bg-gray-100 text-gray-800"} data-testid="badge-user-role">
                        {roleLabels[user.role] || user.role}
                      </Badge>
                      {user.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {actualRole === "admin" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startImpersonation(user)}
                      data-testid="button-impersonate-user"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View As
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span data-testid="text-user-email">{user.email}</span>
                </div>
                {user.territory && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span data-testid="text-user-territory">{user.territory}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6" data-testid="card-user-assignments">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Assignments
                  </CardTitle>
                  <CardDescription>Territories and professions assigned to this user</CardDescription>
                </div>
                {canEdit && !isEditing && (
                  <Button variant="outline" size="sm" onClick={startEditing} data-testid="button-edit-assignments">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={cancelEditing} data-testid="button-cancel-edit">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={saveAssignments}
                      disabled={updateAssignmentsMutation.isPending}
                      data-testid="button-save-assignments"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Territories
                  </Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {TERRITORIES.map((territory) => (
                        <div key={territory} className="flex items-center space-x-2">
                          <Checkbox
                            id={`territory-${territory}`}
                            checked={editedTerritories.includes(territory)}
                            onCheckedChange={() => toggleTerritory(territory)}
                          />
                          <label htmlFor={`territory-${territory}`} className="text-sm cursor-pointer">
                            {territory}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2" data-testid="list-user-territories">
                      {assignments?.territories && assignments.territories.length > 0 ? (
                        assignments.territories.map((territory) => (
                          <Badge key={territory} variant="secondary">{territory}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No territories assigned</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Professions
                  </Label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {PROFESSIONS.map((profession) => (
                        <div key={profession} className="flex items-center space-x-2">
                          <Checkbox
                            id={`profession-${profession}`}
                            checked={editedProfessions.includes(profession)}
                            onCheckedChange={() => toggleProfession(profession)}
                          />
                          <label htmlFor={`profession-${profession}`} className="text-sm cursor-pointer">
                            {profession}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2" data-testid="list-user-professions">
                      {assignments?.professions && assignments.professions.length > 0 ? (
                        assignments.professions.map((profession) => (
                          <Badge key={profession} variant="outline">{profession}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No professions assigned</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-user-activity">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Activity Summary
              </CardTitle>
              <CardDescription>Recent activity and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Calls Today</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Contacts Added</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Appointments Set</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">--</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Activity tracking will be available in a future update
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

