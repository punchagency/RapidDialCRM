import React, { useState } from "react";
import { motion } from "framer-motion";
import { Prospect } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Building2, Stethoscope, History, Mail, Check, ArrowRight, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DialerCardProps {
  prospect: Prospect;
  onComplete: (status: string, notes: string) => void;
  canEdit?: boolean;
  onEditClick?: () => void;
}

export function DialerCard({ prospect, onComplete, canEdit, onEditClick }: DialerCardProps) {
  if (!prospect) return null;

  const [notes, setNotes] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [activeTab, setActiveTab] = useState("notes");
  const { toast } = useToast();

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

  const handleCallClick = async () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      toast({
        title: "Call Initiated",
        description: `Calling ${prospect.phoneNumber}...`,
      });
    }, 1500);
  };

  const handleComplete = (status: string) => {
    onComplete(status, notes);
    setNotes("");
    setIsCallActive(false);
  };

  const outcomes = [
    { key: "new", label: "New", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
    { key: "email_sent", label: "Email Sent", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
    { key: "answer", label: "Answer", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
    { key: "connected", label: "Connected", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
    { key: "responded", label: "Responded", color: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100" },
    { key: "qualified", label: "Qualified", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
    { key: "meeting_set", label: "Meeting Set", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
    { key: "visit_set", label: "Visit Set", color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" },
    { key: "call_set", label: "Call Set", color: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100" },
    { key: "demo_done", label: "Demo Done", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
    { key: "proposal", label: "Proposal", color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" },
    { key: "negotiating", label: "Negotiating", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
    { key: "closed_won", label: "Closed Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
    { key: "closed_lost", label: "Closed Lost", color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
    { key: "nurture", label: "Nurture", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
    { key: "follow_up", label: "Follow Up", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
    { key: "no_response", label: "No Response", color: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" },
    { key: "dnc", label: "DNC", color: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full w-full overflow-hidden">
      {/* Left Column: Prospect Info */}
      <div className="lg:col-span-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <Card className="border-none shadow-md flex-shrink-0">
          <CardContent className="p-4">
            <div className="h-1 bg-pink-500 w-8 rounded mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-1" data-testid="prospect-name">
              {prospect.businessName}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="h-3 w-3" />
              {prospect.territory}
            </p>

            <div className="bg-muted/40 rounded-lg p-3 mb-4">
              <div className="text-2xl font-mono font-bold text-foreground">
                {prospect.phoneNumber}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="text-foreground">{prospect.addressCity}, {prospect.addressZip}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Address</p>
                  <p className="text-foreground">{prospect.addressStreet || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Specialty</p>
                  <p className="text-foreground">{prospect.specialty}</p>
                </div>
              </div>
            </div>

            {/* Key Stakeholders */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <Users className="h-3 w-3" /> Key Stakeholders
              </p>
              <p className="text-xs text-muted-foreground">No stakeholders listed</p>
            </div>

            {/* Last Interaction */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <History className="h-3 w-3" /> Last Interaction
              </p>
              <p className="text-xs text-muted-foreground">No notes yet</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Call & Outcomes */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-hidden">
        {/* Tabs */}
        <Card className="border-none shadow-md flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 overflow-hidden h-full">
              <TabsList className="w-full bg-muted/50 border-b border-border/50 rounded-none flex-shrink-0 h-12">
                <TabsTrigger value="notes" className="flex-1 text-base py-3">
                  Call Notes
                </TabsTrigger>
                <TabsTrigger value="scripts" className="flex-1 text-base py-3">
                  Scripts
                </TabsTrigger>
                <TabsTrigger value="email" className="flex-1 text-base py-3">
                  Send Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notes" className="p-6 m-0 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-base font-semibold text-foreground mb-3 block">Log Call Details</label>
                    <Textarea
                      placeholder="Type notes while you talk... (Supports markdown shortcuts)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none text-base"
                      rows={8}
                      data-testid="call-notes-textarea"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scripts" className="p-6 m-0 flex-1 overflow-y-auto">
                <div className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase">Opening</p>
                    <p className="leading-relaxed text-foreground text-base">
                      "Hi {prospect.businessName}, this is Alex from QuantumPunch. Do you have a quick minute?"
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase">Pain Point</p>
                    <p className="leading-relaxed text-foreground text-base">
                      "Many {prospect.specialty} practices tell us they're struggling with scheduling. Are you facing similar challenges?"
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email" className="p-6 m-0 flex-1">
                <div className="text-base text-muted-foreground">
                  <p>Email composer coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Call Button + Outcome Selection */}
        <div className="flex gap-4 flex-col flex-1 overflow-hidden">
          <Card className="border-none shadow-md flex-shrink-0">
            <CardContent className="p-4">
              <div className="flex gap-2">
                {isCallActive ? (
                  <>
                    <Button
                      size="md"
                      variant="destructive"
                      className="flex-1 text-sm h-10"
                      onClick={() => setIsCallActive(false)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      End Call ({formatTime(timer)})
                    </Button>
                  </>
                ) : (
                  <Button
                    size="md"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm h-10"
                    onClick={handleCallClick}
                    disabled={isConnecting}
                    data-testid="call-button"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Selection */}
          <Card className="border-none shadow-md flex-1 overflow-hidden flex flex-col">
            <CardContent className="p-6 flex-1 overflow-y-auto">
              <div className="mb-4">
                <p className="text-base font-semibold text-foreground mb-2">Select Outcome</p>
                <p className="text-sm text-muted-foreground">Press appropriate shortcut key</p>
              </div>
              <div className="grid grid-cols-3 gap-3 auto-rows-max">
              {outcomes.map((outcome, idx) => (
                <Button
                  key={outcome.key}
                  variant="outline"
                  size="sm"
                  className={cn("h-auto py-2 px-2 flex flex-col items-center justify-center border text-xs font-medium", outcome.color)}
                  onClick={() => handleComplete(outcome.label)}
                  data-testid={`outcome-${outcome.key}`}
                >
                  <span className="text-center">{outcome.label}</span>
                </Button>
              ))}
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
