import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/lib/UserRoleContext";
import { EditContactModal } from "@/components/crm/EditContactModal";
import { useUpdateProspect } from "@/hooks/useProspects";
import { useRecordCallOutcome } from "@/hooks/useCallOutcomes";
import { useAuth } from "@/lib/AuthContext";
import { useDialerState } from "@/hooks/useDialerState";
import { DialerHeader } from "@/components/dialer/DialerHeader";
import { ProspectNavigation } from "@/components/dialer/ProspectNavigation";
import type { Prospect } from "@/lib/types";
import { useProspects, useProspect } from "@/hooks/useProspects";

export default function Dialer() {
  const [selectedContactForEdit, setSelectedContactForEdit] =
    useState<Prospect | null>(null);
  const { toast } = useToast();
  const { canAccess } = useUserRole();
  const { user } = useAuth();

  const canEdit = canAccess("contacts_edit");

  // Get prospectId from URL
  const params = new URLSearchParams(window.location.search);
  const prospectId = params.get("prospectId");

  const { data: initialProspect } = useProspect(prospectId || "");
  // Use custom dialer state hook
  const {
    currentIndex,
    isTransitioning,
    prospects,
    loading,
    currentProspect,
    goToNext,
    setIsTransitioning,
  } = useDialerState({ prospectId });

  const updateProspectMutation = useUpdateProspect();
  const recordCallOutcomeMutation = useRecordCallOutcome();
  const handleSaveContact = async (updatedProspect: Prospect) => {
    try {
      await updateProspectMutation.mutateAsync({
        id: updatedProspect.id,
        data: updatedProspect,
      });
      setSelectedContactForEdit(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save contact",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (
    status: string,
    notes: string
  ): Promise<boolean> => {
    try {
      if (!currentProspect) return false;

      await recordCallOutcomeMutation.mutateAsync({
        prospectId: currentProspect.id,
        callerId: user?.id!,
        outcome: status,
        notes,
      });

      setIsTransitioning(true);

      toast({
        title: "Call Logged",
        description: `Marked as ${status}. Moving to next lead...`,
        duration: 2000,
      });

      if (currentIndex < prospects.length - 1) {
        goToNext();
      } else {
        toast({
          title: "All Caught Up!",
          description: "You've completed your list for today.",
        });
        setIsTransitioning(false);
      }

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to log call",
        variant: "destructive",
      });
      setIsTransitioning(false);
      return false;
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  if (prospects.length === 0)
    return (
      <div className="flex h-screen items-center justify-center">
        No prospects found
      </div>
    );

  if (!currentProspect) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <DialerHeader
          currentIndex={currentIndex}
          totalProspects={prospects.length}
          canEdit={canEdit}
          onEditClick={() => setSelectedContactForEdit(currentProspect)}
        />

        <div className="flex-1 overflow-hidden relative p-6">
          <ProspectNavigation
            prospect={currentProspect}
            isTransitioning={isTransitioning}
            onComplete={handleComplete}
            canEdit={canEdit}
            onEditClick={() => setSelectedContactForEdit(currentProspect)}
          />
        </div>

        {selectedContactForEdit && (
          <EditContactModal
            contact={selectedContactForEdit}
            isOpen={!!selectedContactForEdit}
            onClose={() => setSelectedContactForEdit(null)}
            onSave={handleSaveContact}
            canEdit={canEdit}
          />
        )}
      </main>
    </div>
  );
}
