import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Settings, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUsers, useAllTerritories, useAllProfessions, useUserAssignments, useSetUserAssignments } from "@/hooks/useUsers";
import { UserAssignmentsView } from "./UserAssignmentsView";
import { TerritoriesProfessionsManager } from "./TerritoriesProfessionsManager";

export function UserAssignmentsTab() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Use React Query hooks
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError
  } = useUsers();
  const {
    data: territories = [],
    isLoading: territoriesLoading,
    error: territoriesError
  } = useAllTerritories();
  const {
    data: professions = [],
    isLoading: professionsLoading,
    error: professionsError
  } = useAllProfessions();
  const {
    data: userAssignments,
    isLoading: assignmentsLoading,
    error: assignmentsError
  } = useUserAssignments(selectedUserId || '');
  const setUserAssignmentsMutation = useSetUserAssignments();

  useEffect(() => {
    if (userAssignments) {
      setSelectedTerritories(userAssignments.territories || []);
      setSelectedProfessions(userAssignments.professions || []);
      setHasChanges(false);
    } else if (selectedUserId && !assignmentsLoading) {
      // Reset when switching users or if no assignments found
      setSelectedTerritories([]);
      setSelectedProfessions([]);
      setHasChanges(false);
    }
  }, [userAssignments, selectedUserId, assignmentsLoading]);

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

  // Show error states
  if (usersError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">User Territory & Profession Assignments</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Assign users to multiple territories and professions. Only admins and sales managers can modify assignments.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load users. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">User Territory & Profession Assignments</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Assign users to multiple territories and professions. Only admins and sales managers can modify assignments.
        </p>
      </div>

      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="bg-card border border-border p-1">
          <TabsTrigger value="assignments" className="gap-2">
            <Users className="h-4 w-4" />
            User Assignments
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage Territories & Professions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="m-0">
          <UserAssignmentsView
            users={users}
            usersLoading={usersLoading}
            territories={territories}
            territoriesLoading={territoriesLoading}
            territoriesError={territoriesError}
            professions={professions}
            professionsLoading={professionsLoading}
            professionsError={professionsError}
            selectedUserId={selectedUserId}
            selectedTerritories={selectedTerritories}
            selectedProfessions={selectedProfessions}
            hasChanges={hasChanges}
            assignmentsLoading={assignmentsLoading}
            assignmentsError={assignmentsError}
            setUserAssignmentsMutation={setUserAssignmentsMutation}
            onUserSelect={(userId) => {
              if (hasChanges) {
                if (!confirm("You have unsaved changes. Discard?")) return;
              }
              setSelectedUserId(userId);
              setHasChanges(false);
            }}
            onTerritoryToggle={toggleTerritory}
            onProfessionToggle={toggleProfession}
            onSave={saveAssignments}
          />
        </TabsContent>

        <TabsContent value="manage" className="m-0">
          <TerritoriesProfessionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

