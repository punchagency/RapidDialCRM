import React, { useState, useEffect } from "react";
import { Prospect } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { useTwilioDevice } from "@/hooks/useTwilioDevice";
import { CallStatusDisplay } from "@/components/dialer/CallStatusDisplay";
import { CallControls } from "@/components/dialer/CallControls";
import { DialpadPanel } from "@/components/dialer/DialpadPanel";
import { ProspectInfo } from "@/components/dialer/ProspectInfo";

interface QuickDialerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  prospect?: Prospect | null;
  defaultPhoneNumber?: string;
}

export function QuickDialerSidebar({
  isOpen,
  onClose,
  prospect,
  defaultPhoneNumber = "",
}: QuickDialerSidebarProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [showDialpad, setShowDialpad] = useState(false);
  const { toast } = useToast();

  const { user } = useAuth();

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
  } = useTwilioDevice({ identity: user?.id || "" });

  useEffect(() => {
    if (isOpen) {
      initializeDevice();
    }
  }, [isOpen, initializeDevice]);

  // Update phone number when prospect changes
  useEffect(() => {
    if (prospect) {
      setPhoneNumber(prospect.phoneNumber);
    } else {
      setPhoneNumber(defaultPhoneNumber);
    }
  }, [prospect, defaultPhoneNumber]);

  const handleCallClick = async () => {
    if (!isReady) {
      toast({
        title: "Phone Not Ready",
        description: "Initializing phone system, please wait...",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Number",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      await makeCall(phoneNumber, {
        prospectId: prospect?.id,
        callerName: "CRM Dialer",
      });
      toast({
        title: "Calling...",
        description: `Dialing ${phoneNumber}`,
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

  const handleDialpadDigit = (digit: string) => {
    sendDigits(digit);
    toast({
      title: `Sent: ${digit}`,
      duration: 500,
    });
  };

  const handleClose = () => {
    if (callStatus === "connected" || callStatus === "ringing") {
      toast({
        title: "Active Call",
        description: "Please hang up before closing",
        variant: "destructive",
      });
      return;
    }
    onClose();
  };

  const isInCall = ["connected", "ringing", "connecting"].includes(callStatus);
  const isConnecting = callStatus === "connecting";

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Dialer</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Manual Phone Number Input */}
          {!prospect && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Phone Number
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isInCall}
                  className="flex-1"
                  data-testid="quick-dialer-phone-input"
                />
                {phoneNumber && !isInCall && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPhoneNumber("")}
                    data-testid="clear-phone-button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Call Status Display */}
          <div>
            <CallStatusDisplay
              phoneNumber={phoneNumber || "No number"}
              callStatus={callStatus}
              isReady={isReady}
              formattedDuration={formattedDuration}
            />
          </div>

          {/* Call Controls */}
          <CallControls
            isInCall={isInCall}
            isConnecting={isConnecting}
            isReady={isReady && !!phoneNumber.trim()}
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

          {/* Prospect Info (only if prospect is provided) */}
          {prospect && (
            <div className="mt-4 pt-4 border-t border-border">
              <ProspectInfo prospect={prospect} canEdit={false} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
