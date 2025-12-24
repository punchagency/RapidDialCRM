import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CallOutcome } from "@/lib/types";

interface OutcomeSelectorProps {
  outcomes: CallOutcome[];
  onOutcomeSelect: (outcome: string) => void;
}

export function OutcomeSelector({
  outcomes,
  onOutcomeSelect,
}: OutcomeSelectorProps) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-base font-semibold text-foreground mb-2">
          Select Outcome
        </p>
        <p className="text-sm text-muted-foreground">
          Press appropriate shortcut key
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 auto-rows-max">
        {outcomes.map((outcome) => (
          <Button
            key={outcome.id}
            variant="outline"
            size="sm"
            className={`h-auto py-2 px-2 flex flex-col items-center justify-center border text-xs font-medium ${outcome.bgColor} ${outcome.textColor} ${outcome.borderColor}`}
            onClick={() => onOutcomeSelect(outcome.label)}
            data-testid={`outcome-${outcome.label}`}
          >
            <span className="text-center">{outcome.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
