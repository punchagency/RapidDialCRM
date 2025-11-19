import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Phone, LayoutDashboard, Users, BarChart3, Settings, LogOut, Map, Plug, Headphones, Star, Briefcase, ShieldCheck, Network, UserCog, Database, Headset } from "lucide-react";
import { Link, useLocation } from "wouter";
import avatar from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import managerAvatar from "@assets/generated_images/Professional_user_avatar_2_9f00e114.png";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  // Initialize state from localStorage to persist across page loads
  const [userRole, setUserRole] = useState<"rep" | "manager" | "field" | "loader">(() => {
    const saved = localStorage.getItem("user_role");
    return (saved as "rep" | "manager" | "field" | "loader") || "rep";
  });

  // Update localStorage whenever role changes
  useEffect(() => {
    localStorage.setItem("user_role", userRole);
  }, [userRole]);

  const handleLogout = () => {
    setLocation("/auth");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Phone, label: "Power Dialer", href: "/dialer" },
    { icon: Users, label: "Contacts", href: "/contacts" },
    { icon: Map, label: "Territory", href: "/map" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
  ];

  const managerItems = [
    { icon: Headphones, label: "Call Review", href: "/call-review" },
    { icon: UserCog, label: "Field Reps", href: "/field-reps?tab=field" },
    { icon: Headset, label: "Inside Reps", href: "/field-reps?tab=inside" }, // Separated link
    { icon: Network, label: "Org Chart", href: "/org-chart" },
  ];

  const fieldItems = [
    { icon: Map, label: "My Route", href: "/map" },
    { icon: Users, label: "My Territory", href: "/contacts" },
  ];

  const loaderItems = [
    { icon: Database, label: "Lead Management", href: "/lead-loader" },
  ];

  const getRoleItems = () => {
    if (userRole === "field") return fieldItems;
    if (userRole === "loader") return loaderItems;
    return navItems; // Default for Rep and Manager (Manager adds extra below)
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                location === item.href
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
            {managerItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    location === item.href || (item.href.includes("?tab=") && location.startsWith(item.href.split("?")[0]))
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      location === item.href || (item.href.includes("?tab=") && location.startsWith(item.href.split("?")[0]))
                       ? "text-accent-foreground" 
                       : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </a>
              </Link>
            ))}
          </>
        )}
      </div>

      {/* HIPAA Compliance Indicator */}
      <div className="px-6 py-2">
         <div className="flex items-center gap-2 text-[10px] text-secondary-foreground bg-secondary/20 px-2 py-1 rounded border border-secondary/30 w-fit">
            <ShieldCheck className="h-3 w-3 text-secondary" />
            <span className="font-medium text-secondary-foreground/80">HIPAA Secure</span>
         </div>
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
                  {userRole === "manager" ? "Sarah Miller" : userRole === "field" ? "Mike Field" : userRole === "loader" ? "Data Team" : "Alex Johnson"}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">{userRole} Role</p>
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
             onClick={() => setUserRole("rep")}
             className={cn(
                 "text-[10px] py-1 rounded border transition-all", 
                 userRole === "rep" ? "bg-primary/10 border-primary text-primary font-medium" : "bg-background border-border text-muted-foreground hover:bg-muted"
             )}
           >
              Inside
           </button>
           <button 
             onClick={() => setUserRole("field")}
             className={cn(
                 "text-[10px] py-1 rounded border transition-all", 
                 userRole === "field" ? "bg-primary/10 border-primary text-primary font-medium" : "bg-background border-border text-muted-foreground hover:bg-muted"
             )}
           >
              Field
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
