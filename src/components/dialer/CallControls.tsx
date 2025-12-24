import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Hash, Loader2 } from "lucide-react";

interface CallControlsProps {
  isInCall: boolean;
  isConnecting: boolean;
  isReady: boolean;
  isMuted: boolean;
  showDialpad: boolean;
  onCallClick: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleDialpad: () => void;
}

export function CallControls({
  isInCall,
  isConnecting,
  isReady,
  isMuted,
  showDialpad,
  onCallClick,
  onHangUp,
  onToggleMute,
  onToggleDialpad,
}: CallControlsProps) {
  return (
    <div className="flex gap-2 mb-4">
      {isInCall ? (
        <>
          <Button
            size="lg"
            variant="destructive"
            className="flex-1 h-14 text-base font-semibold"
            onClick={onHangUp}
            data-testid="hangup-button"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
          <Button
            size="lg"
            variant={isMuted ? "destructive" : "outline"}
            className="h-14 w-14"
            onClick={onToggleMute}
            data-testid="mute-button"
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            size="lg"
            variant={showDialpad ? "secondary" : "outline"}
            className="h-14 w-14"
            onClick={onToggleDialpad}
            data-testid="dialpad-button"
          >
            <Hash className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <Button
          size="lg"
          className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-base font-semibold"
          onClick={onCallClick}
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
  );
}
