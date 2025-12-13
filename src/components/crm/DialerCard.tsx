import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Prospect } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, Building2, Stethoscope, History, Mail, Check, ArrowRight, Loader2, Users, Edit, PhoneOff, Mic, MicOff, Volume2, VolumeX, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getSpecialtyColors } from "@/lib/specialtyColors";
import { useLiveKitDevice, CallStatus } from "@/hooks/useLiveKitDevice";
import { useCallOutcomes } from "@/hooks/useCallOutcomes";

interface DialerCardProps {
  prospect: Prospect;
  onComplete: (status: string, notes: string) => void;
  canEdit?: boolean;
  onEditClick?: () => void;
}

export function DialerCard({ prospect, onComplete, canEdit, onEditClick }: DialerCardProps) {
  if (!prospect) return null;

  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("notes");
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [showDialpad, setShowDialpad] = useState(false);
  const { toast } = useToast();

  const {
    callStatus,
    isMuted,
    formattedDuration,
    error,
    isReady,
    initializeDevice,
    makeCall,
    hangUp,
    toggleMute,
    sendDigits,
  } = useLiveKitDevice({ identity: "crm-dialer" });

  useEffect(() => {
    initializeDevice();
  }, [initializeDevice]);

  // Load call outcomes using hook
  const { data: outcomesData = [] } = useCallOutcomes();
  
  useEffect(() => {
    if (outcomesData) {
      setOutcomes(outcomesData);
    }
  }, [outcomesData]);

  const handleCallClick = async () => {
    if (!isReady) {
      toast({
        title: "Phone Not Ready",
        description: "Initializing phone system, please wait...",
        variant: "destructive",
      });
      return;
    }

    try {
      await makeCall(prospect.phoneNumber, {
        prospectId: prospect.id,
        callerName: "CRM Dialer",
      });
      toast({
        title: "Calling...",
        description: `Dialing ${prospect.phoneNumber}`,
      });
    } catch (err) {
      toast({
        title: "Call Failed",
        description: error || "Unable to place call",
        variant: "destructive",
      });
    }
  };

  const handleHangUp = () => {
    hangUp();
    toast({
      title: "Call Ended",
      description: `Duration: ${formattedDuration}`,
    });
  };

  const handleComplete = (status: string) => {
    if (callStatus === "connected" || callStatus === "ringing") {
      hangUp();
    }
    onComplete(status, notes);
    setNotes("");
  };

  const handleDialpadDigit = (digit: string) => {
    sendDigits(digit);
    toast({
      title: `Sent: ${digit}`,
      duration: 500,
    });
  };

  const getCallStatusDisplay = (): { text: string; color: string } => {
    switch (callStatus) {
      case "idle":
        return { text: isReady ? "Ready" : "Initializing...", color: isReady ? "text-green-600" : "text-yellow-600" };
      case "connecting":
        return { text: "Connecting...", color: "text-yellow-600" };
      case "ringing":
        return { text: "Ringing...", color: "text-blue-600" };
      case "connected":
        return { text: `Connected - ${formattedDuration}`, color: "text-green-600" };
      case "disconnected":
        return { text: "Call Ended", color: "text-gray-600" };
      case "error":
        return { text: "Error", color: "text-red-600" };
      default:
        return { text: "Unknown", color: "text-gray-600" };
    }
  };

  const statusDisplay = getCallStatusDisplay();
  const isInCall = ["connected", "ringing", "connecting"].includes(callStatus);
  const isConnecting = callStatus === "connecting";

  const dialpadButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full w-full overflow-hidden">
      {/* Left Column: Prospect Info & Call Controls */}
      <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <Card className="border-none shadow-md flex-1 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="h-1 bg-pink-500 w-8 rounded" />
              {canEdit && onEditClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onEditClick}
                  data-testid="card-edit-button"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground" data-testid="prospect-name">
                {prospect.businessName}
              </h2>
              <Badge 
                variant="secondary" 
                className={cn("text-xs px-2 py-0.5 border-none font-semibold", getSpecialtyColors(prospect.specialty).bgColor, getSpecialtyColors(prospect.specialty).textColor)}
                data-testid="specialty-badge-dialer"
              >
                {prospect.specialty}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <MapPin className="h-3 w-3" />
              {prospect.territory}
            </p>

            {/* Phone Number & Call Button */}
            <div className="flex gap-2 items-stretch mb-3">
              <div className="bg-muted/40 rounded-lg p-3 flex-1">
                <div className="text-2xl font-mono font-bold text-foreground">
                  {prospect.phoneNumber}
                </div>
                <div className={cn("text-xs font-medium mt-1", statusDisplay.color)}>
                  {statusDisplay.text}
                </div>
              </div>
            </div>

            {/* Call Control Buttons */}
            <div className="flex gap-2 mb-4">
              {isInCall ? (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="flex-1 h-14 text-base font-semibold"
                    onClick={handleHangUp}
                    data-testid="hangup-button"
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Call
                  </Button>
                  <Button
                    size="lg"
                    variant={isMuted ? "destructive" : "outline"}
                    className="h-14 w-14"
                    onClick={toggleMute}
                    data-testid="mute-button"
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="lg"
                    variant={showDialpad ? "secondary" : "outline"}
                    className="h-14 w-14"
                    onClick={() => setShowDialpad(!showDialpad)}
                    data-testid="dialpad-button"
                  >
                    <Hash className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-base font-semibold"
                  onClick={handleCallClick}
                  disabled={isConnecting || !isReady}
                  data-testid="call-button"
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Phone className="h-5 w-5 mr-2" />
                  )}
                  {isConnecting ? "Connecting..." : "Start Call"}
                </Button>
              )}
            </div>

            {/* Dialpad (shown during call) */}
            {showDialpad && isInCall && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg">
                  {dialpadButtons.map((row, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                      {row.map((digit) => (
                        <Button
                          key={digit}
                          variant="outline"
                          className="h-12 text-xl font-semibold"
                          onClick={() => handleDialpadDigit(digit)}
                          data-testid={`dialpad-${digit}`}
                        >
                          {digit}
                        </Button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Address & Details */}
            <div className="space-y-3 text-sm flex-1">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Address</p>
                  <p className="text-foreground">{[prospect.addressStreet, prospect.addressCity, prospect.addressState, prospect.addressZip].filter(Boolean).join(", ") || "N/A"}</p>
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
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <Users className="h-3 w-3" /> Key Stakeholders
              </p>
              <p className="text-xs text-muted-foreground">No stakeholders listed</p>
            </div>

            {/* Last Interaction */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <History className="h-3 w-3" /> Last Interaction
              </p>
              <p className="text-xs text-muted-foreground">No notes yet</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Tabs & Outcomes */}
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

        {/* Outcome Selection */}
        <Card className="border-none shadow-md flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-6 flex-1 overflow-y-auto">
            <div className="mb-4">
              <p className="text-base font-semibold text-foreground mb-2">Select Outcome</p>
              <p className="text-sm text-muted-foreground">Press appropriate shortcut key</p>
            </div>
            <div className="grid grid-cols-3 gap-3 auto-rows-max">
            {outcomes.map((outcome) => (
              <Button
                key={outcome.id}
                variant="outline"
                size="sm"
                className={cn("h-auto py-2 px-2 flex flex-col items-center justify-center border text-xs font-medium", outcome.bgColor, outcome.textColor, outcome.borderColor, outcome.hoverColor)}
                onClick={() => handleComplete(outcome.label)}
                data-testid={`outcome-${outcome.label}`}
              >
                <span className="text-center">{outcome.label}</span>
              </Button>
            ))}
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

