import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Archive,
  Bookmark,
  Settings,
  Save,
  X,
  Eye,
  Code,
  GitBranch,
  Briefcase,
  Lock,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/UserRoleContext";
import {
  useScripts,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
} from "@/hooks/useScripts";
import { useAllProfessions } from "@/hooks/useUsers";
import type { Script } from "@/lib/types";

interface Branch {
  id: string;
  condition: string;
  action: string;
  content: string;
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
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground mb-6">
              Scripts Management is only available to Administrators. Your
              current role does not have permission to access this page.
            </p>
            <Button onClick={() => setLocation("/")} className="gap-2">
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Fetch scripts and professions from API
  const {
    data: scripts = [],
    isLoading: scriptsLoading,
    refetch: refetchScripts,
  } = useScripts();
  const { data: professions = [], isLoading: professionsLoading } =
    useAllProfessions();
  const createScriptMutation = useCreateScript();
  const updateScriptMutation = useUpdateScript();
  const deleteScriptMutation = useDeleteScript();

  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [fieldsViewScript, setFieldsViewScript] = useState<Script | null>(null); // Script selected in Dynamic Fields tab
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newScript, setNewScript] = useState<Partial<Script>>({
    dynamicFields: [],
    branches: [],
  });
  const [isProfessionOpen, setIsProfessionOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [isAddingField, setIsAddingField] = useState(false);
  const { toast } = useToast();

  // Extract dynamic fields from content using regex {{fieldName}}
  const extractFieldsFromContent = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = content.match(regex);
    if (!matches) return [];
    const fields = matches.map((match) => match.replace(/[{}]/g, ""));
    return Array.from(new Set(fields)); // Remove duplicates
  };

  // Get all unique dynamic fields from all scripts
  const getAllDynamicFields = (): string[] => {
    const allFields = new Set<string>();
    scripts.forEach((script) => {
      if (script.dynamicFields) {
        script.dynamicFields.forEach((field) => allFields.add(field));
      }
      // Also extract from content
      const extracted = extractFieldsFromContent(script.content);
      extracted.forEach((field) => allFields.add(field));
    });
    return Array.from(allFields).sort();
  };

  // Get fields for selected script or all scripts
  const getCurrentFields = (): string[] => {
    // Use fieldsViewScript if set (from Dynamic Fields tab), otherwise use selectedScript
    const scriptToUse = fieldsViewScript || selectedScript;
    if (scriptToUse) {
      const contentFields = extractFieldsFromContent(scriptToUse.content);
      const storedFields = scriptToUse.dynamicFields || [];
      return Array.from(new Set([...contentFields, ...storedFields])).sort();
    }
    return getAllDynamicFields();
  };

  // Update dynamic fields when content changes
  useEffect(() => {
    if (newScript.content) {
      const extracted = extractFieldsFromContent(newScript.content);
      setNewScript((prev) => ({
        ...prev,
        dynamicFields: Array.from(
          new Set([...(prev.dynamicFields || []), ...extracted])
        ),
      }));
    }
  }, [newScript.content]);

  // Add a new dynamic field
  const handleAddField = () => {
    if (!newFieldName.trim()) {
      toast({
        title: "Error",
        description: "Field name is required",
        variant: "destructive",
      });
      return;
    }

    const fieldName = newFieldName.trim().replace(/[{}]/g, "");
    if (!/^\w+$/.test(fieldName)) {
      toast({
        title: "Error",
        description:
          "Field name must contain only letters, numbers, and underscores",
        variant: "destructive",
      });
      return;
    }

    // Use fieldsViewScript if set (from Dynamic Fields tab), otherwise use selectedScript
    const scriptToUpdate = fieldsViewScript || selectedScript;
    if (scriptToUpdate) {
      // Update the selected script
      const currentFields = scriptToUpdate.dynamicFields || [];
      if (currentFields.includes(fieldName)) {
        toast({
          title: "Field exists",
          description: "This field already exists",
          variant: "default",
        });
        return;
      }

      updateScriptMutation.mutate(
        {
          id: scriptToUpdate.id,
          data: {
            dynamicFields: [...currentFields, fieldName],
          },
        },
        {
          onSuccess: async () => {
            toast({
              title: "Field Added",
              description: `Field {{${fieldName}}} has been added.`,
            });
            setNewFieldName("");
            setIsAddingField(false);
            // Refetch scripts to get updated data
            await refetchScripts();
          },
          onError: (error: Error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to add field",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Add to new script being created
      const currentFields = newScript.dynamicFields || [];
      if (currentFields.includes(fieldName)) {
        toast({
          title: "Field exists",
          description: "This field already exists",
          variant: "default",
        });
        return;
      }
      setNewScript((prev) => ({
        ...prev,
        dynamicFields: [...currentFields, fieldName],
      }));
      setNewFieldName("");
      setIsAddingField(false);
      toast({
        title: "Field Added",
        description: `Field {{${fieldName}}} has been added.`,
      });
    }
  };

  // Remove a dynamic field
  const handleRemoveField = (fieldName: string) => {
    // Use fieldsViewScript if set (from Dynamic Fields tab), otherwise use selectedScript
    const scriptToUpdate = fieldsViewScript || selectedScript;
    if (scriptToUpdate) {
      const currentFields = scriptToUpdate.dynamicFields || [];
      updateScriptMutation.mutate(
        {
          id: scriptToUpdate.id,
          data: {
            dynamicFields: currentFields.filter((f) => f !== fieldName),
          },
        },
        {
          onSuccess: async () => {
            toast({
              title: "Field Removed",
              description: `Field {{${fieldName}}} has been removed.`,
            });
            // Refetch scripts to get updated data
            await refetchScripts();
          },
          onError: (error: Error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to remove field",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      const currentFields = newScript.dynamicFields || [];
      setNewScript((prev) => ({
        ...prev,
        dynamicFields: currentFields.filter((f) => f !== fieldName),
      }));
      toast({
        title: "Field Removed",
        description: `Field {{${fieldName}}} has been removed.`,
      });
    }
  };

  // Set first script as selected when scripts load
  useEffect(() => {
    if (scripts.length > 0 && !selectedScript) {
      setSelectedScript(scripts[0]);
    }
  }, [scripts, selectedScript]);

  // Update selectedScript when scripts are refetched (to get latest data)
  useEffect(() => {
    if (selectedScript && scripts.length > 0) {
      const updatedScript = scripts.find((s) => s.id === selectedScript.id);
      if (
        updatedScript &&
        JSON.stringify(updatedScript) !== JSON.stringify(selectedScript)
      ) {
        setSelectedScript(updatedScript);
      }
    }
    // Also update fieldsViewScript
    if (fieldsViewScript && scripts.length > 0) {
      const updatedScript = scripts.find((s) => s.id === fieldsViewScript.id);
      if (
        updatedScript &&
        JSON.stringify(updatedScript) !== JSON.stringify(fieldsViewScript)
      ) {
        setFieldsViewScript(updatedScript);
      }
    }
  }, [scripts, selectedScript, fieldsViewScript]);

  const handleSaveScript = () => {
    if (!newScript.name || !newScript.content) {
      toast({
        title: "Error",
        description: "Script name and content are required",
        variant: "destructive",
      });
      return;
    }

    if (newScript.id) {
      // Update existing script
      updateScriptMutation.mutate(
        {
          id: newScript.id,
          data: {
            name: newScript.name,
            profession: newScript.profession || undefined,
            content: newScript.content,
            dynamicFields: newScript.dynamicFields,
            branches: newScript.branches,
            isPublished: newScript.isPublished,
            isDefault: newScript.isDefault,
          },
        },
        {
          onSuccess: () => {
            toast({
              title: "Script Updated",
              description: `${newScript.name} has been updated.`,
            });
            setIsEditOpen(false);
            setNewScript({ dynamicFields: [], branches: [] });
          },
          onError: (error: Error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update script",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Create new script
      const scriptData: Partial<Script> = {
        name: newScript.name!,
        profession: newScript.profession || undefined,
        content: newScript.content!,
        isPublished: newScript.isPublished || false,
        isDefault: newScript.isDefault || false,
      };

      // Include optional fields if they exist (empty arrays are valid)
      if (newScript.dynamicFields !== undefined) {
        scriptData.dynamicFields = newScript.dynamicFields;
      }
      if (newScript.branches !== undefined) {
        scriptData.branches = newScript.branches;
      }

      createScriptMutation.mutate(scriptData, {
        onSuccess: () => {
          toast({
            title: "Script Created",
            description: `${newScript.name} has been created.`,
          });
          setIsEditOpen(false);
          setNewScript({ dynamicFields: [], branches: [] });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to create script",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleDeleteScript = (id: string) => {
    if (!confirm("Are you sure you want to delete this script?")) {
      return;
    }

    deleteScriptMutation.mutate(id, {
      onSuccess: () => {
        if (selectedScript?.id === id) {
          const remaining = scripts.filter((s) => s.id !== id);
          setSelectedScript(remaining[0] || null);
        }
        toast({
          title: "Script Deleted",
          description: "Script has been removed.",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete script",
          variant: "destructive",
        });
      },
    });
  };

  const handlePublishScript = (id: string) => {
    const script = scripts.find((s) => s.id === id);
    if (!script) return;

    updateScriptMutation.mutate(
      {
        id,
        data: { isPublished: !script.isPublished },
      },
      {
        onSuccess: () => {
          toast({
            title: script.isPublished ? "Unpublished" : "Published",
            description: "Script status updated.",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update script",
            variant: "destructive",
          });
        },
      }
    );
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
          <Tabs
            defaultValue="templates"
            orientation="vertical"
            className="flex h-full"
          >
            <aside className="w-64 border-r border-border bg-white/50 overflow-y-auto shrink-0">
              <div className="p-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                  Management
                </h2>
                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                  {[
                    {
                      value: "templates",
                      icon: FileText,
                      label: "Script Templates",
                    },
                    {
                      value: "professions",
                      icon: Briefcase,
                      label: "Professions",
                    },
                    { value: "fields", icon: Code, label: "Dynamic Fields" },
                    // { value: "branches", icon: GitBranch, label: "Branching Logic" },
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
                      <h2 className="text-lg font-semibold">
                        Script Templates
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Create and manage call scripts for your team.
                      </p>
                    </div>
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="gap-2 bg-pink-500 hover:bg-pink-600"
                          onClick={() =>
                            setNewScript({ dynamicFields: [], branches: [] })
                          }
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
                                onChange={(e) =>
                                  setNewScript({
                                    ...newScript,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="e.g. Initial Outreach"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Profession (Optional)</Label>
                              <Select
                                value={newScript.profession || "general"}
                                onValueChange={(v) =>
                                  setNewScript({
                                    ...newScript,
                                    profession: v === "general" ? undefined : v,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select profession or General" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    General (All Professions)
                                  </SelectItem>
                                  {professionsLoading ? (
                                    <SelectItem value="loading" disabled>
                                      Loading...
                                    </SelectItem>
                                  ) : professions.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                      No professions available
                                    </SelectItem>
                                  ) : (
                                    professions.map((p) => (
                                      <SelectItem key={p} value={p}>
                                        {p}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Select "General" for scripts that work across
                                all professions, or choose a specific
                                profession.
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Script Content (WYSIWYG)</Label>
                              {newScript.dynamicFields &&
                                newScript.dynamicFields.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {newScript.dynamicFields.map((field) => (
                                      <Button
                                        key={field}
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                          const fieldTag = `{{${field}}}`;
                                          const textarea =
                                            document.querySelector(
                                              'textarea[placeholder*="fieldName"]'
                                            ) as HTMLTextAreaElement;
                                          if (textarea) {
                                            const start =
                                              textarea.selectionStart;
                                            const end = textarea.selectionEnd;
                                            const text =
                                              newScript.content || "";
                                            const newText =
                                              text.substring(0, start) +
                                              fieldTag +
                                              text.substring(end);
                                            setNewScript({
                                              ...newScript,
                                              content: newText,
                                            });
                                            // Set cursor position after inserted field
                                            setTimeout(() => {
                                              textarea.focus();
                                              textarea.setSelectionRange(
                                                start + fieldTag.length,
                                                start + fieldTag.length
                                              );
                                            }, 0);
                                          } else {
                                            setNewScript({
                                              ...newScript,
                                              content:
                                                (newScript.content || "") +
                                                fieldTag,
                                            });
                                          }
                                        }}
                                      >
                                        {`{{${field}}}`}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                            </div>
                            <Textarea
                              value={newScript.content || ""}
                              onChange={(e) => {
                                const content = e.target.value;
                                setNewScript({ ...newScript, content });
                                // Auto-extract and update dynamic fields
                                const extracted =
                                  extractFieldsFromContent(content);
                                setNewScript((prev) => ({
                                  ...prev,
                                  content,
                                  dynamicFields: Array.from(
                                    new Set([
                                      ...(prev.dynamicFields || []),
                                      ...extracted,
                                    ])
                                  ),
                                }));
                              }}
                              placeholder="Use {{fieldName}} for dynamic fields..."
                              className="h-32 font-mono text-sm"
                            />

                            {/* Available Standard Variables */}
                            <div className="pt-1">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                Available Prospect Variables
                              </p>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {[
                                  "businessName",
                                  "addressStreet",
                                  "addressCity",
                                  "phoneNumber",
                                  "officeEmail",
                                  "specialty",
                                  "addressState",
                                ].map((field) => (
                                  <button
                                    key={field}
                                    type="button"
                                    onClick={() => {
                                      const fieldTag = `{{${field}}}`;
                                      const textarea = document.querySelector(
                                        'textarea[placeholder*="fieldName"]'
                                      ) as HTMLTextAreaElement;
                                      if (textarea) {
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const text = newScript.content || "";
                                        const newText =
                                          text.substring(0, start) +
                                          fieldTag +
                                          text.substring(end);
                                        setNewScript({
                                          ...newScript,
                                          content: newText,
                                        });
                                        setTimeout(() => {
                                          textarea.focus();
                                          textarea.setSelectionRange(
                                            start + fieldTag.length,
                                            start + fieldTag.length
                                          );
                                        }, 0);
                                      } else {
                                        setNewScript({
                                          ...newScript,
                                          content:
                                            (newScript.content || "") +
                                            fieldTag,
                                        });
                                      }
                                    }}
                                    className="text-[10px] bg-muted/50 hover:bg-muted border px-1.5 py-0.5 rounded text-muted-foreground font-mono transition-colors cursor-pointer"
                                    title="Click to insert"
                                  >
                                    {`{{${field}}}`}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {newScript.content &&
                              extractFieldsFromContent(newScript.content)
                                .length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Detected fields:{" "}
                                  {extractFieldsFromContent(newScript.content)
                                    .map((f) => `{{${f}}}`)
                                    .join(", ")}
                                </div>
                              )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                            disabled={
                              createScriptMutation.isPending ||
                              updateScriptMutation.isPending
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveScript}
                            className="bg-pink-500 hover:bg-pink-600"
                            disabled={
                              createScriptMutation.isPending ||
                              updateScriptMutation.isPending
                            }
                          >
                            {createScriptMutation.isPending ||
                            updateScriptMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" /> Save Script
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {scriptsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : scripts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No scripts found. Create your first script to get
                        started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scripts.map((script) => (
                        <Card
                          key={script.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedScript(script)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">
                                    {script.name}
                                  </h3>
                                  {script.isDefault && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Default
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={
                                      script.isPublished ? "default" : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {script.isPublished ? "Published" : "Draft"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {script.content.substring(0, 80)}...
                                </p>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span>📁 {script.profession}</span>
                                  <span>v{script.version}</span>
                                  <span>
                                    Modified{" "}
                                    {new Date(
                                      script.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishScript(script.id);
                                  }}
                                  disabled={updateScriptMutation.isPending}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewScript({
                                      ...script,
                                      profession:
                                        script.profession || undefined,
                                    });
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteScript(script.id);
                                  }}
                                  disabled={deleteScriptMutation.isPending}
                                >
                                  {deleteScriptMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Professions Tab */}
                <TabsContent value="professions" className="mt-0 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Profession Types
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {
                          "Manage profession categories and assign default scripts. Professions are managed in the Settings page."
                        }
                      </p>
                    </div>
                  </div>

                  {professionsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : professions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No professions found.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {professions.map((prof) => (
                        <Card key={prof}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{prof}</h3>
                              </div>
                              {/* <Button variant="outline" size="sm" className="gap-2">
                                <Settings className="h-4 w-4" /> Configure
                              </Button> */}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Dynamic Fields Tab */}
                <TabsContent value="fields" className="mt-0 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-1">
                          Dynamic Fields
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {fieldsViewScript
                            ? `Fields for "${fieldsViewScript.name}" - Use double curly braces with field names in script content`
                            : "Manage dynamic fields across all scripts. Fields are automatically detected from double curly brace patterns."}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Select
                          value={fieldsViewScript?.id || "all"}
                          onValueChange={(value) => {
                            if (value === "all") {
                              setFieldsViewScript(null);
                            } else {
                              const script = scripts.find(
                                (s) => s.id === value
                              );
                              setFieldsViewScript(script || null);
                            }
                          }}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select script template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Scripts</SelectItem>
                            {scriptsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading scripts...
                              </SelectItem>
                            ) : scripts.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No scripts available
                              </SelectItem>
                            ) : (
                              scripts.map((script) => (
                                <SelectItem key={script.id} value={script.id}>
                                  {script.name}{" "}
                                  {script.profession &&
                                    `(${script.profession})`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Card className="border shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        {isAddingField ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter field name (e.g., firstName)"
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddField();
                                } else if (e.key === "Escape") {
                                  setIsAddingField(false);
                                  setNewFieldName("");
                                }
                              }}
                              autoFocus
                            />
                            <Button onClick={handleAddField} size="sm">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsAddingField(false);
                                setNewFieldName("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full gap-2 border-dashed border-primary/30 text-primary  bg-primary/5 hover:bg-primary/10"
                            onClick={() => setIsAddingField(true)}
                          >
                            <Plus className="h-4 w-4" /> Add Custom Field
                          </Button>
                        )}

                        {getCurrentFields().length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No dynamic fields found.</p>
                            <p className="text-sm mt-2">
                              Add fields using {"{{fieldName}}"} in script
                              content or click "Add Custom Field" above.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getCurrentFields().map((field) => {
                              // Use fieldsViewScript if set, otherwise check all scripts
                              const scriptToCheck =
                                fieldsViewScript || selectedScript;

                              // Check if field is used in content
                              const isUsedInContent = scriptToCheck
                                ? scriptToCheck.content.includes(`{{${field}}}`)
                                : scripts.some((s) =>
                                    s.content.includes(`{{${field}}}`)
                                  );

                              // Check if field is stored in dynamicFields
                              const isStored = scriptToCheck
                                ? scriptToCheck.dynamicFields?.includes(field)
                                : scripts.some((s) =>
                                    s.dynamicFields?.includes(field)
                                  );

                              return (
                                <div
                                  key={field}
                                  className={cn(
                                    "p-4 rounded-lg border transition-all relative group",
                                    isUsedInContent
                                      ? "bg-primary/5 border-primary/20"
                                      : "bg-muted/30 border-border"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1 font-mono">
                                        {`{{${field}}}`}
                                      </p>
                                      <p className="text-sm text-foreground capitalize">
                                        {field
                                          .replace(/([A-Z])/g, " $1")
                                          .trim()}
                                      </p>
                                      <div className="flex gap-2 mt-2">
                                        {isUsedInContent && (
                                          <Badge
                                            variant="default"
                                            className="text-xs"
                                          >
                                            In Use
                                          </Badge>
                                        )}
                                        {isStored && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Stored
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemoveField(field)}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {fieldsViewScript && (
                          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-1">
                              💡 Tip
                            </p>
                            <p className="text-xs text-blue-800">
                              Fields are automatically detected from your script
                              content. Use{" "}
                              <code className="bg-blue-100 px-1 rounded">{`{{fieldName}}`}</code>{" "}
                              in the script content to create dynamic fields.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Branching Logic Tab */}
                <TabsContent value="branches" className="mt-0 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">
                      Branching Logic
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create conditional branches to personalize scripts based
                      on responses.
                    </p>

                    <Card className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50/50 border-2 border-blue-200 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 mb-2">
                              If Prospect Responds:
                            </p>
                            <p className="text-sm text-blue-800">
                              "Interested in a demo"
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <GitBranch className="h-5 w-5 text-muted-foreground rotate-90" />
                          </div>
                          <div className="p-4 bg-green-50/50 border-2 border-green-200 rounded-lg">
                            <p className="text-sm font-semibold text-green-900 mb-2">
                              Then Show:
                            </p>
                            <p className="text-sm text-green-800">
                              "Great! Let me schedule a time that works..."
                            </p>
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
