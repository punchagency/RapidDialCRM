import React, { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Edit2, Trash2, Copy, Archive, Bookmark, Settings, Save, X, Eye, Code, GitBranch, Briefcase, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/UserRoleContext";

interface Script {
  id: string;
  name: string;
  profession: string;
  content: string;
  dynamicFields: string[];
  branches: Branch[];
  version: number;
  lastModified: string;
  isPublished: boolean;
  isDefault: boolean;
}

interface Branch {
  id: string;
  condition: string;
  action: string;
  content: string;
}

interface Profession {
  id: string;
  name: string;
  description: string;
  defaultScriptId?: string;
}

export default function ScriptsManagement() {
  const { canAccess } = useUserRole();
  const [, setLocation] = useLocation();

  // Only admins can access this page
  if (!canAccess("scripts_edit")) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center max-w-md">
            <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">Scripts Management is only available to Administrators. Your current role does not have permission to access this page.</p>
            <Button onClick={() => setLocation("/")} className="gap-2">
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const [scripts, setScripts] = useState<Script[]>([
    {
      id: "1",
      name: "Initial Outreach",
      profession: "Healthcare",
      content: "Hi {{firstName}}, this is Alex from QuantumPunch. We work with {{company}} to streamline scheduling...",
      dynamicFields: ["firstName", "company", "specialty"],
      branches: [],
      version: 1,
      lastModified: "2025-11-19",
      isPublished: true,
      isDefault: true,
    },
  ]);

  const [professions, setProfessions] = useState<Profession[]>([
    { id: "1", name: "Healthcare", description: "Medical practices and providers", defaultScriptId: "1" },
    { id: "2", name: "Legal", description: "Law firms and attorneys" },
    { id: "3", name: "Finance", description: "Financial institutions" },
  ]);

  const [selectedScript, setSelectedScript] = useState<Script | null>(scripts[0]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newScript, setNewScript] = useState<Partial<Script>>({ dynamicFields: [], branches: [] });
  const [newProfession, setNewProfession] = useState<Partial<Profession>>({});
  const [isProfessionOpen, setIsProfessionOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSaveScript = () => {
    if (!newScript.name) {
      toast({ title: "Error", description: "Script name is required", variant: "destructive" });
      return;
    }
    
    const script: Script = {
      id: newScript.id || `script-${Date.now()}`,
      name: newScript.name || "",
      profession: newScript.profession || "Healthcare",
      content: newScript.content || "",
      dynamicFields: newScript.dynamicFields || [],
      branches: newScript.branches || [],
      version: (newScript.version || 0) + 1,
      lastModified: new Date().toISOString().split("T")[0],
      isPublished: newScript.isPublished || false,
      isDefault: newScript.isDefault || false,
    };

    if (newScript.id) {
      setScripts(scripts.map(s => s.id === newScript.id ? script : s));
      toast({ title: "Script Updated", description: `${script.name} has been updated.` });
    } else {
      setScripts([...scripts, script]);
      toast({ title: "Script Created", description: `${script.name} has been created.` });
    }

    setIsEditOpen(false);
    setNewScript({ dynamicFields: [], branches: [] });
  };

  const handleAddProfession = () => {
    if (!newProfession.name) {
      toast({ title: "Error", description: "Profession name is required", variant: "destructive" });
      return;
    }

    const profession: Profession = {
      id: `prof-${Date.now()}`,
      name: newProfession.name || "",
      description: newProfession.description || "",
    };

    setProfessions([...professions, profession]);
    toast({ title: "Profession Added", description: `${profession.name} has been added.` });
    setIsProfessionOpen(false);
    setNewProfession({});
  };

  const handleDeleteScript = (id: string) => {
    setScripts(scripts.filter(s => s.id !== id));
    if (selectedScript?.id === id) {
      setSelectedScript(scripts.find(s => s.id !== id) || null);
    }
    toast({ title: "Script Deleted", description: "Script has been removed." });
  };

  const handlePublishScript = (id: string) => {
    setScripts(scripts.map(s => 
      s.id === id ? { ...s, isPublished: !s.isPublished } : s
    ));
    toast({ title: selectedScript?.isPublished ? "Unpublished" : "Published", description: "Script status updated." });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-muted/10">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <h1 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Scripts Management
          </h1>
        </header>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="templates" orientation="vertical" className="flex h-full">
            <aside className="w-64 border-r border-border bg-white/50 overflow-y-auto shrink-0">
              <div className="p-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Management</h2>
                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                  {[
                    { value: "templates", icon: FileText, label: "Script Templates" },
                    { value: "professions", icon: Briefcase, label: "Professions" },
                    { value: "fields", icon: Code, label: "Dynamic Fields" },
                    { value: "branches", icon: GitBranch, label: "Branching Logic" },
                  ].map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                        "data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
                        "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50",
                        "border-none"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </aside>

            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              <div className="max-w-5xl mx-auto p-8">
                {/* Templates Tab */}
                <TabsContent value="templates" className="mt-0 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Script Templates</h2>
                      <p className="text-sm text-muted-foreground">Create and manage call scripts for your team.</p>
                    </div>
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="gap-2 bg-pink-500 hover:bg-pink-600" 
                          onClick={() => setNewScript({ dynamicFields: [], branches: [] })}
                        >
                          <Plus className="h-4 w-4" /> New Script
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Script Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Script Name</Label>
                              <Input 
                                value={newScript.name || ""}
                                onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                                placeholder="e.g. Initial Outreach"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Profession</Label>
                              <Select value={newScript.profession || "Healthcare"} onValueChange={(v) => setNewScript({ ...newScript, profession: v })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {professions.map((p) => (
                                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Script Content (WYSIWYG)</Label>
                            <Textarea 
                              value={newScript.content || ""}
                              onChange={(e) => setNewScript({ ...newScript, content: e.target.value })}
                              placeholder='Use {{fieldName}} for dynamic fields...'
                              className="h-32"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                          <Button onClick={handleSaveScript} className="bg-pink-500 hover:bg-pink-600">
                            <Save className="h-4 w-4 mr-2" /> Save Script
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {scripts.map((script) => (
                      <Card key={script.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedScript(script)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{script.name}</h3>
                                {script.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                                <Badge variant={script.isPublished ? "default" : "outline"} className="text-xs">
                                  {script.isPublished ? "Published" : "Draft"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{script.content.substring(0, 80)}...</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>📁 {script.profession}</span>
                                <span>v{script.version}</span>
                                <span>Modified {script.lastModified}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handlePublishScript(script.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setNewScript(script);
                                  setIsEditOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteScript(script.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Professions Tab */}
                <TabsContent value="professions" className="mt-0 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Profession Types</h2>
                      <p className="text-sm text-muted-foreground">Manage profession categories and assign default scripts.</p>
                    </div>
                    <Dialog open={isProfessionOpen} onOpenChange={setIsProfessionOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-pink-500 hover:bg-pink-600">
                          <Plus className="h-4 w-4" /> New Profession
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Profession Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Profession Name</Label>
                            <Input 
                              value={newProfession.name || ""}
                              onChange={(e) => setNewProfession({ ...newProfession, name: e.target.value })}
                              placeholder="e.g. Veterinary Clinic"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                              value={newProfession.description || ""}
                              onChange={(e) => setNewProfession({ ...newProfession, description: e.target.value })}
                              placeholder="Brief description..."
                              className="h-20"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsProfessionOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddProfession} className="bg-pink-500 hover:bg-pink-600">Add Profession</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-3">
                    {professions.map((prof) => (
                      <Card key={prof.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{prof.name}</h3>
                              <p className="text-sm text-muted-foreground">{prof.description}</p>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Settings className="h-4 w-4" /> Configure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Dynamic Fields Tab */}
                <TabsContent value="fields" className="mt-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Dynamic Fields</h2>
                    <p className="text-sm text-muted-foreground mb-6">Create custom fields to personalize scripts with contact data.</p>
                    
                    <Card className="border shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{`{{firstName}}`}</p>
                            <p className="text-sm text-foreground">Contact first name</p>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{`{{company}}`}</p>
                            <p className="text-sm text-foreground">Company name</p>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{`{{specialty}}`}</p>
                            <p className="text-sm text-foreground">Medical specialty/profession</p>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">{`{{dealSize}}`}</p>
                            <p className="text-sm text-foreground">Deal size or budget</p>
                          </div>
                        </div>
                        <Button className="w-full gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/5">
                          <Plus className="h-4 w-4" /> Add Custom Field
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Branching Logic Tab */}
                <TabsContent value="branches" className="mt-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Branching Logic</h2>
                    <p className="text-sm text-muted-foreground mb-6">Create conditional branches to personalize scripts based on responses.</p>
                    
                    <Card className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50/50 border-2 border-blue-200 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 mb-2">If Prospect Responds:</p>
                            <p className="text-sm text-blue-800">"Interested in a demo"</p>
                          </div>
                          <div className="flex justify-center">
                            <GitBranch className="h-5 w-5 text-muted-foreground rotate-90" />
                          </div>
                          <div className="p-4 bg-green-50/50 border-2 border-green-200 rounded-lg">
                            <p className="text-sm font-semibold text-green-900 mb-2">Then Show:</p>
                            <p className="text-sm text-green-800">"Great! Let me schedule a time that works..."</p>
                          </div>
                          <Button className="w-full gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/5">
                            <Plus className="h-4 w-4" /> Add Branch
                          </Button>
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
