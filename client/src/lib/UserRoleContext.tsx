import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserRole = "rep" | "manager" | "field" | "loader";

interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("user_role");
    return (saved as UserRole) || "rep";
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem("user_role", role);
    // Dispatch a custom event so non-React parts (if any) or other tabs could potentially know, 
    // but primarily for consistency if we were using event listeners.
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
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
