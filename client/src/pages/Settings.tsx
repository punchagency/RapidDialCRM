import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { IntegrationsTab } from "@/components/crm/IntegrationsTab";
import { TemplatesTab } from "@/components/crm/TemplatesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Plug, FileText } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Settings</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="integrations" className="space-y-6">
              <TabsList className="bg-card border border-border p-1">
                <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                <TabsTrigger value="templates" className="gap-2"><FileText className="h-4 w-4" /> Templates</TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2"><Plug className="h-4 w-4" /> Integrations</TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your public profile and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Display Name</Label>
                      <Input defaultValue="Alex Johnson" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input defaultValue="alex@quocrm.com" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates">
                <TemplatesTab />
              </TabsContent>

              <TabsContent value="integrations">
                <IntegrationsTab />
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                   <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Email Summary</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Missed Call Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
