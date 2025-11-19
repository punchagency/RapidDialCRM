import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Phone, TrendingUp, Clock } from "lucide-react";

export function GamificationWidget() {
  const dailyGoal = 50;
  const callsMade = 32;
  const progress = (callsMade / dailyGoal) * 100;
  
  // New Gamification Data
  const longCalls = 8;
  const longCallGoal = 12;
  const longCallProgress = (longCalls / longCallGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Target className="h-24 w-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Daily Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold font-heading">{callsMade}</span>
            <span className="text-sm text-muted-foreground mb-1">/ {dailyGoal} calls</span>
          </div>
          <Progress value={progress} className="h-2 bg-primary/20" />
          <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            18 calls to hit your goal!
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Connection Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold font-heading">12%</span>
            <span className="text-sm text-green-600 mb-1 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +2.4%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Better than yesterday</p>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Deep Dive Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold font-heading">{longCalls}</span>
            <span className="text-sm text-muted-foreground mb-1">/ {longCallGoal}</span>
          </div>
          <Progress value={longCallProgress} className="h-2 bg-purple-500/20" />
          <p className="text-xs text-purple-600 font-medium mt-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {">"}3 min conversations
          </p>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pipeline Added</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold font-heading">$15k</span>
            <span className="text-sm text-muted-foreground mb-1">today</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">3 opportunities created</p>
        </CardContent>
      </Card>
    </div>
  );
}
