import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "wouter";

interface DialerHeaderProps {
  currentIndex: number;
  totalProspects: number;
  canEdit: boolean;
  onEditClick: () => void;
}

export function DialerHeader({
  currentIndex,
  totalProspects,
  canEdit,
  onEditClick,
}: DialerHeaderProps) {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Focus Mode
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm font-medium text-muted-foreground">
          Call {currentIndex + 1} of {totalProspects}
        </span>
        {canEdit && (
          <>
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={onEditClick}
              data-testid="dialer-edit-button"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / totalProspects) * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
}
