import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TeamMembersTab } from "@/components/crm/TeamMembersTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useUserRole } from "@/lib/UserRoleContext";

export default function TeamMembers() {
  const { userRole } = useUserRole();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-muted/10">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Admin</p>
            <h1 className="text-xl font-heading font-semibold text-foreground">Team Members</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {userRole !== "admin" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    <CardTitle className="text-base">Access restricted</CardTitle>
                  </div>
                  <CardDescription>
                    You need administrator access to manage team members.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Switch to an admin account or contact your system administrator.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <TeamMembersTab />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

