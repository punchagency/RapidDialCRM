import { Textarea } from "@/components/ui/textarea";

interface CallNotesTabProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function CallNotesTab({ notes, onNotesChange }: CallNotesTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-base font-semibold text-foreground mb-3 block">
          Log Call Details
        </label>
        <Textarea
          placeholder="Type notes while you talk... (Supports markdown shortcuts)"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="resize-none text-base"
          rows={8}
          data-testid="call-notes-textarea"
        />
      </div>
    </div>
  );
}
