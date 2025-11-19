import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Contact, CALL_STATUSES, CallStatus } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, MapPin, Building2, Clock, DollarSign, Stethoscope, History, Check, ArrowRight, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DialerCardProps {
  contact: Contact;
  onComplete: (status: CallStatus, notes: string) => void;
}

export function DialerCard({ contact, onComplete }: DialerCardProps) {
  const [notes, setNotes] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();

  // Simple timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const isBonusUnlocked = timer > 180; // 3 minutes

  const handleCallClick = async () => {
    const apiKey = localStorage.getItem("quo_api_key");
    
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Please configure your Quo API key in Settings > Integrations first.",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate API Handshake
    // In a real app, this would be: await fetch('https://api.openphone.com/v1/calls', { headers: { Authorization: apiKey } })
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
      toast({
        title: "Call Initiated",
        description: `Calling ${contact.phone} via Quo Network...`,
      });
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-140px)]">
      {/* Left Column: Contact Info */}
      <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-2">
        <Card className="border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
           <div className="h-2 bg-primary w-full" />
           <CardContent className="pt-6">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-2xl font-heading font-bold text-foreground">{contact.name}</h2>
                 <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                   <Building2 className="h-4 w-4" />
                   {contact.company}
                 </p>
               </div>
               <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                 {contact.status}
               </Badge>
             </div>

             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 mb-6 relative overflow-hidden">
               {isBonusUnlocked && (
                  <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center z-0 pointer-events-none animate-in fade-in duration-500" />
               )}
               
               <div className="z-10">
                 <div className={cn("text-2xl font-mono font-semibold tracking-tight transition-colors", isBonusUnlocked ? "text-purple-600" : "text-foreground")}>
                   {contact.phone}
                 </div>
                 {isBonusUnlocked && (
                    <div className="text-xs text-purple-600 font-bold flex items-center gap-1 animate-bounce mt-1">
                      <Trophy className="h-3 w-3" /> BONUS UNLOCKED
                    </div>
                 )}
               </div>
               
               {isCallActive ? (
                  <Button 
                    variant="destructive" 
                    size="lg"
                    className="rounded-full px-6 shadow-lg shadow-destructive/20 animate-pulse z-10"
                    onClick={() => setIsCallActive(false)}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    End Call ({formatTime(timer)})
                  </Button>
               ) : (
                 <Button 
                    size="lg" 
                    className="rounded-full px-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-105 z-10"
                    onClick={handleCallClick}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="h-5 w-5 mr-2" />
                        Call with Quo
                      </>
                    )}
                  </Button>
               )}
             </div>

             <div className="space-y-4">
               <InfoItem icon={MapPin} label="Location" value={`${contact.address}, ${contact.zip}`} />
               <InfoItem icon={Clock} label="Timezone" value={contact.timezone} />
               <InfoItem icon={DollarSign} label="Deal Size" value={contact.dealSize || "Unknown"} />
               {contact.drServed && <InfoItem icon={Stethoscope} label="Specialty" value={contact.drServed} />}
             </div>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm flex-1">
          <CardContent className="pt-6">
            <h3 className="font-heading font-semibold flex items-center gap-2 mb-4 text-muted-foreground text-sm uppercase tracking-wider">
              <History className="h-4 w-4" />
              Last Interaction
            </h3>
            <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
              <p className="text-sm text-foreground/80 leading-relaxed">"{contact.lastNotes}"</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Action Area */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <Card className="border-none shadow-md flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex flex-col h-full">
             {/* Tabs / Modes could go here, but we'll focus on Notes + Disposition */}
             <div className="p-6 flex-1 flex flex-col">
                <label className="text-sm font-medium text-muted-foreground mb-2">Call Notes & Enrichment</label>
                <Textarea 
                  placeholder="Type notes while you talk... (Supports markdown shortcuts)" 
                  className="flex-1 resize-none border-border/50 bg-muted/20 text-lg focus:ring-primary/20 p-4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  autoFocus
                />
             </div>
             
             <div className="bg-muted/30 border-t border-border p-6">
               <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
                 Select Outcome to Complete
                 <span className="ml-auto text-xs font-normal text-muted-foreground/70">Press appropriate shortcut key</span>
               </h3>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {CALL_STATUSES.map((status) => (
                   <button
                     key={status.value}
                     onClick={() => onComplete(status.value, notes)}
                     className={cn(
                       "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                       status.color,
                       "bg-opacity-5 hover:bg-opacity-10 bg-card dark:bg-card" // Override transparency for better contrast
                     )}
                   >
                     <status.icon className="h-6 w-6 mb-2 opacity-80" />
                     <span className="text-xs font-semibold text-center">{status.label}</span>
                   </button>
                 ))}
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}
