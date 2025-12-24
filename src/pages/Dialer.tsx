import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DialerCard } from "@/components/crm/DialerCard";
import { Prospect } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useUserRole } from "@/lib/UserRoleContext";
import { EditContactModal } from "@/components/crm/EditContactModal";
import {
  useProspects,
  useProspect,
  useUpdateProspect,
} from "@/hooks/useProspects";
import { useRecordCallOutcome } from "@/hooks/useCallOutcomes";
import { useAuth } from '@/lib/AuthContext';

export default function Dialer() {
  const [location] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] =
    useState<Prospect | null>(null);
  const { toast } = useToast();
  const { canAccess } = useUserRole();
  const { user } = useAuth();

  const canEdit = canAccess("contacts_edit");

  // Get prospectId from URL
  const params = new URLSearchParams(window.location.search);
  const prospectId = params.get("prospectId");

  // Use React Query hooks
  const { data: prospects = [], isLoading } = useProspects({
    limit: 100,
    offset: 0,
    userId: user?.id,
    role: user?.role,
  });
  const { data: initialProspect } = useProspect(prospectId || "");
  const updateProspectMutation = useUpdateProspect();
  const recordCallOutcomeMutation = useRecordCallOutcome();

  // Set initial index when prospectId is provided
  useEffect(() => {
    if (prospectId && prospects.length > 0) {
      const idx = prospects.findIndex((c) => c.id === prospectId);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [prospectId, prospects]);

  const handleSaveContact = async (updatedProspect: Prospect) => {
    try {
      await updateProspectMutation.mutateAsync({
        id: updatedProspect.id,
        data: updatedProspect,
      });
      await recordCallOutcomeMutation.mutateAsync({
        prospectId: updatedProspect.id,
        callerId: "current-user",
        outcome: "contacted",
        notes: "Contact updated",
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

  const handleComplete = async (status: string, notes: string) => {
    try {
      await recordCallOutcomeMutation.mutateAsync({
        prospectId: prospects[currentIndex].id,
        callerId: "current-user",
        outcome: status,
        notes,
      });
      setIsTransitioning(true);

      toast({
        title: "Call Logged",
        description: `Marked as ${status}. Moving to next lead...`,
        duration: 2000,
      });

      setTimeout(() => {
        if (currentIndex < prospects.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          toast({
            title: "All Caught Up!",
            description: "You've completed your list for today.",
          });
        }
        setIsTransitioning(false);
      }, 800);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to log call",
        variant: "destructive",
      });
      setIsTransitioning(false);
    }
  };

  if (isLoading)
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

  if (currentIndex >= prospects.length) {
    setCurrentIndex(0);
    return null;
  }

  const currentContact = prospects[currentIndex];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Exit Focus Mode
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">
              Call {currentIndex + 1} of {prospects.length}
            </span>
            {canEdit && (
              <>
                <div className="h-4 w-px bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedContactForEdit(currentContact)}
                  data-testid="dialer-edit-button"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentIndex / prospects.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentContact.id}
              initial={{ opacity: 0, x: isTransitioning ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isTransitioning ? -100 : 100 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-stretch p-6"
            >
              <div className="w-full h-full">
                <DialerCard
                  prospect={currentContact}
                  onComplete={handleComplete}
                  canEdit={canEdit}
                  onEditClick={() => setSelectedContactForEdit(currentContact)}
                />
              </div>
            </motion.div>
          </AnimatePresence>
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
