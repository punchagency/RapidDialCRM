import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Paperclip, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplate } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { useAuth } from "@/lib/AuthContext";

interface EmailComposerProps {
  recipientEmail: string;
  recipientName: string;
  recipientCompany?: string;
  specialty?: string;
  onSend: () => void;
}

export function EmailComposer({
  recipientEmail,
  recipientName,
  recipientCompany = "their company",
  specialty,
  onSend,
}: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState("none");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getEmailTemplates();
      if (error) throw new Error(error);
      return (data || []) as EmailTemplate[];
    },
    staleTime: 30000,
  });

  // Auto-select template based on specialty
  useEffect(() => {
    if (specialty && templates.length > 0) {
      const defaultTemplate = templates.find((t) => t.specialty === specialty);
      if (defaultTemplate) {
        setTemplateId(defaultTemplate.id);
        applyTemplate(defaultTemplate);

        // Only toast if we haven't already modified the fields manually?
        // For now adhering to original behavior but adding a check to avoid toast spam if it re-runs
        if (templateId === "none") {
          toast({
            title: "Template Auto-Applied",
            description: `Loaded default template for ${specialty}.`,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialty, templates]); // Added templates to dependency

  const applyTemplate = (template: EmailTemplate) => {
    let processedBody = template.body
      .replace("{{firstName}}", recipientName.split(" ")[0])
      .replace("{{lastName}}", recipientName.split(" ")[1] || "")
      .replace("{{company}}", recipientCompany);

    let processedSubject = template.subject
      .replace("{{firstName}}", recipientName.split(" ")[0])
      .replace("{{company}}", recipientCompany);

    setSubject(processedSubject);
    setBody(processedBody);
  };

  const handleTemplateChange = (value: string) => {
    setTemplateId(value);
    if (value === "none") {
      setSubject("");
      setBody("");
      return;
    }

    const selected = templates.find((t) => t.id === value);
    if (selected) {
      applyTemplate(selected);
    }
  };

  const handleSend = async () => {
    if (!subject || !body) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please add a subject and body to your email.",
      });
      return;
    }

    try {
      setIsSending(true);
      const { error } = await CustomServerApi.sendEmail({
        name: user?.name || "Sales Rep",
        to: recipientEmail,
        subject,
        body,
      });

      if (error) throw new Error(error);

      toast({
        title: "Email Sent",
        description: `Sent "${subject}" to ${recipientEmail}`,
      });

      setSubject("");
      setBody("");
      setTemplateId("none");
      onSend();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description:
          error instanceof Error ? error.message : "Could not send email.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select
          value={templateId}
          onValueChange={handleTemplateChange}
          disabled={isLoading || isSending}
        >
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue
              placeholder={isLoading ? "Loading..." : "Load Template..."}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Template</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} {t.specialty ? `(${t.specialty})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {specialty && (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-medium border border-purple-100 ml-auto">
            <Info className="h-3 w-3" />
            Specialty: {specialty}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="font-medium bg-card"
          disabled={isSending}
        />
        <Textarea
          placeholder="Write your email..."
          className="min-h-[200px] resize-none bg-card p-4 font-normal"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSending}
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="icon" disabled={isSending}>
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button onClick={handleSend} className="gap-2" disabled={isSending}>
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </div>
    </div>
  );
}
