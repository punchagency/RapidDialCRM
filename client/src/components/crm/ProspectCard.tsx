import React from "react";
import { Prospect } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { getSpecialtyColors } from "@/lib/specialtyColors";

interface ProspectCardProps {
  prospect: Prospect;
  showEditButton?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
}

export function ProspectCard({ 
  prospect, 
  showEditButton = false,
  onEdit
}: ProspectCardProps) {
  const colors = getSpecialtyColors(prospect.specialty);
  const fullAddress = [prospect.addressStreet, prospect.addressCity, prospect.addressState, prospect.addressZip]
    .filter(Boolean)
    .join(", ") || "N/A";

  return (
    <Link href={`/dialer?prospectId=${prospect.id}`}>
      <Card className="group hover:shadow-md transition-all border-border/60 cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {prospect.businessName.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold truncate">{prospect.businessName}</p>
                <Badge 
                  variant="secondary" 
                  className={cn("text-[10px] h-5 px-2 rounded-full font-semibold border-none", colors.bgColor, colors.textColor)}
                  data-testid={`specialty-badge-${prospect.id}`}
                >
                  {prospect.specialty}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{fullAddress}</p>
            </div>
            
            <div className="hidden md:block text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> {prospect.phoneNumber}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-3 w-3" /> {prospect.territory}
              </div>
            </div>
            
            <div className="hidden md:flex items-center justify-end gap-2">
              {showEditButton && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onEdit}
                  data-testid={`edit-button-${prospect.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
