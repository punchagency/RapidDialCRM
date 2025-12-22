import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Map, Briefcase, Plus, Trash2, Edit2, Loader2, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Territory = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Profession = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function TerritoriesProfessionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"territories" | "professions">("territories");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Fetch territories
  const {
    data: territories = [],
    isLoading: territoriesLoading,
    error: territoriesError,
  } = useQuery<Territory[]>({
    queryKey: ["territories", 'all'],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getTerritories();
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch professions
  const {
    data: professions = [],
    isLoading: professionsLoading,
    error: professionsError,
  } = useQuery<Profession[]>({
    queryKey: ["professions", 'all'],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getProfessions();
      if (error) throw error;
      return data || [];
    },
  });

  // Create territory mutation
  const createTerritoryMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; isActive?: boolean }) =>
      CustomServerApi.createTerritory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast({
        title: "Success",
        description: "Territory created successfully",
      });
      setIsCreating(false);
      setFormData({ name: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create territory",
        variant: "destructive",
      });
    },
  });

  // Update territory mutation
  const updateTerritoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Territory> }) =>
      CustomServerApi.updateTerritory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast({
        title: "Success",
        description: "Territory updated successfully",
      });
      setIsEditing(null);
      setFormData({ name: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update territory",
        variant: "destructive",
      });
    },
  });

  // Delete territory mutation
  const deleteTerritoryMutation = useMutation({
    mutationFn: (id: string) => CustomServerApi.deleteTerritory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast({
        title: "Success",
        description: "Territory deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete territory",
        variant: "destructive",
      });
    },
  });

  // Create profession mutation
  const createProfessionMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; isActive?: boolean }) =>
      CustomServerApi.createProfession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
      toast({
        title: "Success",
        description: "Profession created successfully",
      });
      setIsCreating(false);
      setFormData({ name: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create profession",
        variant: "destructive",
      });
    },
  });

  // Update profession mutation
  const updateProfessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Profession> }) =>
      CustomServerApi.updateProfession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
      toast({
        title: "Success",
        description: "Profession updated successfully",
      });
      setIsEditing(null);
      setFormData({ name: "", description: "", isActive: true });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profession",
        variant: "destructive",
      });
    },
  });

  // Delete profession mutation
  const deleteProfessionMutation = useMutation({
    mutationFn: (id: string) => CustomServerApi.deleteProfession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
      toast({
        title: "Success",
        description: "Profession deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete profession",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: Territory | Profession) => {
    setIsEditing(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      isActive: item.isActive,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsCreating(false);
    setFormData({ name: "", description: "", isActive: true });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      if (activeTab === "territories") {
        updateTerritoryMutation.mutate({
          id: isEditing,
          data: formData,
        });
      } else {
        updateProfessionMutation.mutate({
          id: isEditing,
          data: formData,
        });
      }
    } else {
      if (activeTab === "territories") {
        createTerritoryMutation.mutate(formData);
      } else {
        createProfessionMutation.mutate(formData);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    if (activeTab === "territories") {
      deleteTerritoryMutation.mutate(id);
    } else {
      deleteProfessionMutation.mutate(id);
    }
  };

  const currentItems = activeTab === "territories" ? territories : professions;
  const isLoading = activeTab === "territories" ? territoriesLoading : professionsLoading;
  const error = activeTab === "territories" ? territoriesError : professionsError;
  const isPending =
    activeTab === "territories"
      ? createTerritoryMutation.isPending ||
      updateTerritoryMutation.isPending ||
      deleteTerritoryMutation.isPending
      : createProfessionMutation.isPending ||
      updateProfessionMutation.isPending ||
      deleteProfessionMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Territories Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Territories</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveTab("territories");
                  setIsCreating(true);
                  setIsEditing(null);
                  setFormData({ name: "", description: "", isActive: true });
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Territory
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {territoriesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : territoriesError ? (
              <div className="flex items-center gap-2 p-4 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>Failed to load territories</p>
              </div>
            ) : territories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Map className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No territories found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {territories.map((territory, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md border",
                        territory.isActive ? "bg-card" : "bg-muted/50 opacity-60"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{territory.name}</p>
                          {!territory.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {territory.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate w-[10rem]">
                            {territory.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(territory)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(territory.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Professions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Professions</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveTab("professions");
                  setIsCreating(true);
                  setIsEditing(null);
                  setFormData({ name: "", description: "", isActive: true });
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Profession
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {professionsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : professionsError ? (
              <div className="flex items-center gap-2 p-4 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>Failed to load professions</p>
              </div>
            ) : professions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No professions found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {professions.map((profession, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md border",
                        profession.isActive ? "bg-card" : "bg-muted/50 opacity-60"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{profession.name}</p>
                          {!profession.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {profession.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate w-[10rem]">
                            {profession.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(profession)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(profession.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <Dialog open={isCreating || isEditing !== null} onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? `Edit ${activeTab === "territories" ? "Territory" : "Profession"}`
                : `Create New ${activeTab === "territories" ? "Territory" : "Profession"}`}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Update the ${activeTab === "territories" ? "territory" : "profession"} details below.`
                : `Fill in the details to create a new ${activeTab === "territories" ? "territory" : "profession"}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${activeTab === "territories" ? "territory" : "profession"} name`}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  {activeTab === "territories" ? "Territory" : "Profession"} will be available for assignment
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !formData.name.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {isEditing ? "Update" : "Create"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

