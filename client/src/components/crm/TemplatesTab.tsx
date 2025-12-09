import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save } from "lucide-react";
import { MOCK_TEMPLATES, EmailTemplate, DEFAULT_PROFESSIONS } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export function TemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});
  const [professions, setProfessions] = useState<string[]>(DEFAULT_PROFESSIONS);
  const { toast } = useToast();

  // Load professions from local storage to stay in sync
  useEffect(() => {
    const stored = localStorage.getItem("crm_professions");
    if (stored) {
        setProfessions(JSON.parse(stored));
    }
  }, [editingId]); // Reload when entering edit mode

  const handleEdit = (template: EmailTemplate) => {
    setEditingId(template.id);
    setEditForm(template);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.subject || !editForm.body) return;

    if (editingId === "new") {
        const newTemplate: EmailTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            name: editForm.name!,
            subject: editForm.subject!,
            body: editForm.body!,
            specialty: editForm.specialty
        };
        setTemplates([...templates, newTemplate]);
        toast({ title: "Template Created", description: "New template has been added to the library." });
    } else {
        setTemplates(templates.map(t => t.id === editingId ? { ...t, ...editForm } as EmailTemplate : t));
        toast({ title: "Template Updated", description: "Your changes have been saved." });
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({ title: "Template Deleted", description: "Template removed from library." });
  };

  const handleAddNew = () => {
      setEditingId("new");
      setEditForm({ name: "", subject: "", body: "", specialty: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-medium">Email Templates</h3>
           <p className="text-sm text-muted-foreground">Manage standard email responses and specialty-specific defaults.</p>
        </div>
        {!editingId && (
            <Button onClick={handleAddNew} className="gap-2">
                <Plus className="h-4 w-4" /> New Template
            </Button>
        )}
      </div>

      {editingId ? (
        <Card className="border-primary/20 bg-muted/10">
            <CardHeader>
                <CardTitle>{editingId === "new" ? "Create New Template" : "Edit Template"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input 
                            value={editForm.name || ""} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            placeholder="e.g. Ortho Intro"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Default for Specialty (Optional)</Label>
                         <Select 
                            value={editForm.specialty || "none"} 
                            onValueChange={val => setEditForm({...editForm, specialty: val === "none" ? undefined : val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Specialty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (General)</SelectItem>
                                {professions.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input 
                        value={editForm.subject || ""} 
                        onChange={e => setEditForm({...editForm, subject: e.target.value})}
                        placeholder="Subject..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea 
                        value={editForm.body || ""} 
                        onChange={e => setEditForm({...editForm, body: e.target.value})}
                        placeholder="Hi {{firstName}}..."
                        className="min-h-[200px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Available variables: {"{{firstName}}, {{lastName}}, {{company}}"}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Template</Button>
                </div>
            </CardContent>
        </Card>
      ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
                <Card key={template.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{template.name}</h4>
                                {template.specialty && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 uppercase tracking-wide">
                                        {template.specialty} Default
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-md">{template.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                                <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
      )}
    </div>
  );
}

