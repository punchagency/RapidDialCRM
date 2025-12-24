interface TranscriptPanelProps {
  transcript?: string | null;
}

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Transcript
      </h3>
      {transcript ? (
        <div className="bg-card border rounded-lg p-4 text-sm leading-relaxed text-muted-foreground max-h-60 overflow-y-auto whitespace-pre-line font-mono">
          {transcript}
        </div>
      ) : (
        <div className="bg-card border border-dashed rounded-lg p-8 text-sm text-center text-muted-foreground">
          Transcript not available yet
        </div>
      )}
    </div>
  );
}
