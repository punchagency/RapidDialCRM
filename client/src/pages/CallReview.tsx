import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipBack, SkipForward, ThumbsUp, ThumbsDown, Star, Award, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import avatar from "@assets/generated_images/Professional_user_avatar_1_a4d3e764.png";
import { MOCK_CALLS } from "@/lib/mockData";

export default function CallReview() {
  const [activeCall, setActiveCall] = React.useState<string | null>(MOCK_CALLS[0].id);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [points, setPoints] = React.useState(0);

  const selectedCall = MOCK_CALLS.find(c => c.id === activeCall) || MOCK_CALLS[0];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <h1 className="text-xl font-heading font-semibold text-foreground">Call Review</h1>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-h-[calc(100vh-140px)]">
            
            {/* Left: Call List */}
            <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2">
              {MOCK_CALLS.map((call) => (
                <Card 
                  key={call.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-l-4",
                    activeCall === call.id 
                      ? "border-l-primary ring-1 ring-primary/20" 
                      : "border-l-transparent opacity-80 hover:opacity-100"
                  )}
                  onClick={() => setActiveCall(call.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <img src={avatar} className="h-6 w-6 rounded-full" alt="Rep" />
                        <span className="text-sm font-medium">{call.rep}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{call.date}</span>
                    </div>
                    <p className="font-semibold mb-1">{call.customer}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="secondary" className="font-normal">{call.status}</Badge>
                      <span className={cn("flex items-center gap-1 text-xs font-medium", 
                        parseInt(call.duration.split(":")[0]) >= 3 ? "text-purple-600" : "text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3" />
                        {call.duration}
                      </span>
                      {call.score > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                           <Star className="h-3 w-3 fill-current" />
                           +{call.score}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                           <CardTitle className="text-xl mb-1">{selectedCall.customer}</CardTitle>
                           <CardDescription>Recorded Call • {selectedCall.duration}</CardDescription>
                         </div>
                         {parseInt(selectedCall.duration.split(":")[0]) >= 3 && (
                           <Badge className="bg-purple-100 text-purple-700 border-purple-200 gap-1 py-1 px-3">
                             <Award className="h-4 w-4" />
                             Deep Dive Bonus Unlocked
                           </Badge>
                         )}
                       </div>
                     </CardHeader>
                     
                     <CardContent className="flex-1 flex flex-col justify-center items-center space-y-8 bg-muted/20 m-6 rounded-xl border border-dashed border-border">
                        {/* Mock Waveform */}
                        <div className="flex items-center gap-1 h-16 w-full px-12 justify-center">
                           {Array.from({ length: 40 }).map((_, i) => (
                             <div 
                                key={i}
                                className={cn("w-1.5 rounded-full bg-primary/40 transition-all duration-300", isPlaying && "animate-pulse")}
                                style={{ height: `${Math.random() * 100}%` }}
                             />
                           ))}
                        </div>

                        <div className="flex items-center gap-6">
                          <Button variant="outline" size="icon" className="rounded-full"><SkipBack className="h-4 w-4" /></Button>
                          <Button 
                            size="lg" 
                            className="rounded-full h-14 w-14" 
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-full"><SkipForward className="h-4 w-4" /></Button>
                        </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardHeader>
                       <CardTitle className="text-base">Reviewer Feedback</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Award Bonus Points</p>
                            <div className="flex gap-2">
                               <Button 
                                 variant={points === 5 ? "default" : "outline"} 
                                 onClick={() => setPoints(5)}
                                 className={cn("gap-2", points === 5 && "bg-yellow-500 hover:bg-yellow-600 border-yellow-600")}
                               >
                                 <Star className={cn("h-4 w-4", points === 5 && "fill-current")} /> 5 pts
                               </Button>
                               <Button 
                                 variant={points === 10 ? "default" : "outline"} 
                                 onClick={() => setPoints(10)}
                                 className={cn("gap-2", points === 10 && "bg-yellow-500 hover:bg-yellow-600 border-yellow-600")}
                               >
                                 <Star className={cn("h-4 w-4", points === 10 && "fill-current")} /> 10 pts
                               </Button>
                               <Button 
                                 variant={points === 25 ? "default" : "outline"} 
                                 onClick={() => setPoints(25)}
                                 className={cn("gap-2", points === 25 && "bg-yellow-500 hover:bg-yellow-600 border-yellow-600")}
                               >
                                 <Trophy className={cn("h-4 w-4", points === 25 && "fill-current")} /> 25 pts
                               </Button>
                            </div>
                          </div>
                          <div className="w-px h-12 bg-border" />
                          <div className="flex gap-2">
                             <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                               <ThumbsDown className="h-5 w-5 mr-2" /> Coaching Needed
                             </Button>
                             <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
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
