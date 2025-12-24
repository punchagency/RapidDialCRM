import type { Prospect } from "@/lib/types";

interface ScriptsTabProps {
  prospect: Prospect;
}

export function ScriptsTab({ prospect }: ScriptsTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
          Opening
        </p>
        <p className="leading-relaxed text-foreground text-base">
          "Hi {prospect.businessName}, this is Alex from QuantumPunch. Do you
          have a quick minute?"
        </p>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
          Pain Point
        </p>
        <p className="leading-relaxed text-foreground text-base">
          "Many {prospect.specialty} practices tell us they're struggling with
          scheduling. Are you facing similar challenges?"
        </p>
      </div>
    </div>
  );
}
