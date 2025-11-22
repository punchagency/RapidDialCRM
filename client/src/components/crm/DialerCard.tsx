import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CallStatus, SubContact } from "@/lib/mockData";
import { Prospect } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Building2, Clock, DollarSign, Stethoscope, History, Check, ArrowRight, Loader2, Trophy, Mail, MessageSquare, Users, Briefcase, Shield, UserCog, Stethoscope as DoctorIcon, Plus, X, Trash2, ChevronDown, ChevronRight, Network, Headset, Map, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { EmailComposer } from "@/components/crm/EmailComposer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatar from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import managerAvatar from "@assets/generated_images/Professional_user_avatar_2_9f00e114.png";
import { getStatuses } from "@/lib/statusUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DialerCardProps {
  prospect: Prospect;
  onComplete: (status: string, notes: string) => void;
  canEdit?: boolean;
  onEditClick?: () => void;
}

// Mock Team Generator based on Contact ID to simulate Org Chart logic
const getAccountTeam = (contactId: string) => {
  const idNum = parseInt(contactId) || 0;
  
  // Field Rep
  const fieldRep = idNum % 2 === 0 
    ? { name: "Mike Field", role: "Field Sales", initial: "MF", color: "bg-green-100 text-green-700" }
    : { name: "Jessica Wong", role: "Field Sales", initial: "JW", color: "bg-green-100 text-green-700" };

  // Inside Rep
  const insideRep = { 
      name: "Alex Johnson", 
      role: "Inside Sales", 
      initial: "AJ", 
      color: "bg-purple-100 text-purple-700", 
      image: avatar
  };

  // Manager
  const manager = idNum % 3 === 0
    ? { 
        name: "Robert Stone", 
        role: "Territory Manager", 
        initial: "RS", 
        color: "bg-blue-100 text-blue-700", 
        image: null
      }
    : { 
        name: "Sarah Miller", 
        role: "Regional Manager", 
        initial: "SM", 
        color: "bg-blue-100 text-blue-700", 
        image: managerAvatar
      };

  return { manager, insideRep, fieldRep }; 
};

export function DialerCard({ prospect, onComplete, canEdit, onEditClick }: DialerCardProps) {
  if (!prospect) return null;
  
  const [notes, setNotes] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [activeTab, setActiveTab] = useState("notes");
  const { toast } = useToast();
  const statuses = getStatuses();
  
  const { manager, insideRep, fieldRep } = getAccountTeam(prospect.id || "1");

  // Local state for contacts to allow adding/removing
  const [clientAdmins, setClientAdmins] = useState<SubContact[]>([]);
  const [providerContacts, setProviderContacts] = useState<SubContact[]>([]);

  // New contact form state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactType, setNewContactType] = useState<"admin" | "provider">("admin");
  const [newContact, setNewContact] = useState({ name: "", role: "", email: "", phone: "" });

  // Collapsible states
  const [isStakeholdersOpen, setIsStakeholdersOpen] = useState(true);
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  const handleAddContact = () => {
    const newId = `new-${Date.now()}`;
    const contactToAdd: SubContact = {
        id: newId,
        ...newContact
    };

    if (newContactType === "admin") {
        setClientAdmins([...clientAdmins, contactToAdd]);
    } else {
        setProviderContacts([...providerContacts, contactToAdd]);
    }
    
    setIsAddContactOpen(false);
    setNewContact({ name: "", role: "", email: "", phone: "" });
    toast({ title: "Contact Added", description: `${newContact.name} added to stakeholders.` });
  };

  const handleRemoveContact = (id: string, type: "admin" | "provider") => {
      if (type === "admin") {
          setClientAdmins(clientAdmins.filter(c => c.id !== id));
      } else {
          setProviderContacts(providerContacts.filter(c => c.id !== id));
      }
      toast({ title: "Contact Removed", description: "Stakeholder removed from list." });
  };

  // Simple timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const isBonusUnlocked = timer > 180; // 3 minutes

  const handleCallClick = async () => {
    const apiKey = localStorage.getItem("quo_api_key");
    
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Please configure your QuantumPunch API key in Settings > Integrations first.",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate API Handshake
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      toast({
        title: "Call Initiated",
        description: `Calling ${contact.phone} via QuantumPunch Network...`,
      });
    }, 1500);
  };

  // Helper to get color for the current contact status
  const currentStatusColor = statuses.find(s => s.value === contact.status)?.color || "bg-primary/5 text-primary border-primary/20";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-140px)]">
      {/* Left Column: Contact Info */}
      <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-2">
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
           <div className="h-2 bg-pink-500 w-full rounded-t-lg" />
           <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-2xl font-heading font-bold text-foreground">{contact.name}</h2>
                 <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                   <Building2 className="h-4 w-4" />
                   {contact.company}
                 </p>
               </div>
               <Badge variant="secondary" className={cn("border", currentStatusColor)}>
                 {contact.status}
               </Badge>
             </div>

             <div className="flex items-center justify-between p-6 bg-muted/50 rounded-xl border border-border/50 mb-6 relative overflow-hidden">
               {isBonusUnlocked && (
                  <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center z-0 pointer-events-none animate-in fade-in duration-500" />
               )}
               
               <div className="z-10">
                 <div className={cn("text-3xl font-mono font-semibold tracking-tight transition-colors", isBonusUnlocked ? "text-purple-600" : "text-foreground")}>
                   {contact.phone}
                 </div>
                 {isBonusUnlocked && (
                    <div className="text-xs text-purple-600 font-bold flex items-center gap-1 animate-bounce mt-1">
                      <Trophy className="h-3 w-3" /> BONUS UNLOCKED
                    </div>
                 )}
               </div>
               
               {isCallActive ? (
                  <Button 
                    variant="destructive" 
                    size="lg"
                    className="rounded-full px-6 shadow-lg shadow-destructive/20 animate-pulse z-10"
                    onClick={() => setIsCallActive(false)}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    End Call ({formatTime(timer)})
                  </Button>
               ) : (
                 <Button 
                    size="lg" 
                    className="rounded-full px-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-105 z-10 h-12 text-base font-medium"
                    onClick={handleCallClick}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="h-5 w-5 mr-2" />
                        Call with QuantumPunch
                      </>
                    )}
                  </Button>
               )}
             </div>

             <div className="space-y-4">
               <InfoItem icon={MapPin} label="Location" value={`${contact.address}, ${contact.zip}`} />
               <InfoItem icon={Clock} label="Timezone" value={contact.timezone} />
               <InfoItem icon={DollarSign} label="Deal Size" value={contact.dealSize || "Unknown"} />
               {contact.drServed && <InfoItem icon={Stethoscope} label="Specialty" value={contact.drServed} />}
             </div>
           </CardContent>
        </Card>

        {/* KEY CONTACTS SECTION */}
        <Card className="border-none shadow-sm">
            <Collapsible open={isStakeholdersOpen} onOpenChange={setIsStakeholdersOpen}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent h-auto font-heading font-semibold flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider flex-1 justify-start">
                                <Users className="h-4 w-4" />
                                Key Stakeholders
                                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isStakeholdersOpen ? "" : "-rotate-90")} />
                            </Button>
                        </CollapsibleTrigger>
                        
                        <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Plus className="h-3 w-3" /> Add
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Stakeholder</DialogTitle>
                                </DialogHeader>
                                {/* ... Form ... */}
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Stakeholder Type</Label>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant={newContactType === "admin" ? "default" : "outline"} 
                                                onClick={() => setNewContactType("admin")}
                                                className="flex-1"
                                            >
                                                Client Admin
                                            </Button>
                                            <Button 
                                                variant={newContactType === "provider" ? "default" : "outline"} 
                                                onClick={() => setNewContactType("provider")}
                                                className="flex-1"
                                            >
                                                Provider
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="Full Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role / Title</Label>
                                        <Input value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} placeholder="e.g. Office Manager" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} placeholder="email@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="(555) 000-0000" />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddContact} disabled={!newContact.name}>Add Contact</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <CollapsibleContent className="space-y-6">
                        {/* Client Admins */}
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase flex items-center gap-1">
                                <UserCog className="h-3 w-3" /> Client Admins
                            </p>
                            {clientAdmins.length > 0 ? (
                                <div className="space-y-2">
                                    {clientAdmins.map((admin) => (
                                        <ContactRow 
                                            key={admin.id} 
                                            contact={admin} 
                                            onRemove={() => handleRemoveContact(admin.id, "admin")}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No admins listed.</p>
                            )}
                        </div>

                        <Separator />
                        
                        {/* Provider Contacts */}
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase flex items-center gap-1">
                                <DoctorIcon className="h-3 w-3" /> Providers
                            </p>
                            {providerContacts.length > 0 ? (
                                <div className="space-y-2">
                                    {providerContacts.map((provider) => (
                                        <ContactRow 
                                            key={provider.id} 
                                            contact={provider} 
                                            onRemove={() => handleRemoveContact(provider.id, "provider")}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No providers listed.</p>
                            )}
                        </div>
                    </CollapsibleContent>
                </CardContent>
            </Collapsible>
        </Card>
        
        {/* Account Team Section (SEPARATED LISTS) */}
        <Card className="border-none shadow-sm">
          <Collapsible open={isTeamOpen} onOpenChange={setIsTeamOpen}>
            <CardContent className="pt-6">
               <div className="flex items-center mb-4">
                   <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent h-auto font-heading font-semibold flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider w-full justify-start">
                            <Network className="h-4 w-4" />
                            Internal Team Structure
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isTeamOpen ? "" : "-rotate-90")} />
                        </Button>
                   </CollapsibleTrigger>
               </div>
               
               <CollapsibleContent className="space-y-6">
                  {/* Manager */}
                  <div>
                       <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> Account Manager
                       </p>
                       <TeamMemberRow member={manager} />
                  </div>

                  <Separator />

                  {/* Inside Reps */}
                  <div>
                       <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase flex items-center gap-1">
                          <Headset className="h-3 w-3" /> Inside Sales
                       </p>
                       <TeamMemberRow member={insideRep} />
                  </div>

                  <Separator />

                  {/* Field Reps */}
                  <div>
                       <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase flex items-center gap-1">
                          <Map className="h-3 w-3" /> Field Sales
                       </p>
                       <TeamMemberRow member={fieldRep} />
                  </div>
               </CollapsibleContent>
            </CardContent>
          </Collapsible>
        </Card>

        <Card className="border-none shadow-sm flex-1">
          <CardContent className="pt-6">
            <h3 className="font-heading font-semibold flex items-center gap-2 mb-4 text-muted-foreground text-sm uppercase tracking-wider">
              <History className="h-4 w-4" />
              Last Interaction
            </h3>
            <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
              <p className="text-sm text-foreground/80 leading-relaxed">"{contact.lastNotes}"</p>
            </div>

            {contact.emailHistory && contact.emailHistory.length > 0 && (
              <div className="mt-6">
                 <h3 className="font-heading font-semibold flex items-center gap-2 mb-4 text-muted-foreground text-sm uppercase tracking-wider">
                   <Mail className="h-4 w-4" />
                   Recent Emails
                 </h3>
                 <div className="space-y-2">
                   {contact.emailHistory.map((email) => (
                     <div key={email.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{email.subject}</p>
                          <p className="text-xs text-muted-foreground">{email.date}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {email.status}
                        </Badge>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Action Area */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <Card className="border-none shadow-md flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex flex-col h-full">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <div className="px-6 pt-4 border-b border-border">
                  <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="scripts" className="gap-2">
                      <FileText className="h-4 w-4" /> Scripts
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="gap-2">
                      <MessageSquare className="h-4 w-4" /> Call Notes
                    </TabsTrigger>
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="h-4 w-4" /> Send Email
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="scripts" className="flex-1 flex flex-col m-0">
                   <div className="p-6 flex-1 overflow-y-auto">
                      <h3 className="font-heading font-semibold mb-4 text-sm">Call Scripts</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Opening</p>
                          <p className="text-sm leading-relaxed">"Hi {contact.name}, this is Alex from QuantumPunch. Do you have a quick minute to chat about how we're helping practices like {contact.company} streamline their scheduling?"</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Pain Point</p>
                          <p className="text-sm leading-relaxed">"Many of your peers tell us they're spending 2-3 hours daily on administrative scheduling. Are you facing similar challenges?"</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Close</p>
                          <p className="text-sm leading-relaxed">"Would it make sense to grab 15 minutes next week to see how we could help? I'm thinking Tuesday or Wednesday work best?"</p>
                        </div>
                      </div>
                   </div>
                </TabsContent>

                <TabsContent value="notes" className="flex-1 flex flex-col m-0">
                   <div className="p-6 flex-1 flex flex-col">
                      <label className="text-sm font-medium text-muted-foreground mb-2">Log Call Details</label>
                      <Textarea 
                        placeholder="Type notes while you talk... (Supports markdown shortcuts)" 
                        className="flex-1 resize-none border-border/50 bg-muted/20 text-lg focus:ring-primary/20 p-4"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        autoFocus={activeTab === "notes"}
                      />
                   </div>
                </TabsContent>
                
                <TabsContent value="email" className="flex-1 flex flex-col m-0">
                  <div className="p-6 flex-1 overflow-y-auto">
                    <EmailComposer 
                      recipientEmail={contact.email} 
                      recipientName={contact.name} 
                      recipientCompany={contact.company}
                      specialty={contact.drServed}
                      onSend={() => onComplete("Email Sent", "Sent email via composer")}
                    />
                  </div>
                </TabsContent>

                {activeTab === "notes" && (
                  <div className="bg-muted/30 border-t border-border p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
                      Select Outcome to Complete
                      <span className="ml-auto text-xs font-normal text-muted-foreground/70">Press appropriate shortcut key</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => onComplete(status.value as CallStatus, notes)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            status.color,
                            "bg-opacity-5 hover:bg-opacity-10 bg-card dark:bg-card" // Override transparency for better contrast
                          )}
                        >
                          {status.icon && <status.icon className="h-6 w-6 mb-2 opacity-80" />}
                          <span className="text-xs font-semibold text-center">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
             </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}

function ContactRow({ contact, onRemove }: { contact: SubContact, onRemove: () => void }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group relative">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {contact.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">{contact.role}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {contact.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.phone}</span>
                </div>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-2 top-2 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={onRemove}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
    )
}

function TeamMemberRow({ member }: { member: any }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            {member.image ? (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={member.image} />
                    <AvatarFallback>{member.initial}</AvatarFallback>
                </Avatar>
            ) : (
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold", member.color)}>
                    {member.initial}
                </div>
            )}
            <div>
                <p className="text-sm font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
        </div>
    )
}
