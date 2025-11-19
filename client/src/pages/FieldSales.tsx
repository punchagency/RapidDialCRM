import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Calendar, Clock, Phone, CheckCircle2, User, FileText, Camera } from "lucide-react";
import mapBg from "@assets/generated_images/Subtle_abstract_map_background_for_CRM_7b808988.png";
import { MOCK_CONTACTS, Contact } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function FieldSales() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const { toast } = useToast();

  // Filter contacts that are relevant for field sales (e.g., meetings or visits)
  // For demo purposes, we'll just grab a few specific ones and mock times
  const todaysRoute = [
    { ...MOCK_CONTACTS[0], time: "09:00 AM", type: "Visit Scheduled", distance: "1.2 mi" },
    { ...MOCK_CONTACTS[3], time: "11:30 AM", type: "Meeting Scheduled", distance: "4.5 mi" },
    { ...MOCK_CONTACTS[1], time: "02:00 PM", type: "Visit Scheduled", distance: "2.1 mi" },
  ];

  const activeStop = todaysRoute.find(s => s.id === selectedStop) || todaysRoute[0];

  const handleCheckIn = () => {
    toast({
      title: "Checked In",
      description: `You've arrived at ${activeStop.company}.`
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <div>
             <h1 className="text-xl font-heading font-semibold text-foreground">Field View</h1>
             <p className="text-xs text-muted-foreground flex items-center gap-1">
               <Calendar className="h-3 w-3" /> Today, Nov 19
             </p>
          </div>
          <div className="flex items-center gap-2">
             <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")} className="hidden md:block">
                <TabsList>
                   <TabsTrigger value="list">List</TabsTrigger>
                   <TabsTrigger value="map">Map</TabsTrigger>
                </TabsList>
             </Tabs>
             <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Navigation className="h-4 w-4" /> Start Route
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
            
            {/* List / Timeline View */}
            <div className={cn(
                "flex-1 md:max-w-md border-r border-border bg-card flex flex-col overflow-y-auto z-10 transition-all duration-300 absolute inset-0 md:relative",
                viewMode === "map" ? "translate-x-full md:translate-x-0 opacity-0 md:opacity-100" : "translate-x-0 opacity-100"
            )}>
                <div className="p-4 space-y-4">
                    {todaysRoute.map((stop, index) => (
                        <div 
                           key={stop.id}
                           onClick={() => setSelectedStop(stop.id)}
                           className={cn(
                             "relative pl-6 pb-6 border-l-2 cursor-pointer transition-all group",
                             activeStop.id === stop.id ? "border-primary" : "border-muted-foreground/20",
                             index === todaysRoute.length - 1 && "pb-0"
                           )}
                        >
                           <div className={cn(
                             "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-background transition-colors",
                             activeStop.id === stop.id ? "border-primary ring-4 ring-primary/10" : "border-muted-foreground/40 group-hover:border-primary/60"
                           )} />
                           
                           <Card className={cn(
                              "ml-2 transition-all duration-200",
                              activeStop.id === stop.id ? "shadow-md border-primary/50 bg-primary/5" : "shadow-sm hover:bg-muted/50"
                           )}>
                              <CardContent className="p-4">
                                 <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary" className="font-normal">{stop.time}</Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                       <MapPin className="h-3 w-3" /> {stop.distance}
                                    </span>
                                 </div>
                                 <h3 className="font-semibold text-foreground">{stop.company}</h3>
                                 <p className="text-sm text-muted-foreground mb-3">{stop.address}</p>
                                 <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                        {stop.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-medium">{stop.name}</span>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map / Detail View */}
            <div className={cn(
                "flex-1 bg-muted/10 relative flex flex-col transition-all duration-300",
                viewMode === "list" ? "hidden md:flex" : "flex"
            )}>
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${mapBg})` }} />
                
                {/* Map Pins (Mock) */}
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative group cursor-pointer">
                        <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-bounce">1</div>
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-xs font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Mercy General
                        </div>
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative group cursor-pointer">
                         <div className="h-8 w-8 bg-muted text-muted-foreground border-2 border-primary rounded-full flex items-center justify-center shadow-lg">2</div>
                    </div>
                </div>

                {/* Mobile Toggle for List/Map */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
                     <div className="bg-card border shadow-lg rounded-full p-1 flex">
                        <button 
                          onClick={() => setViewMode("list")}
                          className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
                        >
                            List
                        </button>
                        <button 
                          onClick={() => setViewMode("map")}
                          className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors", viewMode === "map" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
                        >
                            Map
                        </button>
                     </div>
                </div>

                {/* Active Stop Detail Card (Floating) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                   <Card className="shadow-xl border-t-4 border-t-primary max-w-2xl mx-auto animate-in slide-in-from-bottom-10">
                      <CardContent className="p-6">
                         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                            <div>
                               <h2 className="text-2xl font-heading font-bold">{activeStop.company}</h2>
                               <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                  <User className="h-4 w-4" /> {activeStop.name} • {activeStop.title}
                               </p>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                                  <Phone className="h-5 w-5" />
                               </Button>
                               <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                                  <Navigation className="h-5 w-5" />
                               </Button>
                               <Button size="lg" className="rounded-full px-8 bg-green-600 hover:bg-green-700" onClick={handleCheckIn}>
                                  <CheckCircle2 className="h-5 w-5 mr-2" /> Check In
                               </Button>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <Button variant="ghost" className="h-auto py-4 flex flex-col gap-2 border border-dashed border-border hover:border-primary/50 hover:bg-primary/5">
                               <Camera className="h-6 w-6 text-muted-foreground" />
                               <span className="text-xs font-medium">Add Photo</span>
                            </Button>
                            <Button variant="ghost" className="h-auto py-4 flex flex-col gap-2 border border-dashed border-border hover:border-primary/50 hover:bg-primary/5">
                               <FileText className="h-6 w-6 text-muted-foreground" />
                               <span className="text-xs font-medium">Visit Notes</span>
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
