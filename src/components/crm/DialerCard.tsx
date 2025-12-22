import React, { useState, useEffect } from "react";
import { Prospect } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { CallStatusDisplay } from "@/components/dialer/CallStatusDisplay";
import { CallControls } from "@/components/dialer/CallControls";
import { DialpadPanel } from "@/components/dialer/DialpadPanel";
import { ProspectInfo } from "@/components/dialer/ProspectInfo";
import { CallNotesTab } from "@/components/dialer/CallNotesTab";
import { ScriptsTab } from "@/components/dialer/ScriptsTab";
import { OutcomeSelector } from "@/components/dialer/OutcomeSelector";

interface DialerCardProps {
  prospect: Prospect;
  onComplete: (status: string, notes: string) => void;
  canEdit?: boolean;
  onEditClick?: () => void;
}

export function DialerCard({
  prospect,
  onComplete,
  canEdit,
  onEditClick,
}: DialerCardProps) {
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
  } = useTwilioDevice({ identity: "crm-dialer" });

  useEffect(() => {
    initializeDevice();
  }, [initializeDevice]);

  useEffect(() => {
    async function loadOutcomes() {
      try {
        const { data: outcomes } = await CustomServerApi.getCallOutcomes();
        if (outcomes) {
          setOutcomes(outcomes);
        }
      } catch (error) {
        console.error("Failed to load call outcomes:", error);
      }
    }
    loadOutcomes();
  }, []);

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

  const isInCall = ["connected", "ringing", "connecting"].includes(callStatus);
  const isConnecting = callStatus === "connecting";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full w-full overflow-hidden">
      {/* Left Column: Prospect Info & Call Controls */}
      <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto">
        <Card className="border-none shadow-md flex-1 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <ProspectInfo
              prospect={prospect}
              canEdit={canEdit}
              onEditClick={onEditClick}
            />

            {/* Phone Number & Call Button */}
            <div className="flex gap-2 items-stretch mb-3 mt-4">
              <CallStatusDisplay
                phoneNumber={prospect.phoneNumber}
                callStatus={callStatus}
                isReady={isReady}
                formattedDuration={formattedDuration}
              />
            </div>

            {/* Call Control Buttons */}
            <CallControls
              isInCall={isInCall}
              isConnecting={isConnecting}
              isReady={isReady}
              isMuted={isMuted}
              showDialpad={showDialpad}
              onCallClick={handleCallClick}
              onHangUp={handleHangUp}
              onToggleMute={toggleMute}
              onToggleDialpad={() => setShowDialpad(!showDialpad)}
            />

            {/* Dialpad */}
            <DialpadPanel
              show={showDialpad}
              isInCall={isInCall}
              onDigitPress={handleDialpadDigit}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Tabs & Outcomes */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-hidden">
        {/* Tabs */}
        <Card className="border-none shadow-md flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col flex-1 overflow-hidden h-full"
            >
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

              <TabsContent
                value="notes"
                className="p-6 m-0 flex-1 overflow-y-auto"
              >
                <CallNotesTab notes={notes} onNotesChange={setNotes} />
              </TabsContent>

              <TabsContent
                value="scripts"
                className="p-6 m-0 flex-1 overflow-y-auto"
              >
                <ScriptsTab prospect={prospect} />
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
            <OutcomeSelector
              outcomes={outcomes}
              onOutcomeSelect={handleComplete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
