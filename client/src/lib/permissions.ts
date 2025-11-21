export type UserRole = "admin" | "manager" | "sales_rep" | "viewer" | "loader";

export interface Permission {
  resource: string;
  action: "view" | "create" | "edit" | "delete" | "export";
}

export interface PermissionMatrix {
  dashboard_view: boolean;
  dashboard_view_all?: boolean;
  dashboard_view_own?: boolean;
  contacts_view: boolean;
  contacts_view_all?: boolean;
  contacts_edit: boolean;
  contacts_edit_all?: boolean;
  contacts_delete: boolean;
  contacts_export: boolean;
  dialer_access: boolean;
  scripts_view: boolean;
  scripts_edit: boolean;
  settings_access: boolean;
  settings_users: boolean;
  settings_integrations: boolean;
  settings_scripts_cms: boolean;
  settings_billing: boolean;
  analytics_view: boolean;
  analytics_view_all?: boolean;
  territories_view: boolean;
  territories_view_all?: boolean;
  territories_edit: boolean;
  territories_assign: boolean;
  team_management: boolean;
  audit_logs: boolean;
}

export const permissionMatrix: Record<UserRole, PermissionMatrix> = {
  admin: {
    dashboard_view: true,
    dashboard_view_all: true,
    contacts_view: true,
    contacts_view_all: true,
    contacts_edit: true,
    contacts_edit_all: true,
    contacts_delete: true,
    contacts_export: true,
    dialer_access: true,
    scripts_view: true,
    scripts_edit: true,
    settings_access: true,
    settings_users: true,
    settings_integrations: true,
    settings_scripts_cms: true,
    settings_billing: true,
    analytics_view: true,
    analytics_view_all: true,
    territories_view: true,
    territories_view_all: true,
    territories_edit: true,
    territories_assign: true,
    team_management: true,
    audit_logs: true,
  },
  manager: {
    dashboard_view: true,
    dashboard_view_all: true,
    contacts_view: true,
    contacts_view_all: true,
    contacts_edit: true,
    contacts_edit_all: true,
    contacts_delete: false,
    contacts_export: true,
    dialer_access: true,
    scripts_view: true,
    scripts_edit: false,
    settings_access: true,
    settings_users: false,
    settings_integrations: false,
    settings_scripts_cms: false,
    settings_billing: false,
    analytics_view: true,
    analytics_view_all: true,
    territories_view: true,
    territories_view_all: true,
    territories_edit: false,
    territories_assign: true,
    team_management: true,
    audit_logs: false,
  },
  sales_rep: {
    dashboard_view: true,
    dashboard_view_own: true,
    contacts_view: true,
    contacts_view_all: false,
    contacts_edit: true,
    contacts_edit_all: false,
    contacts_delete: false,
    contacts_export: false,
    dialer_access: true,
    scripts_view: true,
    scripts_edit: false,
    settings_access: false,
    settings_users: false,
    settings_integrations: false,
    settings_scripts_cms: false,
    settings_billing: false,
    analytics_view: true,
    territories_view: true,
    territories_view_all: false,
    territories_edit: false,
    territories_assign: false,
    team_management: false,
    audit_logs: false,
  },
  viewer: {
    dashboard_view: true,
    dashboard_view_own: false,
    contacts_view: true,
    contacts_view_all: true,
    contacts_edit: false,
    contacts_delete: false,
    contacts_export: false,
    dialer_access: false,
    scripts_view: true,
    scripts_edit: false,
    settings_access: false,
    settings_users: false,
    settings_integrations: false,
    settings_scripts_cms: false,
    settings_billing: false,
    analytics_view: true,
    analytics_view_all: true,
    territories_view: true,
    territories_view_all: true,
    territories_edit: false,
    territories_assign: false,
    team_management: false,
    audit_logs: false,
  },
  loader: {
    dashboard_view: true,
    dashboard_view_own: false,
    contacts_view: true,
    contacts_view_all: true,
    contacts_edit: true,
    contacts_edit_all: true,
    contacts_delete: false,
    contacts_export: false,
    dialer_access: false,
    scripts_view: false,
    scripts_edit: false,
    settings_access: false,
    settings_users: false,
    settings_integrations: false,
    settings_scripts_cms: false,
    settings_billing: false,
    analytics_view: false,
    territories_view: true,
    territories_view_all: true,
    territories_edit: false,
    territories_assign: false,
    team_management: false,
    audit_logs: false,
  },
};

export function canAccess(role: UserRole, permission: keyof PermissionMatrix): boolean {
  return permissionMatrix[role]?.[permission] ?? false;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Administrator",
    manager: "Manager",
    sales_rep: "Sales Representative",
    viewer: "Viewer",
    loader: "Data Loader",
  };
  return labels[role];
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-blue-100 text-blue-800",
    sales_rep: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800",
    loader: "bg-purple-100 text-purple-800",
  };
  return colors[role];
}
