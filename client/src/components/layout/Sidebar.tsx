import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Phone, LayoutDashboard, Users, BarChart3, Settings, LogOut, Map, Plug, Headphones, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import avatar from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import managerAvatar from "@assets/generated_images/Professional_user_avatar_2_9f00e114.png";

export function Sidebar() {
  const [location] = useLocation();
  const [userRole, setUserRole] = useState<"rep" | "manager">("rep");

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Phone, label: "Power Dialer", href: "/dialer" },
    { icon: Users, label: "Contacts", href: "/contacts" },
    { icon: Map, label: "Territory", href: "/map" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
  ];

  const managerItems = [
    { icon: Headphones, label: "Call Review", href: "/call-review" },
  ];

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col shrink-0 z-20 relative">
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Phone className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-heading font-bold text-xl text-foreground">QuoCRM</span>
      </div>

      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                location === item.href
                  ? "bg-primary/10 text-primary"
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
               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager Views</p>
            </div>
            {managerItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    location === item.href
                      ? "bg-purple-500/10 text-purple-600"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      location === item.href ? "text-purple-600" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </a>
              </Link>
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer mb-2",
            location === "/settings" ? "bg-primary/10" : "bg-muted/50 hover:bg-muted"
          )}>
            <img 
              src={userRole === "rep" ? avatar : managerAvatar} 
              alt="User" 
              className="h-9 w-9 rounded-full object-cover border border-border" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userRole === "rep" ? "Alex Johnson" : "Sarah Miller"}</p>
              <p className="text-xs text-muted-foreground truncate">{userRole === "rep" ? "Sales Rep" : "Sales Manager"}</p>
            </div>
            <Settings className={cn(
              "h-4 w-4 transition-colors", 
              location === "/settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )} />
          </div>
        </Link>
        
        <button 
           onClick={() => setUserRole(r => r === "rep" ? "manager" : "rep")}
           className="w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors"
        >
           Switch to {userRole === "rep" ? "Manager" : "Rep"} View
        </button>
      </div>
    </div>
  );
}
