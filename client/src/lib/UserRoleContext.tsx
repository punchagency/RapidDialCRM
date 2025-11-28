import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole, canAccess as checkPermission, PermissionMatrix } from "./permissions";
import { User } from "@shared/schema";

interface ImpersonationState {
  isActive: boolean;
  user: User | null;
  role: UserRole | null;
}

interface UserRoleContextType {
  userRole: UserRole;
  actualRole: UserRole;
  setUserRole: (role: UserRole) => void;
  canAccess: (permission: keyof PermissionMatrix) => boolean;
  isImpersonating: boolean;
  impersonatedUser: User | null;
  startImpersonation: (user: User, role?: UserRole) => void;
  stopImpersonation: () => void;
  canImpersonate: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [actualRole, setActualRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("user_role");
    const validRoles: UserRole[] = ["admin", "manager", "sales_rep", "loader"];
    return (validRoles.includes(saved as UserRole) ? (saved as UserRole) : "sales_rep");
  });

  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    isActive: false,
    user: null,
    role: null,
  });

  const setUserRole = (role: UserRole) => {
    setActualRoleState(role);
    localStorage.setItem("user_role", role);
    if (impersonation.isActive) {
      stopImpersonation();
    }
  };

  const mapDbRoleToUiRole = (dbRole: string): UserRole => {
    const mapping: Record<string, UserRole> = {
      admin: "admin",
      manager: "manager",
      inside_sales_rep: "sales_rep",
      field_sales_rep: "sales_rep",
      data_loader: "loader",
    };
    return mapping[dbRole] || "sales_rep";
  };

  const startImpersonation = (user: User, role?: UserRole) => {
    const effectiveRole = role || mapDbRoleToUiRole(user.role);
    setImpersonation({
      isActive: true,
      user,
      role: effectiveRole,
    });
  };

  const stopImpersonation = () => {
    setImpersonation({
      isActive: false,
      user: null,
      role: null,
    });
  };

  const effectiveRole = impersonation.isActive && impersonation.role 
    ? impersonation.role 
    : actualRole;

  const handleCanAccess = (permission: keyof PermissionMatrix) => {
    return checkPermission(effectiveRole, permission);
  };

  const canImpersonate = actualRole === "admin";

  return (
    <UserRoleContext.Provider value={{ 
      userRole: effectiveRole,
      actualRole,
      setUserRole, 
      canAccess: handleCanAccess,
      isImpersonating: impersonation.isActive,
      impersonatedUser: impersonation.user,
      startImpersonation,
      stopImpersonation,
      canImpersonate,
    }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}

export function mapLegacyRole(legacyRole: string): UserRole {
  const mapping: Record<string, UserRole> = {
    rep: "sales_rep",
    manager: "manager",
    field: "sales_rep",
    loader: "loader",
  };
  return mapping[legacyRole] || "sales_rep";
}
