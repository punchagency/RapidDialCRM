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
  const [recipients, setRecipients] = useState<string[]>([recipientEmail]);
  const [inputValue, setInputValue] = useState("");
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

        if (templateId === "none") {
          toast({
            title: "Template Auto-Applied",
            description: `Loaded default template for ${specialty}.`,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialty, templates]);

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

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab"].includes(e.key)) {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      if (trimmedInput && isValidEmail(trimmedInput)) {
        if (!recipients.includes(trimmedInput)) {
          setRecipients([...recipients, trimmedInput]);
        }
        setInputValue("");
      } else if (trimmedInput) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Please enter a valid email address.",
        });
      }
    } else if (e.key === "Backspace" && !inputValue && recipients.length > 0) {
      setRecipients(recipients.slice(0, -1));
    }
  };

  const handleBlur = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && isValidEmail(trimmedInput)) {
      if (!recipients.includes(trimmedInput)) {
        setRecipients([...recipients, trimmedInput]);
      }
      setInputValue("");
    }
  };

  const removeRecipient = (emailToRemove: string) => {
    setRecipients(recipients.filter((email) => email !== emailToRemove));
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

    if (recipients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Recipients",
        description: "Please add at least one recipient.",
      });
      return;
    }

    try {
      setIsSending(true);
      // NOTE: Backend only supports sending to one recipient for now.
      // We will only use the first one in the list.
      const primaryRecipient = recipients[0];

      const { error } = await CustomServerApi.sendEmail({
        name: user?.name || "Sales Rep",
        to: primaryRecipient,
        subject,
        body,
      });

      if (error) throw new Error(error);

      toast({
        title: "Email Sent",
        description: `Sent "${subject}" to ${primaryRecipient}`,
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
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-background border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
          {recipients.map((email) => (
            <div
              key={email}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {email}
              <button
                type="button"
                onClick={() => removeRecipient(email)}
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <div className="h-3 w-3 flex items-center justify-center">
                  <span className="sr-only">Remove</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </div>
              </button>
            </div>
          ))}
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm min-w-[120px] placeholder:text-muted-foreground"
            placeholder={
              recipients.length === 0 ? "Enter email addresses..." : ""
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={isSending}
          />
        </div>

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
