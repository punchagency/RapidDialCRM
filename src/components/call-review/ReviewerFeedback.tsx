import { Button } from "@/components/ui/button";
import { Star, Trophy, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReviewerFeedbackProps {
  onPointsChange?: (points: number) => void;
  onFeedback?: (type: "coaching" | "great") => void;
}

export function ReviewerFeedback({
  onPointsChange,
  onFeedback,
}: ReviewerFeedbackProps) {
  const [points, setPoints] = useState(0);

  const handlePointsClick = (value: number) => {
    setPoints(value);
    onPointsChange?.(value);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-2">Award Bonus Points</p>
        <div className="flex gap-2">
          <Button
            variant={points === 5 ? "default" : "outline"}
            onClick={() => handlePointsClick(5)}
            className={cn(
              "gap-2",
              points === 5 &&
                "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
            )}
          >
            <Star className={cn("h-4 w-4", points === 5 && "fill-current")} /> 5
            pts
          </Button>
          <Button
            variant={points === 10 ? "default" : "outline"}
            onClick={() => handlePointsClick(10)}
            className={cn(
              "gap-2",
              points === 10 &&
                "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
            )}
          >
            <Star className={cn("h-4 w-4", points === 10 && "fill-current")} />{" "}
            10 pts
          </Button>
          <Button
            variant={points === 25 ? "default" : "outline"}
            onClick={() => handlePointsClick(25)}
            className={cn(
              "gap-2",
              points === 25 &&
                "bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
            )}
          >
            <Trophy
              className={cn("h-4 w-4", points === 25 && "fill-current")}
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
          onClick={() => onFeedback?.("coaching")}
        >
          <ThumbsDown className="h-5 w-5 mr-2" /> Coaching Needed
        </Button>
        <Button
          variant="ghost"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => onFeedback?.("great")}
        >
          <ThumbsUp className="h-5 w-5 mr-2" /> Great Call
        </Button>
      </div>
    </div>
  );
}
