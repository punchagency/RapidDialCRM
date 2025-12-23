import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Download } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useWavesurfer } from "@wavesurfer/react";

interface AudioPlayerProps {
  recordingUrl: string | null;
  businessName?: string;
  attemptDate?: Date;
  callDuration?: number;
}

// Format duration from seconds to MM:SS
const formatDuration = (seconds?: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Format date for filename
const formatDate = (date?: Date): string => {
  if (!date) return "recording";
  return new Date(date).toISOString().split("T")[0];
};

export function AudioPlayer({
  recordingUrl,
  businessName,
  attemptDate,
  callDuration,
}: AudioPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  // WaveSurfer hook
  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: waveformRef,
    url: recordingUrl || undefined,
    waveColor: "rgba(244, 37, 158, 1)", // primary color with 20% opacity
    progressColor: "rgba(248, 2, 2, 1)", // primary color
    // progressColor: "hsl(var(--primary))",
    height: 80,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    normalize: true,
  });

  // Toggle playback
  const togglePlay = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (wavesurfer && value[0] !== undefined) {
      const duration = wavesurfer.getDuration();
      if (duration > 0) {
        wavesurfer.seekTo(value[0] / duration);
      }
    }
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (wavesurfer) {
      const currentTime = wavesurfer.getCurrentTime();
      const duration = wavesurfer.getDuration();
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      wavesurfer.seekTo(newTime / duration);
    }
  };

  // Handle playback speed
  const changePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (wavesurfer) {
      wavesurfer.setPlaybackRate(nextSpeed);
    }
  };

  // Download recording - FIXED: fetch blob instead of direct link
  const downloadRecording = async () => {
    if (!recordingUrl) return;

    try {
      const response = await fetch(recordingUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `call-${businessName || "recording"}-${formatDate(
        attemptDate
      )}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setAudioError("Failed to download recording");
    }
  };

  if (!recordingUrl) {
    return (
      <div className="bg-muted/30 rounded-2xl p-8 border border-dashed border-border flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground py-8">
          No recording available for this call
        </div>
      </div>
    );
  }

  const duration = wavesurfer?.getDuration() || 0;

  return (
    <div className="bg-muted/30 rounded-2xl p-8 border border-dashed border-border flex flex-col items-center justify-center gap-6 min-h-[200px]">
      {/* WaveSurfer Waveform */}
      <div ref={waveformRef} className="w-full" />

      {/* Progress Bar with Time */}
      <div className="w-full space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-mono w-12 text-right">
            {formatDuration(Math.floor(currentTime || 0))}
          </span>
          <Slider
            value={[currentTime || 0]}
            onValueChange={handleSeek}
            max={duration || 0}
            step={0.1}
            className="flex-1"
            disabled={!recordingUrl || !wavesurfer}
          />
          <span className="text-xs text-muted-foreground font-mono w-12">
            {formatDuration(Math.floor(duration))}
          </span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4 ">
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          onClick={() => skipTime(-10)}
          disabled={!wavesurfer}
        >
          <SkipBack className="h-4 w-4 mr-1" />
          10s
        </Button>
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-xl"
          onClick={togglePlay}
          disabled={!wavesurfer}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current ml-0.5" />
          )}
        </Button>
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          onClick={() => skipTime(10)}
          disabled={!wavesurfer}
        >
          10s
          <SkipForward className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="cursor-pointer text-xs"
          size="sm"
          onClick={changePlaybackSpeed}
        >
          {playbackRate}x Speed
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadRecording}
          className="gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Error Message */}
      {audioError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {audioError}
        </div>
      )}
    </div>
  );
}
