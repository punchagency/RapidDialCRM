import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserRole, canAccess, PermissionMatrix } from "./permissions";

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  canAccess: (permission: keyof PermissionMatrix) => boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("user_role");
    const validRoles: UserRole[] = ["admin", "manager", "sales_rep", "viewer", "loader"];
    return (validRoles.includes(saved as UserRole) ? (saved as UserRole) : "sales_rep");
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem("user_role", role);
  };

  const handleCanAccess = (permission: keyof PermissionMatrix) => {
    return canAccess(userRole, permission);
  };

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole, canAccess: handleCanAccess }}>
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

// For backwards compatibility with existing roles
export function mapLegacyRole(legacyRole: string): UserRole {
  const mapping: Record<string, UserRole> = {
    rep: "sales_rep",
    manager: "manager",
    field: "sales_rep",
    loader: "loader",
  };
  return mapping[legacyRole] || "sales_rep";
}
