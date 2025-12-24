import React, { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Prospect } from "@/lib/types";
import { getStatuses } from "@/lib/statusUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Phone, Mail, MapPin, X, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/UserRoleContext";
import { EditContactModal } from "@/components/crm/EditContactModal";
import { QuickDialerSidebar } from "@/components/dialer/QuickDialerSidebar";
import { useToast } from "@/hooks/use-toast";
import { ProspectCard } from "@/components/crm/ProspectCard";
import { useProspects, useUpdateProspect } from "@/hooks/useProspects";
import { useAuth } from "@/lib/AuthContext";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(
    null
  );
  const [showDialer, setShowDialer] = useState(false);
  const [dialerProspect, setDialerProspect] = useState<Prospect | null>(null);
  const { canAccess } = useUserRole();
  const { toast } = useToast();
  const statuses = getStatuses();
  const canEdit = canAccess("contacts_edit");
  const { user } = useAuth();

  // Use React Query hook for data fetching
  const {
    data: prospects = [],
    isLoading,
    error,
  } = useProspects({ userId: user?.id, role: user?.role });
  const updateProspectMutation = useUpdateProspect();

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find((s) => s.value === statusValue);
    return status ? status.color : "bg-secondary text-secondary-foreground";
  };

  const filteredProspects = useMemo(() => {
    if (!searchQuery.trim()) return prospects;

    const query = searchQuery.toLowerCase();
    return prospects.filter(
      (prospect) =>
        prospect.businessName.toLowerCase().includes(query) ||
        prospect.phoneNumber.toLowerCase().includes(query) ||
        prospect.addressCity?.toLowerCase().includes(query) ||
        prospect.specialty.toLowerCase().includes(query)
    );
  }, [searchQuery, prospects]);

  const handleSaveContact = async (updatedProspect: Prospect) => {
    try {
      await updateProspectMutation.mutateAsync({
        id: updatedProspect.id,
        data: updatedProspect,
      });
      setSelectedProspect(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading contacts...
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center">
        Error loading contacts:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">
            Contacts ({prospects.length})
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-transparent focus:bg-card transition-all"
                data-testid="contact-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="clear-search-button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button>Add Contact</Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {filteredProspects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No contacts found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {filteredProspects.length} contact
                  {filteredProspects.length !== 1 ? "s" : ""} found
                </p>
                {filteredProspects.map((prospect) => (
                  <div key={prospect.id} className="mb-4">
                    <ProspectCard
                      prospect={prospect}
                      showEditButton={canEdit}
                      onEdit={(e) => {
                        e.preventDefault();
                        setSelectedProspect(prospect);
                      }}
                      onQuickDial={(prospect) => {
                        setDialerProspect(prospect);
                        setShowDialer(true);
                      }}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {selectedProspect && (
          <EditContactModal
            prospect={selectedProspect}
            isOpen={!!selectedProspect}
            onClose={() => setSelectedProspect(null)}
            onSave={handleSaveContact}
            canEdit={canEdit}
          />
        )}

        {/* Quick Dialer Sidebar */}
        <QuickDialerSidebar
          isOpen={showDialer}
          onClose={() => {
            setShowDialer(false);
            setDialerProspect(null);
          }}
          prospect={dialerProspect}
        />

        {/* Floating Action Button for Manual Dialing */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => {
            setDialerProspect(null);
            setShowDialer(true);
          }}
          data-testid="manual-dial-fab"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </main>
    </div>
  );
}
