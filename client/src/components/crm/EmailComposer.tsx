import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Paperclip, Sparkles, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MOCK_TEMPLATES, EmailTemplate } from "@/lib/mockData";

interface EmailComposerProps {
  recipientEmail: string;
  recipientName: string;
  recipientCompany?: string;
  specialty?: string;
  onSend: () => void;
}

export function EmailComposer({ recipientEmail, recipientName, recipientCompany = "their company", specialty, onSend }: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState("none");
  const { toast } = useToast();

  // Auto-select template based on specialty
  useEffect(() => {
    if (specialty) {
      const defaultTemplate = MOCK_TEMPLATES.find(t => t.specialty === specialty);
      if (defaultTemplate) {
        setTemplateId(defaultTemplate.id);
        applyTemplate(defaultTemplate);
        toast({
            title: "Template Auto-Applied",
            description: `Loaded default template for ${specialty}.`
        });
      }
    }
  }, [specialty]);

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

    const selected = MOCK_TEMPLATES.find(t => t.id === value);
    if (selected) {
        applyTemplate(selected);
    }
  };

  const handleSend = () => {
    if (!subject || !body) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please add a subject and body to your email."
      });
      return;
    }

    toast({
      title: "Email Sent",
      description: `Sent "${subject}" to ${recipientEmail}`
    });
    
    setSubject("");
    setBody("");
    setTemplateId("none");
    onSend();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={templateId} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="Load Template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Template</SelectItem>
            {MOCK_TEMPLATES.map(t => (
                <SelectItem key={t.id} value={t.id}>
                    {t.name} {t.specialty ? `(${t.specialty})` : ""}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {specialty && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-medium border border-purple-100">
                <Info className="h-3 w-3" />
                Specialty: {specialty}
            </div>
        )}

        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 ml-auto">
          <Sparkles className="h-3 w-3" /> AI Assist
        </Button>
      </div>

      <div className="space-y-2">
        <Input 
          placeholder="Subject" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="font-medium bg-card"
        />
        <Textarea 
          placeholder="Write your email..." 
          className="min-h-[200px] resize-none bg-card p-4 font-normal"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button onClick={handleSend} className="gap-2">
          <Send className="h-4 w-4" /> Send Email
        </Button>
      </div>
    </div>
  );
}
