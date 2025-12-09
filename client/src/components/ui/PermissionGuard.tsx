import React from "react";
import { useUserRole } from "@/lib/UserRoleContext";
import { PermissionMatrix } from "@/lib/permissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionGuardProps {
  permission: keyof PermissionMatrix;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null,
  showTooltip = true 
}: PermissionGuardProps) {
  const { canAccess, userRole } = useUserRole();
  
  if (canAccess(permission)) {
    return <>{children}</>;
  }

  if (!showTooltip) {
    return <>{fallback}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block opacity-50 cursor-not-allowed pointer-events-none">
          {fallback || children}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Access denied for {userRole.replace(/_/g, ' ')} role</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface ConditionalRenderProps {
  permission: keyof PermissionMatrix;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRender({ 
  permission, 
  children, 
  fallback = null 
}: ConditionalRenderProps) {
  const { canAccess } = useUserRole();
  
  if (canAccess(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

