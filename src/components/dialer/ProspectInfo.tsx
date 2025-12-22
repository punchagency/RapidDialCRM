import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Stethoscope, Users, History, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSpecialtyColors } from "@/lib/specialtyColors";
import type { Prospect } from "@/lib/types";

interface ProspectInfoProps {
  prospect: Prospect;
  canEdit?: boolean;
  onEditClick?: () => void;
}

export function ProspectInfo({
  prospect,
  canEdit,
  onEditClick,
}: ProspectInfoProps) {
  return (
    <>
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
        <h2
          className="text-lg font-bold text-foreground"
          data-testid="prospect-name"
        >
          {prospect.businessName}
        </h2>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs px-2 py-0.5 border-none font-semibold",
            getSpecialtyColors(prospect.specialty).bgColor,
            getSpecialtyColors(prospect.specialty).textColor
          )}
          data-testid="specialty-badge-dialer"
        >
          {prospect.specialty}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
        <MapPin className="h-3 w-3" />
        {prospect.territory}
      </p>

      {/* Address & Details */}
      <div className="space-y-3 text-sm flex-1">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Address</p>
            <p className="text-foreground">
              {[
                prospect.addressStreet,
                prospect.addressCity,
                prospect.addressState,
                prospect.addressZip,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Specialty
            </p>
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
    </>
  );
}
