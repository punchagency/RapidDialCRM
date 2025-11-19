import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Eye, FileKey, History, AlertTriangle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecurityTab() {
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

       {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-orange-500" />
            <CardTitle>Audit Trail</CardTitle>
          </div>
          <CardDescription>
            Review access logs for compliance and security monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="rounded-md border">
              <div className="p-4 text-sm grid grid-cols-3 font-medium border-b bg-muted/50">
                  <span>Time</span>
                  <span>User</span>
                  <span>Action</span>
              </div>
              <div className="divide-y">
                  <div className="p-4 text-sm grid grid-cols-3">
                      <span className="text-muted-foreground">Today, 10:42 AM</span>
                      <span>Alex Johnson</span>
                      <span>Viewed Contact (Dr. Sarah Jenkins)</span>
                  </div>
                  <div className="p-4 text-sm grid grid-cols-3">
                      <span className="text-muted-foreground">Today, 09:15 AM</span>
                      <span>Alex Johnson</span>
                      <span>Updated Route</span>
                  </div>
                   <div className="p-4 text-sm grid grid-cols-3">
                      <span className="text-muted-foreground">Today, 08:30 AM</span>
                      <span>System</span>
                      <span>Daily Backup Completed</span>
                  </div>
              </div>
           </div>
        </CardContent>
        <CardFooter>
            <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" /> Export Full Audit Log (CSV)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
