import React, { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ThumbsUp,
  ThumbsDown,
  Star,
  Award,
  Clock,
  Trophy,
  Volume2,
  Loader2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import avatar from "@/assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import { CustomServerApi } from "@/integrations/custom-server/api";
import type { CallHistory } from "@/lib/types";

export default function CallReview() {
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [points, setPoints] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch call history on mount
  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        setLoading(true);
        const response = await CustomServerApi.getCallHistory();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setCallHistory(response.data);
          // Set the first call as active
          if (response.data.length > 0) {
            setActiveCallId(response.data[0].id);
          }
        }
      } catch (err) {
        setError("Failed to fetch call history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, []);

  const selectedCall = callHistory.find((c) => c.id === activeCallId);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format date to readable format
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color based on outcome
  const getOutcomeColor = (outcome: string) => {
    const outcomeMap: Record<string, string> = {
      answered: "bg-green-100 text-green-700 border-green-200",
      voicemail: "bg-yellow-100 text-yellow-700 border-yellow-200",
      "no-answer": "bg-orange-100 text-orange-700 border-orange-200",
      busy: "bg-red-100 text-red-700 border-red-200",
      appointment: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return (
      outcomeMap[outcome.toLowerCase()] ||
      "bg-secondary text-secondary-foreground"
    );
  };

  // Handle audio playback
  const togglePlay = () => {
    if (!audioRef.current || !selectedCall?.recordingUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // Stop playback when changing calls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [activeCallId]);

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(
          audioRef.current.duration,
          audioRef.current.currentTime + seconds
        )
      );
    }
  };

  // Handle playback speed
  const changePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Download recording
  const downloadRecording = () => {
    if (!selectedCall?.recordingUrl) return;
    const link = document.createElement("a");
    link.href = selectedCall.recordingUrl;
    link.download = `call-${
      selectedCall.prospect?.businessName || "recording"
    }-${formatDate(selectedCall.attemptDate)}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading call history...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  if (callHistory.length === 0) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
            <h1 className="text-xl font-heading font-semibold text-foreground">
              Call Review
            </h1>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>No Calls Found</CardTitle>
                <CardDescription>
                  There are no recorded calls to review yet.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">
            Call Review
          </h1>
          <Badge variant="secondary">{callHistory.length} Calls</Badge>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-140px)]">
            {/* Left: Call List */}
            <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2">
              {callHistory.map((call) => {
                const duration = formatDuration(call.callDuration);
                const durationMins = Math.floor((call.callDuration || 0) / 60);

                return (
                  <Card
                    key={call.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md border-l-4",
                      activeCallId === call.id
                        ? "border-l-primary ring-1 ring-primary/20"
                        : "border-l-transparent opacity-80 hover:opacity-100"
                    )}
                    onClick={() => setActiveCallId(call.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={avatar}
                            className="h-6 w-6 rounded-full"
                            alt="Rep"
                          />
                          <span className="text-sm font-medium">
                            {call.callerId || "Unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(call.attemptDate)}
                        </span>
                      </div>
                      <p className="font-semibold mb-1">
                        {call.prospect?.businessName || "Unknown Business"}
                      </p>
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-normal border",
                            getOutcomeColor(call.outcome)
                          )}
                        >
                          {call.outcome}
                        </Badge>
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            durationMins >= 3
                              ? "text-purple-600"
                              : "text-muted-foreground"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {duration}
                        </span>
                        {call.recordingUrl && (
                          <span className="flex items-center gap-1 text-xs text-blue-600">
                            <Volume2 className="h-3 w-3" />
                            Recording
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Right: Player & Review */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {selectedCall && (
                <>
                  {/* Hidden audio element */}
                  {selectedCall.recordingUrl && (
                    <audio
                      ref={audioRef}
                      src={selectedCall.recordingUrl}
                      preload="metadata"
                    />
                  )}

                  <Card className="flex-1 border-none shadow-md flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {selectedCall.prospect?.businessName ||
                              "Unknown Business"}
                          </CardTitle>
                          <CardDescription>
                            Recorded Call •{" "}
                            {formatDuration(selectedCall.callDuration)}
                            {selectedCall.prospect?.phoneNumber && (
                              <> • {selectedCall.prospect.phoneNumber}</>
                            )}
                          </CardDescription>
                        </div>
                        {(selectedCall.callDuration || 0) >= 180 && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1 py-1 px-3">
                            <Award className="h-4 w-4" />
                            Deep Dive Bonus Unlocked
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col space-y-8 p-8">
                      {/* Audio Player / Visualizer */}
                      <div className="bg-muted/30 rounded-2xl p-8 border border-dashed border-border flex flex-col items-center justify-center gap-6 min-h-[200px]">
                        {selectedCall.recordingUrl ? (
                          <>
                            {/* Simple Bar Visualizer */}
                            <div className="flex items-center gap-1 h-12 w-full px-12 justify-center">
                              {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-1.5 rounded-full bg-primary/40 transition-all duration-300",
                                    isPlaying && "animate-pulse bg-primary"
                                  )}
                                  style={{
                                    height: isPlaying
                                      ? `${Math.random() * 100}%`
                                      : "30%",
                                  }}
                                />
                              ))}
                            </div>

                            {/* Progress Bar with Time */}
                            <div className="w-full space-y-2">
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground font-mono w-12 text-right">
                                  {formatDuration(Math.floor(currentTime))}
                                </span>
                                <input
                                  type="range"
                                  min={0}
                                  max={duration || 0}
                                  value={currentTime}
                                  onChange={(e) =>
                                    handleSeek([Number(e.target.value)])
                                  }
                                  className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                                  disabled={!selectedCall.recordingUrl}
                                />
                                <span className="text-xs text-muted-foreground font-mono w-12">
                                  {formatDuration(Math.floor(duration))}
                                </span>
                              </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center gap-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => skipTime(-10)}
                                disabled={!selectedCall.recordingUrl}
                              >
                                <SkipBack className="h-4 w-4 mr-1" />
                                10s
                              </Button>
                              <Button
                                size="lg"
                                className="rounded-full h-14 w-14 shadow-xl"
                                onClick={togglePlay}
                                disabled={!selectedCall.recordingUrl}
                              >
                                {isPlaying ? (
                                  <Pause className="h-6 w-6 fill-current" />
                                ) : (
                                  <Play className="h-6 w-6 fill-current ml-0.5" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => skipTime(10)}
                                disabled={!selectedCall.recordingUrl}
                              >
                                10s
                                <SkipForward className="h-4 w-4 ml-1" />
                              </Button>
                            </div>

                            {/* Additional Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={changePlaybackSpeed}
                                className="text-xs"
                              >
                                {playbackRate}x Speed
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadRecording}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground py-8">
                            No recording available for this call
                          </div>
                        )}
                      </div>

                      {/* Call Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Status
                          </p>
                          <Badge variant="outline">{selectedCall.status}</Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Outcome
                          </p>
                          <Badge
                            className={getOutcomeColor(selectedCall.outcome)}
                          >
                            {selectedCall.outcome}
                          </Badge>
                        </div>
                        {selectedCall.notes && (
                          <div className="col-span-2 space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                              Notes
                            </p>
                            <p className="text-sm">{selectedCall.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Transcript Preview - Placeholder for future */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Transcript
                        </h3>
                        <div className="bg-card border border-dashed rounded-lg p-8 text-sm text-center text-muted-foreground">
                          Transcript not available yet
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Reviewer Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            Award Bonus Points
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant={points === 5 ? "default" : "outline"}
                              onClick={() => setPoints(5)}
                              className={cn(
                                "gap-2",
                                points === 5 &&
                                  "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
                              )}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  points === 5 && "fill-current"
                                )}
                              />{" "}
                              5 pts
                            </Button>
                            <Button
                              variant={points === 10 ? "default" : "outline"}
                              onClick={() => setPoints(10)}
                              className={cn(
                                "gap-2",
                                points === 10 &&
                                  "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
                              )}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  points === 10 && "fill-current"
                                )}
                              />{" "}
                              10 pts
                            </Button>
                            <Button
                              variant={points === 25 ? "default" : "outline"}
                              onClick={() => setPoints(25)}
                              className={cn(
                                "gap-2",
                                points === 25 &&
                                  "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
                              )}
                            >
                              <Trophy
                                className={cn(
                                  "h-4 w-4",
                                  points === 25 && "fill-current"
                                )}
                              />{" "}
                              25 pts
                            </Button>
                          </div>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <ThumbsDown className="h-5 w-5 mr-2" /> Coaching
                            Needed
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <ThumbsUp className="h-5 w-5 mr-2" /> Great Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
