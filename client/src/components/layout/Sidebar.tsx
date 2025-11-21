import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Phone, LayoutDashboard, Users, BarChart3, Settings, LogOut, Map, Plug, Headphones, Star, Briefcase, ShieldCheck, Network, UserCog, Database, Headset, FileText, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import avatar from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import managerAvatar from "@assets/generated_images/Professional_user_avatar_2_9f00e114.png";
import { useUserRole } from "@/lib/UserRoleContext";
import { getRoleLabel, getRoleColor } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { userRole, setUserRole, canAccess } = useUserRole();

  const [, forceUpdate] = useState(0);

  // Listen to history changes to force re-render for query params
  useEffect(() => {
    const update = () => forceUpdate(n => n + 1);
    
    window.addEventListener('popstate', update);
    
    // Patch history to catch pushState/replaceState (instant updates)
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;

    history.pushState = function(...args) {
        const res = originalPush.apply(this, args);
        update();
        return res;
    };
    
    history.replaceState = function(...args) {
        const res = originalReplace.apply(this, args);
        update();
        return res;
    };

    return () => {
        window.removeEventListener('popstate', update);
        history.pushState = originalPush;
        history.replaceState = originalReplace;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_role");
    setLocation("/auth");
  };

  const getVisibleNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "Dashboard", href: "/", permission: "dashboard_view" as const },
      { icon: Phone, label: "Power Dialer", href: "/dialer", permission: "dialer_access" as const },
      { icon: Users, label: "Contacts", href: "/contacts", permission: "contacts_view" as const },
      { icon: Map, label: "Territory", href: "/map", permission: "territories_view" as const },
      { icon: BarChart3, label: "Analytics", href: "/analytics", permission: "analytics_view" as const },
      { icon: FileText, label: "Scripts", href: "/scripts", permission: "scripts_view" as const },
    ];
    return baseItems.filter(item => canAccess(item.permission));
  };

  const managerItems = [
    { icon: Headphones, label: "Call Review", href: "/call-review" },
    { icon: UserCog, label: "Field Reps", href: "/field-reps?tab=field" },
    { icon: Headset, label: "Inside Reps", href: "/field-reps?tab=inside" },
    { icon: Network, label: "Org Chart", href: "/org-chart" },
  ];

  const getRoleItems = () => {
    return getVisibleNavItems();
  };

  // Helper to check if a link is active, including query params
  const isLinkActive = (href: string) => {
    if (href.includes("?")) {
      // For links with query params (like tabs), we need to check both path and search string
      const [path, query] = href.split("?");
      const currentSearch = window.location.search;
      return location === path && currentSearch.includes(query);
    }
    // For standard links, exact match or simple prefix for sub-routes if needed
    // Using exact match for now as per existing behavior logic mostly
    return location === href;
  };

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col shrink-0 z-20 relative">
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Phone className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-xl text-foreground tracking-tight">QuantumPunch</span>
      </div>

      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {getRoleItems().map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-1",
                isLinkActive(item.href)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isLinkActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </a>
          </Link>
        ))}

        {userRole === "manager" && (
          <>
            <div className="mt-6 mb-2 px-3">
               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider opacity-70">Manager Views</p>
            </div>
            {managerItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-1",
                      active
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        active
                         ? "text-accent-foreground" 
                         : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* HIPAA Compliance & Permissions */}
      <div className="px-6 py-2 space-y-2">
        <Link href="/hipaa">
           <div className="flex items-center gap-2 text-[10px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 w-fit shadow-sm cursor-pointer hover:bg-emerald-100 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-bold tracking-wide">HIPAA Secure</span>
           </div>
        </Link>
        <Link href="/permissions">
           <div className="flex items-center gap-2 text-[10px] text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 w-fit shadow-sm cursor-pointer hover:bg-blue-100 transition-colors">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-bold tracking-wide">My Permissions</span>
           </div>
        </Link>
      </div>

      <div className="p-4 border-t border-border">
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer mb-2",
            location === "/settings" ? "bg-primary/10" : "bg-muted/50 hover:bg-muted"
          )}>
            <img 
              src={userRole === "manager" ? managerAvatar : avatar} 
              alt="User" 
              className="h-9 w-9 rounded-full object-cover border border-border" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                  {userRole === "manager" ? "Sarah Miller" : userRole === "admin" ? "Admin User" : "Alex Johnson"}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">{userRole.replace(/_/g, ' ')} Role</p>
            </div>
            <Settings className={cn(
              "h-4 w-4 transition-colors", 
              location === "/settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )} />
          </div>
        </Link>
        
        {/* Role Switching Buttons */}
        <div className="grid grid-cols-2 gap-1 mt-2 mb-2">
           <button 
             onClick={() => setUserRole("admin")}
             className={cn(
                 "text-[10px] py-1 rounded border transition-all", 
                 userRole === "admin" ? "bg-primary/10 border-primary text-primary font-medium" : "bg-background border-border text-muted-foreground hover:bg-muted"
             )}
           >
              Admin
           </button>
           <button 
             onClick={() => setUserRole("manager")}
             className={cn(
                 "text-[10px] py-1 rounded border transition-all", 
                 userRole === "manager" ? "bg-primary/10 border-primary text-primary font-medium" : "bg-background border-border text-muted-foreground hover:bg-muted"
             )}
           >
              Manager
           </button>
           <button 
             onClick={() => setUserRole("sales_rep")}
             className={cn(
                 "text-[10px] py-1 rounded border transition-all", 
                 userRole === "sales_rep" ? "bg-primary/10 border-primary text-primary font-medium" : "bg-background border-border text-muted-foreground hover:bg-muted"
             )}
           >
              Sales Rep
           </button>
           <button 
             onClick={() => setUserRole("loader")}
             className={cn(
                 "text-[10px] py-1 rounded border transition-all", 
                 userRole === "loader" ? "bg-primary/10 border-primary text-primary font-medium" : "bg-background border-border text-muted-foreground hover:bg-muted"
             )}
           >
              Loader
           </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors py-2 mt-1 border-t border-border border-dashed"
        >
          <LogOut className="h-3 w-3" /> Sign Out
        </button>
      </div>
    </div>
  );
}
