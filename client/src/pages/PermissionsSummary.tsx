import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserRole } from "@/lib/UserRoleContext";
import { getRoleLabel, getRoleColor, permissionMatrix, UserRole } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2, Save, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const permissionGroups = [
  {
    name: "Dashboard",
    permissions: ["dashboard_view", "dashboard_view_all", "dashboard_view_own"],
    descriptions: {
      dashboard_view: "View Dashboard",
      dashboard_view_all: "View all team data",
      dashboard_view_own: "View own data only",
    } as Record<string, string>,
  },
  {
    name: "Contacts",
    permissions: ["contacts_view", "contacts_view_all", "contacts_edit", "contacts_edit_all", "contacts_delete", "contacts_export"],
    descriptions: {
      contacts_view: "View Contacts",
      contacts_view_all: "View all contacts",
      contacts_edit: "Edit Contacts",
      contacts_edit_all: "Edit all contacts",
      contacts_delete: "Delete Contacts",
      contacts_export: "Export Contacts",
    },
  },
  {
    name: "Power Dialer",
    permissions: ["dialer_access"],
    descriptions: {
      dialer_access: "Access Power Dialer",
    },
  },
  {
    name: "Scripts",
    permissions: ["scripts_view", "scripts_edit"],
    descriptions: {
      scripts_view: "View Scripts",
      scripts_edit: "Edit/Create Scripts (Admin Only)",
    },
  },
  {
    name: "Settings",
    permissions: ["settings_access", "settings_users", "settings_integrations", "settings_scripts_cms", "settings_billing"],
    descriptions: {
      settings_access: "Access Settings",
      settings_users: "Manage Users",
      settings_integrations: "Manage Integrations",
      settings_scripts_cms: "Scripts Management CMS",
      settings_billing: "Billing Settings",
    },
  },
  {
    name: "Analytics",
    permissions: ["analytics_view", "analytics_view_all"],
    descriptions: {
      analytics_view: "View Analytics",
      analytics_view_all: "View all team analytics",
    },
  },
  {
    name: "Territories",
    permissions: ["territories_view", "territories_view_all", "territories_edit", "territories_assign"],
    descriptions: {
      territories_view: "View Territories",
      territories_view_all: "View all territories",
      territories_edit: "Edit Territories",
      territories_assign: "Assign Territories",
    },
  },
  {
    name: "Administration",
    permissions: ["team_management", "audit_logs"],
    descriptions: {
      team_management: "Team Management",
      audit_logs: "View Audit Logs",
    },
  },
];

export default function PermissionsSummary() {
  const { userRole } = useUserRole();
  const [editMode, setEditMode] = useState(false);
  const [editingRoles, setEditingRoles] = useState<Record<UserRole, Record<string, boolean>>>(() => {
    const initial: Record<UserRole, Record<string, boolean>> = {
      admin: { ...permissionMatrix.admin },
      manager: { ...permissionMatrix.manager },
      sales_rep: { ...permissionMatrix.sales_rep },
      viewer: { ...permissionMatrix.viewer },
      loader: { ...permissionMatrix.loader },
    };
    return initial;
  });
  const { toast } = useToast();
  const roleData = permissionMatrix[userRole];
  const isAdmin = userRole === "admin";

  const togglePermission = (role: UserRole, permission: string) => {
    setEditingRoles((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission],
      },
    }));
  };

  const handleSave = () => {
    toast({ title: "Permissions Updated", description: "Role permissions have been saved successfully." });
    setEditMode(false);
  };

  const handleCancel = () => {
    const reset: Record<UserRole, Record<string, boolean>> = {
      admin: { ...permissionMatrix.admin },
      manager: { ...permissionMatrix.manager },
      sales_rep: { ...permissionMatrix.sales_rep },
      viewer: { ...permissionMatrix.viewer },
      loader: { ...permissionMatrix.loader },
    };
    setEditingRoles(reset);
    setEditMode(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-muted/10">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">Permissions Summary</h1>
            <p className="text-xs text-muted-foreground mt-1">View your access level and capabilities</p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setEditMode(!editMode)}
              className={cn(editMode ? "bg-destructive hover:bg-destructive/90" : "gap-2")}
              variant={editMode ? "destructive" : "default"}
            >
              <Edit2 className="h-4 w-4" />
              {editMode ? "Cancel Editing" : "Edit Role Permissions"}
            </Button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {/* Role Card */}
            <Card className="mb-8 border-2 bg-gradient-to-br from-primary/5 to-primary/2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Your Role</CardTitle>
                  </div>
                  <Badge className={cn("text-lg px-4 py-2", getRoleColor(userRole))}>
                    {getRoleLabel(userRole)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {userRole === "admin" && "Full system access. You can manage all settings, users, scripts, and configurations."}
                  {userRole === "manager" && "Team management capabilities. You can view all team data, manage team members, and access most settings except system configuration."}
                  {userRole === "sales_rep" && "Sales focused access. You can make calls, manage your own contacts and territories, and view your performance metrics."}
                  {userRole === "viewer" && "Read-only access. You can view dashboards and reports but cannot make any changes or edit data."}
                </p>
              </CardContent>
            </Card>

            {/* Your Permissions */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-foreground">Your Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissionGroups.map((group) =>
                  group.permissions.map((perm) => {
                    const hasAccess = roleData[perm as keyof typeof roleData];
                    return (
                      <Card key={perm} className={cn(
                        "transition-all border",
                        hasAccess 
                          ? "bg-green-50/50 border-green-200 hover:border-green-300" 
                          : "bg-red-50/30 border-red-200/50"
                      )}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={cn(
                            "p-1.5 rounded-md",
                            hasAccess ? "bg-green-100" : "bg-gray-100"
                          )}>
                            {hasAccess ? (
                              <Check className="h-4 w-4 text-green-700" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <p className={cn(
                            "text-sm font-medium",
                            hasAccess ? "text-green-900" : "text-gray-600"
                          )}>
                            {group.descriptions[perm as keyof typeof group.descriptions] || perm}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Admin Edit Permissions */}
            {isAdmin && editMode && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Edit Role Permissions</h2>
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 gap-2">
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Permission</th>
                        <th className="text-center py-3 px-4 font-semibold min-w-24">Administrator</th>
                        <th className="text-center py-3 px-4 font-semibold min-w-24">Manager</th>
                        <th className="text-center py-3 px-4 font-semibold min-w-24">Sales Rep</th>
                        <th className="text-center py-3 px-4 font-semibold min-w-24">Data Loader</th>
                        <th className="text-center py-3 px-4 font-semibold min-w-24">Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissionGroups.map((group) => (
                        <React.Fragment key={group.name}>
                          {/* Category Header Row */}
                          <tr className="bg-primary/5 border-b border-border hover:bg-primary/10">
                            <td colSpan={5} className="py-2.5 px-4 font-bold text-sm text-foreground">
                              {group.name}
                            </td>
                          </tr>
                          {/* Permission Rows */}
                          {group.permissions.map((perm) => {
                            const permDesc = group.descriptions[perm as keyof typeof group.descriptions] || perm;
                            return (
                              <tr key={perm} className="border-b border-border/30 hover:bg-muted/20">
                                <td className="py-3 px-4 text-xs text-foreground pl-8">
                                  {permDesc}
                                </td>
                                {(["admin", "manager", "sales_rep", "loader", "viewer"] as const).map((role: UserRole) => {
                                  const hasPermission = editingRoles[role][perm];
                                  return (
                                    <td key={role} className="text-center py-3 px-4">
                                      <button
                                        onClick={() => togglePermission(role, perm)}
                                        className={cn(
                                          "p-2 rounded transition-colors",
                                          hasPermission
                                            ? "bg-green-100 hover:bg-green-200"
                                            : "bg-gray-100 hover:bg-gray-200"
                                        )}
                                        data-testid={`toggle-permission-${role}-${perm}`}
                                      >
                                        {hasPermission ? (
                                          <Check className="h-4 w-4 text-green-700 mx-auto" />
                                        ) : (
                                          <X className="h-4 w-4 text-gray-400 mx-auto" />
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Read-Only Comparison Table - Admin Only */}
            {isAdmin && !editMode && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Role Permissions Overview</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-semibold">Permission</th>
                        {(["admin", "manager", "sales_rep", "viewer"] as const).map((role) => (
                          <th key={role} className="text-center py-2 px-3 font-semibold">{getRoleLabel(role)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissionGroups.flatMap((group) =>
                        group.permissions.map((perm) => (
                          <tr key={perm} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-3 px-3 text-xs text-muted-foreground">
                              {group.descriptions[perm as keyof typeof group.descriptions] || perm}
                            </td>
                            {(["admin", "manager", "sales_rep", "loader", "viewer"] as const).map((role) => {
                              const roleMatrix = permissionMatrix[role as keyof typeof permissionMatrix];
                              const hasPermission = roleMatrix[perm as keyof typeof roleMatrix];
                              return (
                                <td key={role} className="text-center py-3 px-3">
                                  {hasPermission ? (
                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                  ) : (
                                    <X className="h-4 w-4 text-gray-300 mx-auto" />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
