import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Eye, FileKey, History, AlertTriangle, Download, Filter, Search, User, Database, Settings, LogIn, LogOut, FileText, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Audit Log Data
const MOCK_LOGS = [
  { id: "log-1", time: "Today, 10:42 AM", user: "Alex Johnson", action: "Viewed Contact", target: "Dr. Sarah Jenkins", type: "access", ip: "192.168.1.42" },
  { id: "log-2", time: "Today, 10:40 AM", user: "Alex Johnson", action: "Updated Contact", target: "Dr. Sarah Jenkins (Notes)", type: "update", ip: "192.168.1.42" },
  { id: "log-3", time: "Today, 10:15 AM", user: "Sarah Miller", action: "Exported Report", target: "Q3 Sales Performance.csv", type: "export", ip: "192.168.1.15" },
  { id: "log-4", time: "Today, 09:30 AM", user: "Mike Field", action: "Route Optimization", target: "North Seattle Territory", type: "system", ip: "10.0.0.5" },
  { id: "log-5", time: "Today, 09:15 AM", user: "Alex Johnson", action: "Updated Route", target: "My Daily Route", type: "update", ip: "192.168.1.42" },
  { id: "log-6", time: "Today, 09:00 AM", user: "Alex Johnson", action: "User Login", target: "Success", type: "auth", ip: "192.168.1.42" },
  { id: "log-7", time: "Today, 08:55 AM", user: "Mike Field", action: "User Login", target: "Success", type: "auth", ip: "10.0.0.5" },
  { id: "log-8", time: "Today, 08:30 AM", user: "System", action: "Daily Backup", target: "Database Snapshot", type: "system", ip: "localhost" },
  { id: "log-9", time: "Yesterday, 5:45 PM", user: "Sarah Miller", action: "User Logout", target: "Manual", type: "auth", ip: "192.168.1.15" },
  { id: "log-10", time: "Yesterday, 4:30 PM", user: "Alex Johnson", action: "Bulk Import", target: "Leads_Nov.csv (45 records)", type: "create", ip: "192.168.1.42" },
  { id: "log-11", time: "Yesterday, 2:15 PM", user: "System", action: "Failed Login Attempt", target: "admin@quantumpunch.com", type: "alert", ip: "45.22.19.112" },
  { id: "log-12", time: "Yesterday, 1:00 PM", user: "Mike Field", action: "Status Change", target: "Dr. Lee (Visit -> Meeting)", type: "update", ip: "10.0.0.5" },
  { id: "log-13", time: "Yesterday, 11:20 AM", user: "Alex Johnson", action: "Viewed Contact", target: "Pacific Dermatology", type: "access", ip: "192.168.1.42" },
  { id: "log-14", time: "Yesterday, 9:00 AM", user: "Sarah Miller", action: "Permission Change", target: "Role: Field Rep (View All -> Territory Only)", type: "security", ip: "192.168.1.15" },
  { id: "log-15", time: "2 days ago, 4:00 PM", user: "System", action: "API Key Rotated", target: "Google Maps Integration", type: "security", ip: "localhost" },
];

export function SecurityTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || log.type === filterType;

    return matchesSearch && matchesType;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "auth": return <LogIn className="h-4 w-4 text-blue-500" />;
      case "access": return <Eye className="h-4 w-4 text-gray-500" />;
      case "update": return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case "create": return <FileText className="h-4 w-4 text-green-500" />;
      case "delete": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "export": return <Download className="h-4 w-4 text-purple-500" />;
      case "security": return <Shield className="h-4 w-4 text-indigo-500" />;
      case "alert": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "system": return <Database className="h-4 w-4 text-slate-500" />;
      default: return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Status Card */}
      <Card className="border-green-200 bg-green-50/30 dark:bg-green-900/10 dark:border-green-900/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-700 dark:text-green-400">HIPAA Compliance Active</CardTitle>
            </div>
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-100 dark:bg-green-900/20">
              Verified
            </Badge>
          </div>
          <CardDescription className="text-green-600/80 dark:text-green-500/80">
            Your environment is configured to handle PHI (Protected Health Information) securely.
            All data is encrypted at rest and in transit (AES-256).
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Audit Logs - Expanded */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Transaction Log</CardTitle>
                <CardDescription>Complete audit trail of all user activity and system events.</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search user, action, or target..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="access">Data Access</SelectItem>
                <SelectItem value="update">Updates & Edits</SelectItem>
                <SelectItem value="export">Exports</SelectItem>
                <SelectItem value="security">Security Admin</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Log Table */}
          <div className="rounded-md border border-border/50 overflow-hidden">
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[150px]">User</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[200px]">Action</TableHead>
                    <TableHead>Target / Details</TableHead>
                    <TableHead className="w-[120px] text-right">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {log.time}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {log.user.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex justify-center" title={log.type}>
                            {getIconForType(log.type)}
                         </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.target}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right font-mono">
                        {log.ip}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No logs found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border/50 flex justify-between text-xs text-muted-foreground py-3">
           <span>Showing {filteredLogs.length} of {MOCK_LOGS.length} events</span>
           <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Immutable Audit Record</span>
        </CardFooter>
      </Card>

      {/* Session Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            <CardTitle>Session & Access Control</CardTitle>
          </div>
          <CardDescription>
            Manage automatic timeouts and authentication requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Logoff Timer</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after a period of inactivity to prevent unauthorized access.
              </p>
            </div>
            <div className="w-[140px]">
              <Select defaultValue="15">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Minutes</SelectItem>
                  <SelectItem value="15">15 Minutes (HIPAA)</SelectItem>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
              <Label className="text-base">Multi-Factor Authentication (MFA)</Label>
              <p className="text-sm text-muted-foreground">
                Require a second form of verification for all logins.
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>
          <p className="text-xs text-muted-foreground italic ml-1">
            * MFA is enforced by organization policy.
          </p>
        </CardContent>
      </Card>

      {/* Data Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            <CardTitle>Data Privacy & PHI Masking</CardTitle>
          </div>
          <CardDescription>
            Control how sensitive patient information is displayed on screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">PHI Masking Mode</Label>
              <p className="text-sm text-muted-foreground">
                Hide patient names and identifiers by default in lists and notes.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Screen Privacy Filter</Label>
              <p className="text-sm text-muted-foreground">
                Blur interface when application loses focus (e.g., switching tabs).
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
