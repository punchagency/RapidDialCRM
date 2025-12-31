import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, Loader2 } from "lucide-react";
import { EmailTemplate } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { useAllProfessions } from "@/hooks/useUsers";

export function TemplatesTab() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch professions from API
  const { data: professions = [], isLoading: professionsLoading } =
    useAllProfessions();

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getEmailTemplates();
      if (error) throw new Error(error);
      return (data || []) as EmailTemplate[];
    },
    staleTime: 30000, // 30 seconds
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (template: {
      name: string;
      subject: string;
      body: string;
      specialty?: string;
    }) => {
      const { data, error } = await CustomServerApi.createEmailTemplate(
        template
      );
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast({
        title: "Template Created",
        description: "New template has been added to the library.",
      });
      setEditingId(null);
      setEditForm({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      template,
    }: {
      id: string;
      template: Partial<EmailTemplate>;
    }) => {
      const { data, error } = await CustomServerApi.updateEmailTemplate(
        id,
        template
      );
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast({
        title: "Template Updated",
        description: "Your changes have been saved.",
      });
      setEditingId(null);
      setEditForm({});
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await CustomServerApi.deleteEmailTemplate(id);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast({
        title: "Template Deleted",
        description: "Template removed from library.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (template: EmailTemplate) => {
    setEditingId(template.id);
    setEditForm(template);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = () => {
    if (!editForm.name || !editForm.subject || !editForm.body) {
      toast({
        title: "Validation Error",
        description: "Name, subject, and body are required",
        variant: "destructive",
      });
      return;
    }

    if (editingId === "new") {
      createMutation.mutate({
        name: editForm.name,
        subject: editForm.subject,
        body: editForm.body,
        specialty: editForm.specialty,
      });
    } else if (editingId) {
      updateMutation.mutate({
        id: editingId,
        template: {
          name: editForm.name,
          subject: editForm.subject,
          body: editForm.body,
          specialty: editForm.specialty,
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingId("new");
    setEditForm({ name: "", subject: "", body: "", specialty: "" });
  };

  const isLoading = templatesLoading || professionsLoading;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage standard email responses and specialty-specific defaults.
          </p>
        </div>
        {!editingId && (
          <Button onClick={handleAddNew} className="gap-2" disabled={isLoading}>
            <Plus className="h-4 w-4" /> New Template
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : editingId ? (
        <Card className="border-primary/20 bg-muted/10">
          <CardHeader>
            <CardTitle>
              {editingId === "new" ? "Create New Template" : "Edit Template"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="e.g. Ortho Intro"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label>Default for Specialty (Optional)</Label>
                <Select
                  value={editForm.specialty || "none"}
                  onValueChange={(val) =>
                    setEditForm({
                      ...editForm,
                      specialty: val === "none" ? undefined : val,
                    })
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General)</SelectItem>
                    {professions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={editForm.subject || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, subject: e.target.value })
                }
                placeholder="Subject..."
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                value={editForm.body || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, body: e.target.value })
                }
                placeholder="Hi {{firstName}}..."
                className="min-h-[200px] font-mono text-sm"
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Available variables:{" "}
                {"{{firstName}}, {{lastName}}, {{company}}"}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Template
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No templates found. Create your first template to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card
                key={template.id}
                className="group hover:border-primary/50 transition-colors"
              >
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
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {template.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      disabled={deleteMutation.isPending}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
