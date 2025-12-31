import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoogleCalendarCallback() {
 const [location, setLocation] = useLocation();
 const { toast } = useToast();
 const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
 const [message, setMessage] = useState("Processing authorization...");

 useEffect(() => {
  const handleCallback = async () => {
   try {
    // Extract code and error from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");

    if (error) {
     setStatus("error");
     setMessage(`Authorization failed: ${error}`);
     toast({
      title: "Authorization Failed",
      description: error,
      variant: "destructive",
     });

     // Close window if opened as popup, or redirect
     if (window.opener) {
      window.close();
     } else {
      setTimeout(() => setLocation("/calendar"), 2000);
     }
     return;
    }

    if (!code) {
     setStatus("error");
     setMessage("No authorization code received");
     toast({
      title: "Authorization Failed",
      description: "No authorization code received from Google",
      variant: "destructive",
     });

     if (window.opener) {
      window.close();
     } else {
      setTimeout(() => setLocation("/calendar"), 2000);
     }
     return;
    }

    // Exchange code for tokens
    const { data: tokenData, error: tokenError } = await CustomServerApi.getCalendarTokens(code);

    if (tokenError || !tokenData) {
     throw new Error(tokenError || "Failed to get tokens");
    }

    // Store tokens
    localStorage.setItem("gcal_access_token", tokenData.accessToken);
    if (tokenData.refreshToken) {
     localStorage.setItem("gcal_refresh_token", tokenData.refreshToken);
    }
    localStorage.setItem("gcal_connected", "true");

    setStatus("success");
    setMessage("Google Calendar connected successfully!");

    toast({
     title: "Connected",
     description: "Google Calendar has been connected successfully.",
    });

    // If opened as popup, send message to parent window
    if (window.opener) {
     window.opener.postMessage(
      {
       type: "GOOGLE_CALENDAR_AUTH_SUCCESS",
       accessToken: tokenData.accessToken,
       refreshToken: tokenData.refreshToken,
      },
      window.location.origin
     );
     // Close popup after a short delay
     setTimeout(() => {
      window.close();
     }, 1500);
    } else {
     // If not a popup, redirect to calendar page
     setTimeout(() => {
      setLocation("/calendar");
     }, 1500);
    }
   } catch (error) {
    console.error("Callback error:", error);
    setStatus("error");
    setMessage(error instanceof Error ? error.message : "Failed to complete authorization");

    toast({
     title: "Authorization Failed",
     description: error instanceof Error ? error.message : "Unable to complete authorization",
     variant: "destructive",
    });

    if (window.opener) {
     window.close();
    } else {
     setTimeout(() => setLocation("/calendar"), 2000);
    }
   }
  };

  handleCallback();
 }, [setLocation, toast]);

 return (
  <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
   <Card className="w-full max-w-md">
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      {status === "processing" && <Loader2 className="h-5 w-5 animate-spin" />}
      {status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
      {status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
      Google Calendar Authorization
     </CardTitle>
     <CardDescription>{message}</CardDescription>
    </CardHeader>
    <CardContent>
     {status === "processing" && (
      <div className="space-y-2">
       <p className="text-sm text-muted-foreground">
        Please wait while we complete the authorization...
       </p>
      </div>
     )}
     {status === "success" && (
      <div className="space-y-2">
       <p className="text-sm text-green-600">
        Success! You can close this window.
       </p>
      </div>
     )}
     {status === "error" && (
      <div className="space-y-2">
       <p className="text-sm text-red-600">
        {message}
       </p>
       <p className="text-xs text-muted-foreground">
        You will be redirected shortly...
       </p>
      </div>
     )}
    </CardContent>
   </Card>
  </div>
 );
}

