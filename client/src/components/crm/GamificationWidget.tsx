import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Phone, TrendingUp, Clock, CheckCircle2, DollarSign } from "lucide-react";

export function GamificationWidget() {
  const dailyGoal = 50;
  const callsMade = 32;
  const progress = (callsMade / dailyGoal) * 100;
  
  // New Gamification Data
  const longCalls = 8;
  const longCallGoal = 12;
  const longCallProgress = (longCalls / longCallGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
             Daily Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{callsMade}</span>
                <span className="text-xs text-gray-400 font-medium">/ {dailyGoal} calls</span>
             </div>
             <Target className="h-8 w-8 text-pink-200" />
          </div>
          
          <Progress value={progress} className="h-1.5 bg-gray-100 [&>div]:bg-pink-500 rounded-full" />
          
          <p className="text-[10px] text-pink-500 font-medium mt-3 flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            18 calls to hit your goal!
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Connection Rate</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-gray-900">12%</span>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +2.4%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">Better than yesterday</p>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deep Dive Calls</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{longCalls}</span>
                <span className="text-xs text-gray-400 font-medium">/ {longCallGoal}</span>
             </div>
          </div>
          <Progress value={longCallProgress} className="h-1.5 bg-gray-100 [&>div]:bg-purple-500 rounded-full" />
          <p className="text-[10px] text-purple-600 font-medium mt-3 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {">"}3 min conversations
          </p>
        </CardContent>
      </Card>

       <Card className="border-none shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-2 pt-6 px-6">
          <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pipeline Added</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-gray-900">$15k</span>
            <span className="text-xs text-gray-400 font-medium">today</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">3 opportunities created</p>
        </CardContent>
      </Card>
    </div>
  );
}
