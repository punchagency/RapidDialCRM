import React from "react";
import { cn } from "@/lib/utils";
import { EmailLog } from "@/lib/types";
import { Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface EmailListItemProps {
  email: EmailLog;
  isActive: boolean;
  onClick: () => void;
}

export function EmailListItem({
  email,
  isActive,
  onClick,
}: EmailListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all border",
        isActive
          ? "bg-primary/5 border-primary shadow-sm"
          : "bg-card border-border hover:bg-muted/50 hover:border-primary/20"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">
              {email.title || "No Title"}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1">
              To: {email.to}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <p className="font-medium text-xs mb-1 line-clamp-1">{email.subject}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(email.createdAt), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      </div>
    </div>
  );
}
