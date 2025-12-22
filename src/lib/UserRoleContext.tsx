import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserRole, canAccess as checkPermission, PermissionMatrix } from "./permissions";
import { User } from "@/lib/types";
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth();

  const mapDbRoleToUiRole = (dbRole: string): UserRole => {
    const mapping: Record<string, UserRole> = {
      admin: "admin",
      manager: "manager",
      sales_manager: "manager",
      inside_sales_rep: "sales_rep",
      field_sales_rep: "sales_rep",
      data_loader: "loader",
    };
    return mapping[dbRole] || "sales_rep";
  };

  const [actualRole, setActualRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("user_role");
    const validRoles: UserRole[] = ["admin", "manager", "sales_rep", "loader"];
    if (user?.role) {
      return mapDbRoleToUiRole(user.role);
    }
    return validRoles.includes(saved as UserRole) ? (saved as UserRole) : "sales_rep";
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

  useEffect(() => {
    if (user?.role) {
      const mapped = mapDbRoleToUiRole(user.role);
      setActualRoleState(mapped);
      localStorage.setItem("user_role", mapped);
      if (impersonation.isActive) {
        stopImpersonation();
      }
    } else {
      // Reset to default when logging out
      localStorage.removeItem("user_role");
      setActualRoleState("sales_rep");
      if (impersonation.isActive) {
        stopImpersonation();
      }
    }
  }, [user?.role, impersonation.isActive]);

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

