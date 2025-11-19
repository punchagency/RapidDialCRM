import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailComposerProps {
  recipientEmail: string;
  recipientName: string;
  onSend: () => void;
}

export function EmailComposer({ recipientEmail, recipientName, onSend }: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [template, setTemplate] = useState("none");
  const { toast } = useToast();

  const templates = {
    intro: {
      subject: "Introduction: Quo x " + recipientName,
      body: `Hi ${recipientName.split(" ")[0]},\n\nI noticed your work at your company and wanted to reach out.\n\nWe help teams like yours streamline their sales calls. Would you be open to a 10-minute chat next week?\n\nBest,\nAlex`
    },
    followup: {
      subject: "Following up on our call",
      body: `Hi ${recipientName.split(" ")[0]},\n\nGreat connecting with you just now. As discussed, I'm sending over the brochure we talked about.\n\nLet me know if you have any questions.\n\nBest,\nAlex`
    },
    nurture: {
      subject: "Thought this might be relevant",
      body: `Hi ${recipientName.split(" ")[0]},\n\nSaw this article and thought of your team. Hope things are going well!\n\nBest,\nAlex`
    }
  };

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value !== "none" && templates[value as keyof typeof templates]) {
      setSubject(templates[value as keyof typeof templates].subject);
      setBody(templates[value as keyof typeof templates].body);
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
    setTemplate("none");
    onSend();
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={template} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="Load Template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Template</SelectItem>
            <SelectItem value="intro">Cold Intro</SelectItem>
            <SelectItem value="followup">Post-Call Follow Up</SelectItem>
            <SelectItem value="nurture">Nurture Check-in</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
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
