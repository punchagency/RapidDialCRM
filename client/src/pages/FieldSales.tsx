import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, Calendar, Phone, CheckCircle2, User, FileText, Camera, Loader2, ChevronRight, ChevronLeft, CalendarPlus } from "lucide-react";
import { MOCK_CONTACTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { CitySelector } from "@/components/crm/CitySelector";
import { getCityData } from "@/lib/cityData";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map on active stop
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12);
  }, [center, map]);
  return null;
}

export default function FieldSales() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow">("today");
  const [selectedCity, setSelectedCity] = useState<string>("miami");
  const { toast } = useToast();
  const [gcalConnected, setGcalConnected] = useState(false);

  useEffect(() => {
    const storedGcal = localStorage.getItem("gcal_connected");
    if (storedGcal === "true") {
      setGcalConnected(true);
    }
  }, []);

  // Build routes based on city and date - FILTERED TO ONLY "Visit Scheduled"
  const getMiamiRoutes = () => ({
    today: [
      { ...MOCK_CONTACTS[0], time: "09:00 AM", type: "Visit Scheduled", distance: "1.2 mi", location_lat: 25.7680, location_lng: -80.2038 },
      { ...MOCK_CONTACTS[3], time: "04:15 PM", type: "Visit Scheduled", distance: "1.5 mi", location_lat: 25.7907, location_lng: -80.2299 },
    ],
    tomorrow: [
      { ...MOCK_CONTACTS[5], time: "08:30 AM", type: "Visit Scheduled", distance: "22.1 mi", location_lat: 25.8213, location_lng: -80.2712 },
      { ...MOCK_CONTACTS[7], time: "01:30 PM", type: "Visit Scheduled", distance: "8.1 mi", location_lat: 25.6895, location_lng: -80.2357 },
      { ...MOCK_CONTACTS[13], time: "03:00 PM", type: "Visit Scheduled", distance: "2.5 mi", location_lat: 25.7549, location_lng: -80.1930 },
    ]
  });

  const getWashingtonDCRoutes = () => ({
    today: [
      { ...MOCK_CONTACTS[1], time: "09:00 AM", type: "Visit Scheduled", distance: "1.2 mi", location_lat: 38.9095, location_lng: -77.0369 },
      { ...MOCK_CONTACTS[4], time: "04:15 PM", type: "Visit Scheduled", distance: "1.5 mi", location_lat: 38.8816, location_lng: -77.1043 },
    ],
    tomorrow: [
      { ...MOCK_CONTACTS[6], time: "08:30 AM", type: "Visit Scheduled", distance: "22.1 mi", location_lat: 38.9526, location_lng: -77.4376 },
      { ...MOCK_CONTACTS[8], time: "01:30 PM", type: "Visit Scheduled", distance: "8.1 mi", location_lat: 38.8949, location_lng: -77.0369 },
      { ...MOCK_CONTACTS[12], time: "03:00 PM", type: "Visit Scheduled", distance: "2.5 mi", location_lat: 38.7642, location_lng: -77.4367 },
    ]
  });

  const routes = selectedCity === "miami" ? getMiamiRoutes() : getWashingtonDCRoutes();
  const currentRoute = selectedDate === "today" ? routes.today : routes.tomorrow;
  const activeStop = currentRoute.find(s => s.id === selectedStop) || currentRoute[0];
  
  const cityData = getCityData(selectedCity);
  // Fallback coords if data missing
  const activeCoords: [number, number] = [
      activeStop?.location_lat || cityData.center[0], 
      activeStop?.location_lng || cityData.center[1]
  ];

  const handleCheckIn = () => {
    if (!activeStop) return;
    toast({
      title: "Checked In",
      description: `You've arrived at ${activeStop.company}.`
    });
  };

  const handleAddToCalendar = () => {
    if (!activeStop) return;
    if (!gcalConnected) {
        toast({
            title: "Calendar Not Connected",
            description: "Please connect Google Calendar in Settings > Integrations first.",
            variant: "destructive"
        });
        return;
    }
    
    toast({
        title: "Added to Google Calendar",
        description: `Event created: ${activeStop.type} at ${activeStop.company} (${activeStop.time})`
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <div className="flex items-center gap-4">
             <div>
                <h1 className="text-xl font-heading font-semibold text-foreground">Field View</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {selectedDate === "today" ? "Today, Nov 19" : "Tomorrow, Nov 20"}
                </p>
             </div>
             
             <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
             
             <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
                <Button 
                    variant={selectedDate === "today" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setSelectedDate("today")}
                >
                    Today
                </Button>
                <Button 
                    variant={selectedDate === "tomorrow" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setSelectedDate("tomorrow")}
                >
                    Tomorrow
                </Button>
             </div>
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
                    {currentRoute.length > 0 ? (
                        currentRoute.map((stop, index) => (
                            <div 
                               key={stop.id}
                               onClick={() => setSelectedStop(stop.id)}
                               className={cn(
                                 "relative pl-6 pb-6 border-l-2 cursor-pointer transition-all group",
                                 activeStop?.id === stop.id ? "border-primary" : "border-muted-foreground/20",
                                 index === currentRoute.length - 1 && "pb-0"
                               )}
                            >
                               <div className={cn(
                                 "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-background transition-colors",
                                 activeStop?.id === stop.id ? "border-primary ring-4 ring-primary/10" : "border-muted-foreground/40 group-hover:border-primary/60"
                               )} />
                               
                               <Card className={cn(
                                  "ml-2 transition-all duration-200",
                                  activeStop?.id === stop.id ? "shadow-md border-primary/50 bg-primary/5" : "shadow-sm hover:bg-muted/50"
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
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No visits scheduled for this day.
                        </div>
                    )}
                </div>
            </div>

            {/* Map / Detail View */}
            <div className={cn(
                "flex-1 bg-muted/10 relative flex flex-col transition-all duration-300",
                viewMode === "list" ? "hidden md:flex" : "flex"
            )}>
                {/* Real Map Layer */}
                <div className="absolute inset-0 z-0">
                    <MapContainer 
                        center={activeCoords} 
                        zoom={12} 
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={activeCoords} />
                        
                        {currentRoute.map((stop, index) => {
                             if (!stop.location_lat || !stop.location_lng) return null;
                             return (
                                <Marker 
                                    key={stop.id} 
                                    position={[stop.location_lat, stop.location_lng]}
                                    eventHandlers={{
                                        click: () => setSelectedStop(stop.id),
                                    }}
                                >
                                    <Popup>
                                        <div className="font-semibold">{stop.company}</div>
                                        <div className="text-xs">{stop.address}</div>
                                    </Popup>
                                </Marker>
                             );
                        })}
                    </MapContainer>
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
                {activeStop && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20 pointer-events-none">
                     <Card className="shadow-xl border-t-4 border-t-primary max-w-2xl mx-auto animate-in slide-in-from-bottom-10 pointer-events-auto bg-card/95 backdrop-blur-sm">
                        <CardContent className="p-6">
                           <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                              <div>
                                 <h2 className="text-2xl font-heading font-bold">{activeStop.company}</h2>
                                 <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <User className="h-4 w-4" /> {activeStop.name} • {activeStop.title}
                                 </p>
                              </div>
                              <div className="flex gap-2">
                                 <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={handleAddToCalendar} title="Add to Calendar">
                                    <CalendarPlus className="h-5 w-5" />
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
                )}
            </div>

        </div>
      </main>
    </div>
  );
}
