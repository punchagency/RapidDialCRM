import { Badge } from "@/components/ui/badge";
import type { CallHistory } from "@/lib/types";
import { useCallOutcomes, getOutcomeStyle } from "@/hooks/useCallOutcomes";

interface CallDetailsProps {
  call: CallHistory;
}

export function CallDetails({ call }: CallDetailsProps) {
  const { data: callOutcomes = [] } = useCallOutcomes();
  const outcomeStyle = getOutcomeStyle(callOutcomes, call.outcome);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Status
        </p>
        <Badge variant="outline">{call.status}</Badge>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Outcome
        </p>
        <Badge variant="secondary" className="border" style={outcomeStyle}>
          {call.outcome}
        </Badge>
      </div>
      {call.notes && (
        <div className="col-span-2 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Notes
          </p>
          <p className="text-sm">{call.notes}</p>
        </div>
      )}
    </div>
  );
}
