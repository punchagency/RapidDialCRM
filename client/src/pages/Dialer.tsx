import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DialerCard } from "@/components/crm/DialerCard";
import { MOCK_CONTACTS, CallStatus, Contact } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Edit } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useUserRole } from "@/lib/UserRoleContext";
import { EditContactModal } from "@/components/crm/EditContactModal";

export default function Dialer() {
  const [location] = useLocation();
  
  // Initialize index based on URL param if present
  const [currentIndex, setCurrentIndex] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const contactId = params.get("contactId");
    if (contactId) {
      const idx = MOCK_CONTACTS.findIndex(c => c.id === contactId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  // Sync with URL params whenever location changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactId = params.get("contactId");
    if (contactId) {
      const idx = MOCK_CONTACTS.findIndex(c => c.id === contactId);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    }
  }, [location]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] = useState<Contact | null>(null);
  const { toast } = useToast();
  const { userRole, canAccess } = useUserRole();

  const currentContact = MOCK_CONTACTS[currentIndex];
  const canEdit = canAccess("contacts_edit");

  const handleSaveContact = (updatedContact: Contact) => {
    const index = MOCK_CONTACTS.findIndex(c => c.id === updatedContact.id);
    if (index >= 0) {
      Object.assign(MOCK_CONTACTS[index], updatedContact);
    }
    setSelectedContactForEdit(null);
  };

  const handleComplete = (status: CallStatus, notes: string) => {
    setIsTransitioning(true);
    
    toast({
      title: "Call Logged",
      description: `Marked as ${status}. Moving to next lead...`,
      duration: 2000,
    });

    setTimeout(() => {
      if (currentIndex < MOCK_CONTACTS.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // End of list
        toast({
          title: "All Caught Up!",
          description: "You've completed your list for today.",
        });
      }
      setIsTransitioning(false);
    }, 800); // Animation delay
  };

  if (!currentContact) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        {/* Minimal Header for Focus Mode */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Exit Focus Mode
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">
              Call {currentIndex + 1} of {MOCK_CONTACTS.length}
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
                style={{ width: `${((currentIndex) / MOCK_CONTACTS.length) * 100}%` }} 
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {isTransitioning ? (
              <motion.div 
                key="transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold">Call Logged</h2>
                  <p className="text-muted-foreground">Loading next lead...</p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key={currentContact.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <DialerCard 
                  contact={currentContact} 
                  onComplete={handleComplete} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedContactForEdit && (
          <EditContactModal 
            contact={selectedContactForEdit}
            isOpen={!!selectedContactForEdit}
            onClose={() => setSelectedContactForEdit(null)}
            onSave={handleSaveContact}
          />
        )}
      </main>
    </div>
  );
}
