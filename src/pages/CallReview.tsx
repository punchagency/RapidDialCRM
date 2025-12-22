import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Loader2 } from "lucide-react";
import { useCallHistory } from "@/hooks/useCallHistory";
import { CallListItem } from "@/components/call-review/CallListItem";
import { AudioPlayer } from "@/components/call-review/AudioPlayer";
import { CallDetails } from "@/components/call-review/CallDetails";
import { ReviewerFeedback } from "@/components/call-review/ReviewerFeedback";
import { TranscriptPanel } from "@/components/call-review/TranscriptPanel";

// Format duration from seconds to MM:SS
const formatDuration = (seconds?: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function CallReview() {
  const {
    callHistory,
    loading,
    error,
    selectedCall,
    activeCallId,
    setActiveCallId,
  } = useCallHistory({ offset: 0, limit: 100 });

  const handlePointsChange = (points: number) => {
    console.log("Points awarded:", points);
    // TODO: Implement points submission logic
  };

  const handleFeedback = (type: "coaching" | "great") => {
    console.log("Feedback submitted:", type);
    // TODO: Implement feedback submission logic
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
              {callHistory.map((call) => (
                <CallListItem
                  key={call.id}
                  call={call}
                  isActive={activeCallId === call.id}
                  onClick={() => setActiveCallId(call.id)}
                />
              ))}
            </div>

            {/* Right: Player & Review */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {selectedCall && (
                <>
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
                      {/* Audio Player */}
                      <AudioPlayer
                        recordingUrl={selectedCall.recordingUrl || null}
                        businessName={selectedCall.prospect?.businessName}
                        attemptDate={selectedCall.attemptDate}
                        callDuration={selectedCall.callDuration}
                      />

                      {/* Call Details */}
                      <CallDetails call={selectedCall} />

                      {/* Transcript */}
                      <TranscriptPanel transcript={null} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Reviewer Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReviewerFeedback
                        onPointsChange={handlePointsChange}
                        onFeedback={handleFeedback}
                      />
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
