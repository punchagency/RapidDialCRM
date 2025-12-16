import { useState, useEffect, useCallback, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { CustomServerApi } from "@/integrations/custom-server/api";

export type CallStatus =
  | "idle"
  | "connecting"
  | "ringing"
  | "connected"
  | "disconnected"
  | "error";

interface UseTwilioDeviceOptions {
  identity?: string;
  onIncomingCall?: (call: Call) => void;
  onCallStatusChange?: (status: CallStatus) => void;
}

interface CallInfo {
  callSid: string;
  phoneNumber: string;
  prospectId?: string;
}

export function useTwilioDevice(options: UseTwilioDeviceOptions = {}) {
  const { identity = "crm-user", onIncomingCall, onCallStatusChange } = options;

  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentCallInfo, setCurrentCallInfo] = useState<CallInfo | null>(null);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);

  // Update call status and notify callback
  const updateCallStatus = useCallback(
    (status: CallStatus) => {
      setCallStatus(status);
      onCallStatusChange?.(status);
    },
    [onCallStatusChange]
  );

  // Check Twilio configuration on mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const { data } = await CustomServerApi.getTwilioConfig();
        if (data?.configured) {
          console.log("✓ Twilio Voice configured and ready");
        } else {
          setError(
            "Twilio Voice not configured. Please set TWILIO_TWIML_APP_SID."
          );
          console.error("✗ Twilio Voice not configured");
        }
      } catch (err) {
        console.error("Failed to check Twilio config:", err);
        setError("Failed to check Twilio configuration");
      }
    };

    checkConfig();
  }, []);

  // Initialize device with token
  const initializeDevice = useCallback(async () => {
    try {
      console.log("Fetching Twilio token...");
      const { data } = await CustomServerApi.generateTwilioToken(identity);
      console.log("Token received, creating device...");

      const twilioDevice = new Device(data?.token!, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        logLevel: "error",
      });

      // Device events
      twilioDevice.on("registered", () => {
        console.log("✓ Twilio Device ready");
        setIsReady(true);
        setError(null);
      });

      twilioDevice.on("error", (err) => {
        console.error("✗ Twilio Device error:", err);
        setError(err.message || "Device error");
        updateCallStatus("error");
      });

      twilioDevice.on("incoming", (call: Call) => {
        console.log("Incoming call from:", call.parameters.From);
        setActiveCall(call);
        updateCallStatus("ringing");
        onIncomingCall?.(call);

        // Set up call events for incoming call
        setupCallEvents(call);
      });

      twilioDevice.on("unregistered", () => {
        console.log("Twilio Device unregistered");
        setIsReady(false);
      });

      await twilioDevice.register();
      setDevice(twilioDevice);
    } catch (err) {
      console.error("Failed to initialize Twilio device:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize");
    }
  }, [identity, onIncomingCall, updateCallStatus]);

  // Set up call event handlers
  const setupCallEvents = useCallback(
    (call: Call) => {
      call.on("accept", () => {
        console.log("Call connected");
        setActiveCall(call);
        updateCallStatus("connected");
        callStartTimeRef.current = Date.now();

        // Start duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        durationIntervalRef.current = setInterval(() => {
          if (callStartTimeRef.current) {
            setCallDuration(
              Math.floor((Date.now() - callStartTimeRef.current) / 1000)
            );
          }
        }, 1000);
      });

      call.on("disconnect", () => {
        console.log("Call disconnected");
        handleCallEnd();
      });

      call.on("cancel", () => {
        console.log("Call cancelled");
        setActiveCall(null);
        updateCallStatus("idle");
      });

      call.on("reject", () => {
        console.log("Call rejected");
        setActiveCall(null);
        updateCallStatus("idle");
      });

      call.on("error", (err) => {
        console.error("Call error:", err);
        setError(err.message || "Call error");
        updateCallStatus("error");
      });

      call.on("ringing", () => {
        console.log("Call ringing...");
        updateCallStatus("ringing");
      });
    },
    [updateCallStatus]
  );

  // Handle call end
  const handleCallEnd = useCallback(() => {
    const duration = callStartTimeRef.current
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;

    // Log call if we have call info
    if (currentCallInfo) {
      CustomServerApi.recordCallOutcome(
        currentCallInfo.prospectId || "unknown",
        identity,
        "Call completed",
        `Duration: ${duration}s, CallSid: ${currentCallInfo.callSid}, Phone: ${currentCallInfo.phoneNumber}`
      ).catch((err) => {
        console.error("Failed to log call:", err);
      });
    }

    setActiveCall(null);
    updateCallStatus("disconnected");
    setIsMuted(false);

    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartTimeRef.current = null;
    setCurrentCallInfo(null);

    // Reset to idle after a moment
    setTimeout(() => updateCallStatus("idle"), 2000);
  }, [currentCallInfo, identity, updateCallStatus]);

  // Make outbound call
  const makeCall = useCallback(
    async (
      phoneNumber: string,
      params: { prospectId?: string; callerName?: string } = {}
    ) => {
      if (!device) {
        setError("Device not ready");
        return;
      }

      try {
        updateCallStatus("connecting");
        setError(null);
        setCallDuration(0);

        const connection = await device.connect({
          params: {
            To: phoneNumber,
            ...params,
          },
        });

        setCurrentCallInfo({
          callSid: connection.parameters.CallSid || "",
          phoneNumber,
          prospectId: params.prospectId,
        });

        setActiveCall(connection);
        setupCallEvents(connection);
      } catch (err) {
        console.error("Failed to make call:", err);
        setError(err instanceof Error ? err.message : "Failed to make call");
        updateCallStatus("error");
      }
    },
    [device, setupCallEvents, updateCallStatus]
  );

  // Hang up active call
  const hangUp = useCallback(() => {
    if (activeCall) {
      activeCall.disconnect();
    }
    if (device) {
      device.disconnectAll();
    }
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
    }
  }, [activeCall, callStatus]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (activeCall) {
      const newMuteState = !isMuted;
      activeCall.mute(newMuteState);
      setIsMuted(newMuteState);
    }
  }, [activeCall, isMuted]);

  // Send DTMF digits
  const sendDigits = useCallback(
    (digits: string) => {
      if (activeCall) {
        activeCall.sendDigits(digits);
        console.log("Sent DTMF:", digits);
      }
    },
    [activeCall]
  );

  // Format duration as MM:SS
  const formattedDuration = `${Math.floor(callDuration / 60)
    .toString()
    .padStart(2, "0")}:${(callDuration % 60).toString().padStart(2, "0")}`;

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
    currentCallInfo,
    initializeDevice,
    makeCall,
    hangUp,
    acceptCall,
    rejectCall,
    toggleMute,
    sendDigits,
  };
}
