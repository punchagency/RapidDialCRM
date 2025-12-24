import { cn } from "@/lib/utils";
import { CallStatus } from "@/hooks/useTwilioDevice";

interface CallStatusDisplayProps {
  phoneNumber: string;
  callStatus: CallStatus;
  isReady: boolean;
  formattedDuration: string;
}

const getCallStatusDisplay = (
  callStatus: CallStatus,
  isReady: boolean,
  formattedDuration: string
): { text: string; color: string } => {
  switch (callStatus) {
    case "idle":
      return {
        text: isReady ? "Ready" : "Initializing...",
        color: isReady ? "text-green-600" : "text-yellow-600",
      };
    case "connecting":
      return { text: "Connecting...", color: "text-yellow-600" };
    case "ringing":
      return { text: "Ringing...", color: "text-blue-600" };
    case "connected":
      return {
        text: `Connected - ${formattedDuration}`,
        color: "text-green-600",
      };
    case "disconnected":
      return { text: "Call Ended", color: "text-gray-600" };
    case "error":
      return { text: "Error", color: "text-red-600" };
    default:
      return { text: "Unknown", color: "text-gray-600" };
  }
};

export function CallStatusDisplay({
  phoneNumber,
  callStatus,
  isReady,
  formattedDuration,
}: CallStatusDisplayProps) {
  const statusDisplay = getCallStatusDisplay(
    callStatus,
    isReady,
    formattedDuration
  );

  return (
    <div className="bg-muted/40 rounded-lg p-3 flex-1">
      <div className="text-2xl font-mono font-bold text-foreground">
        {phoneNumber}
      </div>
      <div className={cn("text-xs font-medium mt-1", statusDisplay.color)}>
        {statusDisplay.text}
      </div>
    </div>
  );
}
