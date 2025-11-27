import { useState, useEffect, useCallback, useRef } from "react";

declare global {
  interface Window {
    Twilio: any;
  }
}

export type CallStatus = "idle" | "connecting" | "ringing" | "connected" | "disconnected" | "error";

interface UseTwilioDeviceOptions {
  identity?: string;
  onIncomingCall?: (call: any) => void;
}

export function useTwilioDevice(options: UseTwilioDeviceOptions = {}) {
  const { identity = "crm-user", onIncomingCall } = options;
  
  const [device, setDevice] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  // Load Twilio SDK
  useEffect(() => {
    const loadTwilioSdk = async () => {
      if (window.Twilio?.Device) {
        return; // Already loaded
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://sdk.twilio.com/js/client/v1.14/twilio.min.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Twilio SDK"));
        document.head.appendChild(script);
      });
    };

    loadTwilioSdk()
      .then(() => console.log("Twilio SDK loaded"))
      .catch((err) => setError(err.message));
  }, []);

  // Initialize device with token
  const initializeDevice = useCallback(async () => {
    if (!window.Twilio?.Device) {
      setError("Twilio SDK not loaded");
      return;
    }

    try {
      const response = await fetch("/api/twilio/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity }),
      });

      if (!response.ok) {
        throw new Error("Failed to get Twilio token");
      }

      const { token } = await response.json();
      
      const twilioDevice = new window.Twilio.Device(token, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        enableRingingState: true,
      });

      twilioDevice.on("ready", () => {
        console.log("Twilio Device ready");
        setIsReady(true);
        setError(null);
      });

      twilioDevice.on("error", (err: any) => {
        console.error("Twilio Device error:", err);
        setError(err.message || "Device error");
        setCallStatus("error");
      });

      twilioDevice.on("connect", (conn: any) => {
        console.log("Call connected");
        setActiveCall(conn);
        setCallStatus("connected");
        callStartTimeRef.current = Date.now();
        
        // Start duration timer
        durationIntervalRef.current = setInterval(() => {
          if (callStartTimeRef.current) {
            setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
          }
        }, 1000);
      });

      twilioDevice.on("disconnect", () => {
        console.log("Call disconnected");
        setActiveCall(null);
        setCallStatus("disconnected");
        setIsMuted(false);
        
        // Clear duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        callStartTimeRef.current = null;
        
        // Reset to idle after a moment
        setTimeout(() => setCallStatus("idle"), 2000);
      });

      twilioDevice.on("incoming", (conn: any) => {
        console.log("Incoming call from:", conn.parameters.From);
        setActiveCall(conn);
        setCallStatus("ringing");
        onIncomingCall?.(conn);
      });

      twilioDevice.on("cancel", () => {
        console.log("Call cancelled");
        setActiveCall(null);
        setCallStatus("idle");
      });

      twilioDevice.on("offline", () => {
        console.log("Twilio Device offline");
        setIsReady(false);
      });

      setDevice(twilioDevice);
    } catch (err) {
      console.error("Failed to initialize Twilio device:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize");
    }
  }, [identity, onIncomingCall]);

  // Make outbound call
  const makeCall = useCallback(async (phoneNumber: string, params: Record<string, string> = {}) => {
    if (!device) {
      setError("Device not ready");
      return;
    }

    try {
      setCallStatus("connecting");
      setError(null);
      setCallDuration(0);

      const connection = device.connect({
        To: phoneNumber,
        ...params,
      });

      connection.on("ringing", () => {
        console.log("Call ringing...");
        setCallStatus("ringing");
      });

      setActiveCall(connection);
    } catch (err) {
      console.error("Failed to make call:", err);
      setError(err instanceof Error ? err.message : "Failed to make call");
      setCallStatus("error");
    }
  }, [device]);

  // Hang up active call
  const hangUp = useCallback(() => {
    if (activeCall) {
      activeCall.disconnect();
    }
    if (device) {
      device.disconnectAll();
    }
    setCallStatus("disconnected");
  }, [activeCall, device]);

  // Accept incoming call
  const acceptCall = useCallback(() => {
    if (activeCall && callStatus === "ringing") {
      activeCall.accept();
    }
  }, [activeCall, callStatus]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (activeCall && callStatus === "ringing") {
      activeCall.reject();
      setActiveCall(null);
      setCallStatus("idle");
    }
  }, [activeCall, callStatus]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (activeCall) {
      activeCall.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  }, [activeCall, isMuted]);

  // Send DTMF digits
  const sendDigits = useCallback((digits: string) => {
    if (activeCall) {
      activeCall.sendDigits(digits);
    }
  }, [activeCall]);

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(callDuration / 60).toString().padStart(2, "0")}:${(callDuration % 60).toString().padStart(2, "0")}`;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (device) {
        device.destroy();
      }
    };
  }, [device]);

  return {
    device,
    activeCall,
    callStatus,
    isMuted,
    callDuration,
    formattedDuration,
    error,
    isReady,
    initializeDevice,
    makeCall,
    hangUp,
    acceptCall,
    rejectCall,
    toggleMute,
    sendDigits,
  };
}
