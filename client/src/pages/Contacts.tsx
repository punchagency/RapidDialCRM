import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Prospect } from "@shared/schema";
import { getStatuses } from "@/lib/statusUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Phone, Mail, MapPin, X, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useUserRole } from "@/lib/UserRoleContext";
import { EditContactModal } from "@/components/crm/EditContactModal";
import { fetchProspects, updateProspect } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { getSpecialtyColors } from "@/lib/specialtyColors";

export default function Contacts() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole, canAccess } = useUserRole();
  const { toast } = useToast();
  const statuses = getStatuses();

  const canEdit = canAccess("contacts_edit");

  useEffect(() => {
    async function loadProspects() {
      try {
        const data = await fetchProspects();
        setProspects(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProspects();
  }, [toast]);

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.color : "bg-secondary text-secondary-foreground";
  };

  const filteredProspects = useMemo(() => {
    if (!searchQuery.trim()) return prospects;
    
    const query = searchQuery.toLowerCase();
    return prospects.filter(prospect => 
      prospect.businessName.toLowerCase().includes(query) ||
      prospect.phoneNumber.toLowerCase().includes(query) ||
      prospect.addressCity?.toLowerCase().includes(query) ||
      prospect.specialty.toLowerCase().includes(query)
    );
  }, [searchQuery, prospects]);

  const handleSaveContact = async (updatedProspect: Prospect) => {
    try {
      await updateProspect(updatedProspect.id, updatedProspect);
      const index = prospects.findIndex(c => c.id === updatedProspect.id);
      if (index >= 0) {
        const updated = [...prospects];
        updated[index] = updatedProspect;
        setProspects(updated);
      }
      setSelectedProspect(null);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading contacts...</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Contacts ({prospects.length})</h1>
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
                <p className="text-muted-foreground">No contacts found matching "{searchQuery}"</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {filteredProspects.length} contact{filteredProspects.length !== 1 ? 's' : ''} found
                </p>
                {filteredProspects.map((prospect) => {
                  const colors = getSpecialtyColors(prospect.specialty);
                  const fullAddress = [prospect.addressStreet, prospect.addressCity, prospect.addressState, prospect.addressZip].filter(Boolean).join(", ") || "N/A";
                  return (
                    <Link key={prospect.id} href={`/dialer?prospectId=${prospect.id}`}>
                      <Card className="group hover:shadow-md transition-all border-border/60 cursor-pointer mb-4">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {prospect.businessName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold truncate">{prospect.businessName}</p>
                                <Badge 
                                  variant="secondary" 
                                  className={cn("text-[10px] h-5 px-2 rounded-full font-semibold border-none", colors.bgColor, colors.textColor)}
                                  data-testid={`specialty-badge-${prospect.id}`}
                                >
                                  {prospect.specialty}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{fullAddress}</p>
                            </div>
                            
                            <div className="hidden md:block text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" /> {prospect.phoneNumber}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3" /> {prospect.territory}
                              </div>
                            </div>
                            
                            <div className="hidden md:flex items-center justify-end gap-2">
                              {canEdit && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedProspect(prospect);
                                  }}
                                  data-testid={`edit-button-${prospect.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
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
      </main>
    </div>
  );
}
