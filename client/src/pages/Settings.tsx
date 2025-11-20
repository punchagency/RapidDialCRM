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
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Plug, FileText, Briefcase, Map, Network, CheckCircle } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-white z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Settings</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="statuses" className="space-y-6">
              <div className="border-b border-border mb-6">
                <TabsList className="bg-transparent h-12 p-0 w-full flex justify-start overflow-x-auto gap-6">
                  <TabsTrigger 
                    value="profile" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <User className="h-4 w-4" /> Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="statuses" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <CheckCircle className="h-4 w-4" /> Call Statuses
                  </TabsTrigger>
                  <TabsTrigger 
                    value="team" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <Network className="h-4 w-4" /> Team Structure
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <Shield className="h-4 w-4" /> Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="field" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <Map className="h-4 w-4" /> Field & Route
                  </TabsTrigger>
                  <TabsTrigger 
                    value="professions" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <Briefcase className="h-4 w-4" /> Professions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="templates" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <FileText className="h-4 w-4" /> Templates
                  </TabsTrigger>
                  <TabsTrigger 
                    value="integrations" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <Plug className="h-4 w-4" /> Integrations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="gap-2 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-pink-500 data-[state=active]:text-pink-600 data-[state=active]:shadow-none px-1"
                  >
                    <Bell className="h-4 w-4" /> Notifications
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="mt-0">
                <Card className="border-none shadow-sm">
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

              <TabsContent value="statuses" className="mt-0">
                <StatusesTab />
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
              
              <TabsContent value="notifications" className="mt-0">
                <Card className="border-none shadow-sm">
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
