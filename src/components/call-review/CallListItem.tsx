import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CallHistory } from "@/lib/types";
import avatar from "@/assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import { useCallOutcomes, getOutcomeStyle } from "@/hooks/useCallOutcomes";

interface CallListItemProps {
  call: CallHistory;
  isActive: boolean;
  onClick: () => void;
}

// Format duration from seconds to MM:SS
const formatDuration = (seconds?: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Format date to readable format
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function CallListItem({ call, isActive, onClick }: CallListItemProps) {
  const { data: callOutcomes = [] } = useCallOutcomes();
  const duration = formatDuration(call.callDuration);
  const durationMins = Math.floor((call.callDuration || 0) / 60);
  const outcomeStyle = getOutcomeStyle(callOutcomes, call.outcome);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border-l-4",
        isActive
          ? "border-l-primary ring-1 ring-primary/20"
          : "border-l-transparent opacity-80 hover:opacity-100"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <img src={avatar} className="h-6 w-6 rounded-full" alt="Rep" />
            <span className="text-sm font-medium">
              {call.callerId || "Unknown"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(call.attemptDate)}
          </span>
        </div>
        <p className="font-semibold mb-1">
          {call.prospect?.businessName || "Unknown Business"}
        </p>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <Badge
            variant="secondary"
            className="font-normal border"
            style={outcomeStyle}
          >
            {call.outcome}
          </Badge>
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              durationMins >= 3 ? "text-purple-600" : "text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3" />
            {duration}
          </span>
          {call.recordingUrl && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <Volume2 className="h-3 w-3" />
              Recording
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
