import React, { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MOCK_CONTACTS, Contact } from "@/lib/mockData";
import { getStatuses } from "@/lib/statusUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Phone, MoreHorizontal, Mail, MapPin, X, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useUserRole } from "@/lib/UserRoleContext";
import { EditContactModal } from "@/components/crm/EditContactModal";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactForEdit, setSelectedContactForEdit] = useState<Contact | null>(null);
  const { userRole } = useUserRole();
  const statuses = getStatuses();

  const canEdit = ["admin", "manager", "sales_rep"].includes(userRole);

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find(s => s.value === statusValue);
    return status ? status.color : "bg-secondary text-secondary-foreground";
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CONTACTS;
    
    const query = searchQuery.toLowerCase();
    return MOCK_CONTACTS.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.company.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.address.toLowerCase().includes(query) ||
      contact.city?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSaveContact = (updatedContact: Contact) => {
    const index = MOCK_CONTACTS.findIndex(c => c.id === updatedContact.id);
    if (index >= 0) {
      Object.assign(MOCK_CONTACTS[index], updatedContact);
    }
    setSelectedContactForEdit(null);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Contacts ({MOCK_CONTACTS.length})</h1>
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
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No contacts found matching "{searchQuery}"</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
                </p>
                {filteredContacts.map((contact) => (
              <Link key={contact.id} href={`/dialer?contactId=${contact.id}`}>
                <Card className="group hover:shadow-md transition-all border-border/60 cursor-pointer mb-4">
                    <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {contact.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{contact.name}</p>
                            <Badge 
                            variant="secondary" 
                            className={cn(
                                "text-[10px] h-5 border", 
                                getStatusColor(contact.status)
                            )}
                            >
                            {contact.status}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.title} at {contact.company}</p>
                        </div>
                        
                        <div className="hidden md:block text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" /> {contact.email}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Phone className="h-3 w-3" /> {contact.phone}
                        </div>
                        </div>

                        <div className="hidden md:block text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> {contact.address}
                        </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Mail className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedContactForEdit(contact);
                            }}
                            data-testid={`edit-contact-${contact.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    </CardContent>
                </Card>
              </Link>
                ))}
              </>
            )}
          </div>
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
