import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { IntegrationsTab } from "@/components/crm/IntegrationsTab";
import { TemplatesTab } from "@/components/crm/TemplatesTab";
import { ProfessionsTab } from "@/components/crm/ProfessionsTab";
import { FieldSettingsTab } from "@/components/crm/FieldSettingsTab";
import { SecurityTab } from "@/components/crm/SecurityTab";
import { TeamStructureTab } from "@/components/crm/TeamStructureTab";
import { StatusesTab } from "@/components/crm/StatusesTab";
import { UserAssignmentsTab } from "@/components/crm/UserAssignmentsTab";
import { TeamMembersTab } from "@/components/crm/TeamMembersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Plug, FileText, Briefcase, Map, Network, CheckCircle, ChevronRight, Lock, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/UserRoleContext";
import type { PermissionMatrix } from "@/lib/permissions";

type SettingsTab = {
  value: string;
  icon: LucideIcon;
  label: string;
  adminOnly?: boolean;
  permission?: keyof PermissionMatrix;
};

export default function Settings() {
  const { canAccess, userRole } = useUserRole();

  const configTabs: SettingsTab[] = [
    { value: "profile", icon: User, label: "Profile" },
    { value: "statuses", icon: CheckCircle, label: "Call Statuses" },
    { value: "assignments", icon: MapPin, label: "User Assignments" },
    { value: "team-members", icon: Users, label: "Team Members", adminOnly: true },
    { value: "team", icon: Network, label: "Team Structure" },
    { value: "security", icon: Shield, label: "Security" },
    { value: "notifications", icon: Bell, label: "Notifications" },
  ];

  const systemTabs: SettingsTab[] = [
    { value: "field", icon: Map, label: "Field & Route", permission: "settings_access" as const },
    { value: "professions", icon: Briefcase, label: "Professions", permission: "settings_access" as const },
    { value: "templates", icon: FileText, label: "Templates", permission: "settings_access" as const },
    { value: "integrations", icon: Plug, label: "Integrations", permission: "settings_integrations" as const },
  ].filter(tab => !tab.permission || canAccess(tab.permission));

  const visibleConfigTabs = configTabs.filter(tab => {
    if (tab.adminOnly) return userRole === "admin";
    if (tab.value === "team") return canAccess("team_management");
    if (tab.value === "assignments") return canAccess("team_management");
    return true;
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-muted/10">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <h1 className="text-xl font-heading font-semibold text-foreground">Settings</h1>
        </header>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="statuses" orientation="vertical" className="flex h-full">
            <aside className="w-64 border-r border-border bg-white/50 overflow-y-auto shrink-0">
              <div className="p-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Configuration</h2>
                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                  {visibleConfigTabs.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                        "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
                        "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground",
                        "border-none"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      <ChevronRight className="h-3 w-3 ml-auto opacity-0 data-[state=active]:opacity-50" />
                    </TabsTrigger>
                  ))}
                </TabsList>

                {systemTabs.length > 0 && (
                  <>
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-4 px-2">System</h2>
                    <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                      {systemTabs.map((item) => (
                        <TabsTrigger
                          key={item.value}
                          value={item.value}
                          className={cn(
                            "w-full justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                            "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
                            "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground",
                            "border-none"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                          <ChevronRight className="h-3 w-3 ml-auto opacity-0 data-[state=active]:opacity-50" />
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </>
                )}
              </div>
            </aside>

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              <div className="max-w-5xl mx-auto p-8">
                <TabsContent value="profile" className="mt-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Profile Settings</h2>
                    <p className="text-sm text-muted-foreground mb-6">Manage your public profile and preferences.</p>
                    <Card className="border shadow-sm">
                      <CardContent className="space-y-4 p-6">
                        <div className="grid gap-2 max-w-md">
                          <Label>Display Name</Label>
                          <Input defaultValue="Alex Johnson" />
                        </div>
                        <div className="grid gap-2 max-w-md">
                          <Label>Email</Label>
                          <Input defaultValue="alex@quantumpunch.com" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="statuses" className="mt-0">
                  <StatusesTab />
                </TabsContent>

                <TabsContent value="assignments" className="mt-0">
                  <UserAssignmentsTab />
                </TabsContent>

                <TabsContent value="team-members" className="mt-0">
                  <TeamMembersTab />
                </TabsContent>

                <TabsContent value="team" className="mt-0">
                  <TeamStructureTab />
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <SecurityTab />
                </TabsContent>

                <TabsContent value="field" className="mt-0">
                  <FieldSettingsTab />
                </TabsContent>

                <TabsContent value="professions" className="mt-0">
                  <ProfessionsTab />
                </TabsContent>

                <TabsContent value="templates" className="mt-0">
                  <TemplatesTab />
                </TabsContent>

                <TabsContent value="integrations" className="mt-0">
                  <IntegrationsTab />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Notification Preferences</h2>
                    <p className="text-sm text-muted-foreground mb-6">Choose how and when you want to be notified.</p>
                    <Card className="border shadow-sm">
                      <CardContent className="space-y-0 divide-y p-0">
                        <div className="flex items-center justify-between p-6">
                          <div className="space-y-0.5">
                            <Label className="text-base">Email Summary</Label>
                            <p className="text-sm text-muted-foreground">Receive a daily summary of team performance.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-6">
                          <div className="space-y-0.5">
                            <Label className="text-base">Missed Call Alerts</Label>
                            <p className="text-sm text-muted-foreground">Get notified immediately when a call is missed.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

