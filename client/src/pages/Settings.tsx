import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { IntegrationsTab } from "@/components/crm/IntegrationsTab";
import { TemplatesTab } from "@/components/crm/TemplatesTab";
import { ProfessionsTab } from "@/components/crm/ProfessionsTab";
import { FieldSettingsTab } from "@/components/crm/FieldSettingsTab";
import { SecurityTab } from "@/components/crm/SecurityTab";
import { TeamStructureTab } from "@/components/crm/TeamStructureTab";
import { StatusesTab } from "@/components/crm/StatusesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Plug, FileText, Briefcase, Map, Network, CheckCircle } from "lucide-react";

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
            <Tabs defaultValue="statuses" className="space-y-6">
              <TabsList className="bg-card border border-border p-1 w-full flex justify-start overflow-x-auto">
                <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                <TabsTrigger value="statuses" className="gap-2"><CheckCircle className="h-4 w-4" /> Call Statuses</TabsTrigger>
                <TabsTrigger value="team" className="gap-2"><Network className="h-4 w-4" /> Team Structure</TabsTrigger>
                <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
                <TabsTrigger value="field" className="gap-2"><Map className="h-4 w-4" /> Field & Route</TabsTrigger>
                <TabsTrigger value="professions" className="gap-2"><Briefcase className="h-4 w-4" /> Professions</TabsTrigger>
                <TabsTrigger value="templates" className="gap-2"><FileText className="h-4 w-4" /> Templates</TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2"><Plug className="h-4 w-4" /> Integrations</TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
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
                      <Input defaultValue="alex@quantumpunch.com" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statuses">
                <StatusesTab />
              </TabsContent>

              <TabsContent value="team">
                <TeamStructureTab />
              </TabsContent>

              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>

              <TabsContent value="field">
                <FieldSettingsTab />
              </TabsContent>

              <TabsContent value="professions">
                <ProfessionsTab />
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
