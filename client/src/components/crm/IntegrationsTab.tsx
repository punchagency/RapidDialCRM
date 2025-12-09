import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Link as LinkIcon, ExternalLink, Phone, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function IntegrationsTab() {
  const [quoConnected, setQuoConnected] = useState(false);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGcalLoading, setIsGcalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem("quo_api_key");
    const storedGcal = localStorage.getItem("gcal_connected");
    if (storedKey) {
      setApiKey(storedKey);
      setQuoConnected(true);
    }
    if (storedGcal === "true") {
      setGcalConnected(true);
    }
  }, []);

  const handleConnect = () => {
    if (!apiKey) return;
    setIsLoading(true);
    
    // Simulate API verification delay
    setTimeout(() => {
      localStorage.setItem("quo_api_key", apiKey);
      setQuoConnected(true);
      setIsLoading(false);
      toast({
        title: "Connected to Quo",
        description: "Your API key has been verified and saved securely."
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("quo_api_key");
    setApiKey("");
    setQuoConnected(false);
    toast({
        title: "Disconnected",
        description: "Quo integration has been removed."
    });
  };

  const handleGcalConnect = () => {
    setIsGcalLoading(true);
    setTimeout(() => {
      localStorage.setItem("gcal_connected", "true");
      setGcalConnected(true);
      setIsGcalLoading(false);
      toast({
        title: "Google Calendar Synced",
        description: "Your calendar events will now appear in your schedule."
      });
    }, 1500);
  };

  const handleGcalDisconnect = () => {
    localStorage.removeItem("gcal_connected");
    setGcalConnected(false);
    toast({
      title: "Disconnected",
      description: "Google Calendar sync has been disabled."
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Telephony & Dialer</CardTitle>
            <CardDescription>
              Connect your VoIP provider to enable click-to-dial and automatic call logging.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn(
              "border rounded-xl p-6 transition-all",
              quoConnected ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30" : "bg-card"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                     <Phone className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Quo (OpenPhone)</h3>
                    <p className="text-sm text-muted-foreground">Sync calls, recordings, and transcripts.</p>
                  </div>
                </div>
                {quoConnected && (
                  <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                    <Check className="h-3 w-3" /> Connected
                  </Badge>
                )}
              </div>

              {!quoConnected ? (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="quo-api-key">API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="quo-api-key" 
                        type="password" 
                        placeholder="sk_live_..." 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono"
                      />
                      <Button onClick={handleConnect} disabled={isLoading}>
                        {isLoading ? "Connecting..." : "Connect"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      You can find your API key in Quo Settings {">"} Developer.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-background rounded-lg border">
                      <span className="text-muted-foreground block text-xs mb-1">Status</span>
                      <span className="font-medium text-green-600 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                        Operational
                      </span>
                    </div>
                     <div className="p-3 bg-background rounded-lg border">
                      <span className="text-muted-foreground block text-xs mb-1">Last Sync</span>
                      <span className="font-medium">Just now</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" className="text-muted-foreground" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                    <Button variant="link" size="sm" className="gap-1">
                      Configure Webhooks <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar & Scheduling</CardTitle>
            <CardDescription>
              Sync your calendar to view appointments and prevent double-booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className={cn(
              "border rounded-xl p-6 transition-all",
              gcalConnected ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30" : "bg-card"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border rounded-lg flex items-center justify-center">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="GCal" className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">Sync events, meetings, and reminders.</p>
                  </div>
                </div>
                {gcalConnected ? (
                  <Badge className="bg-blue-600 hover:bg-blue-700 gap-1">
                    <Check className="h-3 w-3" /> Connected
                  </Badge>
                ) : (
                   <Button variant="outline" onClick={handleGcalConnect} disabled={isGcalLoading}>
                     {isGcalLoading ? "Connecting..." : "Connect Google Calendar"}
                   </Button>
                )}
              </div>

              {gcalConnected && (
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-background rounded-lg border">
                      <span className="text-muted-foreground block text-xs mb-1">Calendar</span>
                      <span className="font-medium">alex@quocrm.com</span>
                    </div>
                     <div className="p-3 bg-background rounded-lg border">
                      <span className="text-muted-foreground block text-xs mb-1">Permissions</span>
                      <span className="font-medium">Read & Write</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" className="text-muted-foreground" onClick={handleGcalDisconnect}>
                      Disconnect
                    </Button>
                    <Button variant="link" size="sm" className="gap-1">
                      Sync Settings <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60 grayscale">
          <CardHeader>
            <CardTitle>CRM Sync (Coming Soon)</CardTitle>
            <CardDescription>Two-way sync with Salesforce, HubSpot, or Pipedrive.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="outline" disabled>Connect CRM</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
