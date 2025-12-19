import { useState, useEffect, useCallback, useRef } from "react";
import {
  Room,
  RoomEvent,
  Track,
  LocalParticipant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  ConnectionState,
  DisconnectReason,
} from "livekit-client";
import { getAuthHeaders, resolveApiUrl } from "@/services/http";

export type CallStatus =
  | "idle"
  | "connecting"
  | "ringing"
  | "connected"
  | "disconnected"
  | "error";

interface UseLiveKitDeviceOptions {
  identity?: string;
  onCallStatusChange?: (status: CallStatus) => void;
}

interface CallInfo {
  roomName: string;
  phoneNumber: string;
  prospectId?: string;
}

export function useLiveKitDevice(options: UseLiveKitDeviceOptions = {}) {
  const { identity = "crm-user", onCallStatusChange } = options;

  const [room, setRoom] = useState<Room | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [livekitUrl, setLivekitUrl] = useState<string>("");
  const [currentCallInfo, setCurrentCallInfo] = useState<CallInfo | null>(null);

  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);

  const updateCallStatus = useCallback(
    (status: CallStatus) => {
      setCallStatus(status);
      onCallStatusChange?.(status);
    },
    [onCallStatusChange]
  );

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch(resolveApiUrl("/api/livekit/config"), {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        if (response.ok) {
          const config = await response.json();
          if (config.configured) {
            setLivekitUrl(config.url);
            setIsReady(true);
            setError(null);
          } else {
            setError(
              "LiveKit not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET."
            );
            setIsReady(false);
          }
        }
      } catch (err) {
        console.error("Failed to check LiveKit config:", err);
        setError("Failed to check LiveKit configuration");
        setIsReady(false);
      }
    };

    checkConfig();
  }, []);

  const initializeDevice = useCallback(async () => {
    const response = await fetch(resolveApiUrl("/api/livekit/config"), {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (response.ok) {
      const config = await response.json();
      if (config.configured) {
        setLivekitUrl(config.url);
        setIsReady(true);
        setError(null);
        console.log("✓ LiveKit configured and ready");
      } else {
        const errorMsg = "LiveKit credentials not configured";
        setError(errorMsg);
        setIsReady(false);
        console.error("✗", errorMsg);
      }
    }
  }, []);

  const handleTrackSubscribed = useCallback(
    (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Audio) {
        const audioElement = track.attach();
        audioElement.id = `audio-${participant.identity}-${track.sid}`;
        document.body.appendChild(audioElement);
        audioElementsRef.current.push(audioElement);
        console.log("Audio track subscribed from:", participant.identity);
      }
    },
    []
  );

  const handleTrackUnsubscribed = useCallback(
    (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      track.detach().forEach((element) => {
        element.remove();
        audioElementsRef.current = audioElementsRef.current.filter(
          (el) => el !== element
        );
      });
      console.log("Audio track unsubscribed from:", participant.identity);
    },
    []
  );

  const handleDisconnect = useCallback(
    (reason?: DisconnectReason) => {
      console.log("Disconnected from room:", reason);
      updateCallStatus("disconnected");
      setIsMuted(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      callStartTimeRef.current = null;

      audioElementsRef.current.forEach((el) => el.remove());
      audioElementsRef.current = [];

      setTimeout(() => updateCallStatus("idle"), 2000);
    },
    [updateCallStatus]
  );

  const handleConnectionStateChange = useCallback(
    (state: ConnectionState) => {
      console.log("Connection state changed:", state);

      switch (state) {
        case ConnectionState.Connecting:
          updateCallStatus("connecting");
          break;
        case ConnectionState.Connected:
          updateCallStatus("connected");

          // Clear any existing interval before starting a new one
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }

          callStartTimeRef.current = Date.now();
          durationIntervalRef.current = setInterval(() => {
            if (callStartTimeRef.current) {
              setCallDuration(
                Math.floor((Date.now() - callStartTimeRef.current) / 1000)
              );
            }
          }, 1000);
          break;
        case ConnectionState.Disconnected:
          handleDisconnect();
          break;
        case ConnectionState.Reconnecting:
          console.log("Reconnecting...");
          break;
      }
    },
    [updateCallStatus, handleDisconnect]
  );

  const makeCall = useCallback(
    async (
      phoneNumber: string,
      params: { prospectId?: string; callerName?: string } = {}
    ) => {
      if (!isReady || !livekitUrl) {
        setError("LiveKit not ready");
        return;
      }

      try {
        updateCallStatus("connecting");
        setError(null);
        setCallDuration(0);

        const response = await fetch(resolveApiUrl("/api/livekit/call"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          credentials: "include",
          body: JSON.stringify({
            callerId: identity,
            callerName: params.callerName || identity,
            phoneNumber,
            prospectId: params.prospectId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initiate call");
        }

        const { roomName, token, url } = await response.json();

        setCurrentCallInfo({
          roomName,
          phoneNumber,
          prospectId: params.prospectId,
        });

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        newRoom
          .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
          .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
          .on(RoomEvent.Disconnected, handleDisconnect)
          .on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange)
          .on(RoomEvent.AudioPlaybackStatusChanged, () => {
            if (!newRoom.canPlaybackAudio) {
              console.warn("Audio playback blocked - user interaction needed");
            }
          });

        await newRoom.connect(url || livekitUrl, token);
        await newRoom.localParticipant.setMicrophoneEnabled(true);

        setRoom(newRoom);
        console.log("✓ Connected to LiveKit room:", roomName);
      } catch (err) {
        console.error("Failed to make call:", err);
        setError(err instanceof Error ? err.message : "Failed to make call");
        updateCallStatus("error");
      }
    },
    [
      isReady,
      livekitUrl,
      identity,
      handleTrackSubscribed,
      handleTrackUnsubscribed,
      handleDisconnect,
      handleConnectionStateChange,
      updateCallStatus,
    ]
  );

  const hangUp = useCallback(async () => {
    if (room) {
      const duration = callStartTimeRef.current
        ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        : 0;

      if (currentCallInfo) {
        try {
          await fetch(resolveApiUrl("/api/livekit/end-call"), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            credentials: "include",
            body: JSON.stringify({
              roomName: currentCallInfo.roomName,
              prospectId: currentCallInfo.prospectId,
              callerId: identity,
              duration,
            }),
          });
        } catch (err) {
          console.error("Failed to record call end:", err);
        }
      }

      await room.disconnect();
      setRoom(null);
    }
    updateCallStatus("disconnected");
    setCurrentCallInfo(null);
  }, [room, currentCallInfo, identity, updateCallStatus]);

  const toggleMute = useCallback(async () => {
    if (room?.localParticipant) {
      const newMuteState = !isMuted;
      await room.localParticipant.setMicrophoneEnabled(!newMuteState);
      setIsMuted(newMuteState);
    }
  }, [room, isMuted]);

  const sendDigits = useCallback(
    async (digits: string) => {
      if (room?.localParticipant) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({ type: "dtmf", digits }));
        await room.localParticipant.publishData(data, { reliable: true });
        console.log("Sent DTMF:", digits);
      }
    },
    [room]
  );

  const startAudio = useCallback(async () => {
    if (room) {
      await room.startAudio();
    }
  }, [room]);

  const formattedDuration = `${Math.floor(callDuration / 60)
    .toString()
    .padStart(2, "0")}:${(callDuration % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (room) {
        room.disconnect();
      }
      audioElementsRef.current.forEach((el) => el.remove());
    };
  }, [room]);

  return {
    room,
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
    toggleMute,
    sendDigits,
    startAudio,
  };
}
