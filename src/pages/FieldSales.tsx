import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Calendar, Phone, CheckCircle2, User, FileText, Camera, Loader2, ChevronRight, ChevronLeft, CalendarPlus, X, Image as ImageIcon } from "lucide-react";
import { MOCK_CONTACTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { CitySelector } from "@/components/crm/CitySelector";
import { getCityData } from "@/lib/cityData";
import { useTodayAppointments } from "@/hooks/useAppointments";
import { geocodeAddress } from "@/lib/geocoding";
import { BookAppointmentWithCalendarModal } from "@/components/crm/BookAppointmentWithCalendarModal";
import { CustomServerApi } from "@/integrations/custom-server/api";
import type { Prospect, Appointment as AppointmentType } from "@/lib/types";

interface AppointmentDisplay {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: string;
  prospectId: string;
  prospectName: string;
  prospectPhone: string;
  prospectAddress: string;
  prospectCity: string;
  fieldRepId: string;
  fieldRepName: string;
  territory: string;
  location_lat?: number;
  location_lng?: number;
}

interface Stop {
  id: string;
  company: string;
  address: string;
  name: string;
  title: string;
  time: string;
  distance: string;
  type: "Visit Scheduled";
  location_lat: number;
  location_lng: number;
  phone: string;
  status: string;
}

// Google Maps configuration
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function FieldSales() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow">("today");
  const [selectedCity, setSelectedCity] = useState<string>("miami");
  const { toast } = useToast();
  const [gcalConnected, setGcalConnected] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null);
  const [geocodingInProgress, setGeocodingInProgress] = useState<Set<string>>(new Set());
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [visitPhotos, setVisitPhotos] = useState<Map<string, string[]>>(new Map());
  const [showPhotoPreview, setShowPhotoPreview] = useState<{ appointmentId: string; photos: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    const storedGcal = localStorage.getItem("gcal_connected");
    if (storedGcal === "true") {
      setGcalConnected(true);
    }
  }, []);

  // Get territory from selected city
  const territory = (() => {
    const territoryMap: Record<string, string> = {
      miami: "Miami",
      washington_dc: "Washington DC",
      los_angeles: "Los Angeles",
      new_york: "New York",
      chicago: "Chicago",
      dallas: "Dallas",
    };
    return territoryMap[selectedCity] || "Miami";
  })();

  // Fetch appointments from API using hook
  const { data: appointmentsData, isLoading } = useTodayAppointments(territory);
  console.log('appointmentsData', appointmentsData, 'territory', territory);

  // Transform appointments data to match expected format
  const allAppointments = useMemo((): AppointmentDisplay[] => {
    return (appointmentsData || []).map((apt: any) => ({
      id: apt.id,
      scheduledDate: apt.scheduledDate || apt.scheduled_date,
      scheduledTime: apt.scheduledTime || apt.scheduled_time,
      durationMinutes: apt.durationMinutes || apt.duration_minutes || 30,
      status: apt.status || 'scheduled',
      prospectId: apt.prospectId || apt.prospect_id,
      prospectName: apt.prospectName || apt.prospect?.businessName || 'Unknown',
      prospectPhone: apt.prospectPhone || apt.prospect?.phoneNumber || '',
      prospectAddress: apt.prospectAddress || apt.prospect?.addressStreet || '',
      prospectCity: apt.prospectCity || apt.prospect?.addressCity || '',
      fieldRepId: apt.fieldRepId || apt.field_rep_id,
      fieldRepName: apt.fieldRepName || apt.fieldRep?.name || 'Unknown',
      territory: apt.territory || territory,
      location_lat: apt.prospect?.addressLat ? parseFloat(apt.prospect.addressLat) : undefined,
      location_lng: apt.prospect?.addressLng ? parseFloat(apt.prospect.addressLng) : undefined,
    } as AppointmentDisplay));
  }, [appointmentsData, territory]);

  // Filter appointments by selected date (today or tomorrow)
  const appointments = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = selectedDate === "today" ? today : tomorrow;
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    return allAppointments.filter((apt) => {
      const aptDate = apt.scheduledDate ? apt.scheduledDate.split('T')[0] : null;
      return aptDate === targetDateStr;
    });
  }, [allAppointments, selectedDate]);

  // Auto-select first appointment
  useEffect(() => {
    if (appointments.length > 0 && !selectedStop) {
      setSelectedStop(appointments[0].id);
    }
  }, [appointments, selectedStop]);

  // Get city name mapping
  const getCityName = (cityId: string): string => {
    const cityMap: Record<string, string> = {
      miami: "Miami",
      washington_dc: "Washington, DC",
      los_angeles: "Los Angeles",
      new_york: "New York",
      chicago: "Chicago",
      dallas: "Dallas",
    };
    return cityMap[cityId] || "Miami";
  };

  // Format time from 24-hour to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Convert appointment to stop format for display
  const appointmentsToStops = useCallback((appts: AppointmentDisplay[], cityData: { center: [number, number] }): Stop[] => {
    return appts.map((apt, idx) => {
      // Use existing coordinates if available, otherwise use city center with offset
      const lat = apt.location_lat || (cityData.center[0] + (idx * 0.01));
      const lng = apt.location_lng || (cityData.center[1] + (idx * 0.01));

      return {
        id: apt.id,
        company: apt.prospectName,
        address: apt.prospectAddress,
        name: apt.fieldRepName,
        title: `Territory: ${apt.territory}`,
        time: formatTime(apt.scheduledTime),
        distance: idx === 0 ? "1.2 mi" : `${(idx * 0.8 + 1.5).toFixed(1)} mi`,
        type: "Visit Scheduled" as const,
        location_lat: lat,
        location_lng: lng,
        phone: apt.prospectPhone,
        status: apt.status,
      };
    });
  }, []);

  const cityData = getCityData(selectedCity);
  const [currentRoute, setCurrentRoute] = useState<Stop[]>([]);

  // Update route when appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      const stops = appointmentsToStops(appointments, cityData);
      setCurrentRoute(stops);

      // Geocode missing coordinates in the background
      appointments.forEach(async (apt) => {
        if (!apt.location_lat || !apt.location_lng) {
          if (apt.prospectAddress) {
            // Check if already geocoding this appointment
            setGeocodingInProgress(prev => {
              if (prev.has(apt.id)) return prev;
              return new Set(prev).add(apt.id);
            });

            try {
              const result = await geocodeAddress(apt.prospectAddress);
              if (result) {
                setCurrentRoute(prev => prev.map(stop =>
                  stop.id === apt.id
                    ? { ...stop, location_lat: result.lat, location_lng: result.lng }
                    : stop
                ));
              }
            } catch (error) {
              console.error(`Failed to geocode ${apt.prospectAddress}:`, error);
            } finally {
              setGeocodingInProgress(prev => {
                const next = new Set(prev);
                next.delete(apt.id);
                return next;
              });
            }
          }
        }
      });
    } else {
      setCurrentRoute([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, appointmentsToStops, cityData]);

  const activeStop = currentRoute.find(s => s.id === selectedStop) || currentRoute[0];

  // Fallback coords if data missing
  const mapCenter = activeStop
    ? { lat: activeStop.location_lat, lng: activeStop.location_lng }
    : { lat: cityData.center[0], lng: cityData.center[1] };

  // Update map center when active stop changes
  useEffect(() => {
    if (map && activeStop) {
      map.panTo({ lat: activeStop.location_lat, lng: activeStop.location_lng });
    }
  }, [map, activeStop]);

  const handleCheckIn = () => {
    if (!activeStop) return;
    toast({
      title: "Checked In",
      description: `You've arrived at ${activeStop.company}.`
    });
  };

  const handleAddToCalendar = async () => {
    if (!activeStop) return;

    // Find the appointment that corresponds to this stop
    const appointment = appointments.find(apt => apt.id === activeStop.id);
    if (!appointment || !appointment.prospectId) {
      toast({
        title: "Error",
        description: "Unable to find prospect for this appointment.",
        variant: "destructive"
      });
      return;
    }

    // Fetch the prospect
    try {
      const { data: prospect, error } = await CustomServerApi.getProspect(appointment.prospectId);
      if (error || !prospect) {
        toast({
          title: "Error",
          description: "Unable to load prospect details.",
          variant: "destructive"
        });
        return;
      }

      setSelectedProspect(prospect);
      setShowAppointmentModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prospect details.",
        variant: "destructive"
      });
    }
  };

  const handleStartRoute = () => {
    if (currentRoute.length === 0) {
      toast({
        title: "No Route Available",
        description: "No appointments scheduled for this day.",
        variant: "destructive"
      });
      return;
    }

    if (currentRoute.length === 1) {
      // Single stop - just navigate to it
      const stop = currentRoute[0];
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.location_lat},${stop.location_lng}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      // Multiple stops - create route with waypoints
      // Google Maps API format: /dir/waypoint1/waypoint2/.../destination
      const allStops = currentRoute.map(stop => `${stop.location_lat},${stop.location_lng}`).join('/');
      const googleMapsUrl = `https://www.google.com/maps/dir/${allStops}`;
      window.open(googleMapsUrl, '_blank');
    }

    toast({
      title: "Route Started",
      description: `Opening Google Maps with ${currentRoute.length} stop${currentRoute.length > 1 ? 's' : ''}.`
    });
  };

  const handleNavigation = () => {
    if (!activeStop) return;
    const coords = `${activeStop.location_lat},${activeStop.location_lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Format date for display
  const getDateDisplay = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = selectedDate === "today" ? today : tomorrow;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dateStr = targetDate.toLocaleDateString('en-US', options);
    const dayStr = selectedDate === "today" ? "Today" : "Tomorrow";

    return `${dayStr}, ${dateStr}`;
  };

  // Load saved photos and notes from localStorage
  useEffect(() => {
    const savedPhotos = localStorage.getItem('fieldSales_photos');
    if (savedPhotos) {
      try {
        setVisitPhotos(new Map(JSON.parse(savedPhotos)));
      } catch (error) {
        console.error('Failed to load saved photos:', error);
      }
    }
  }, []);

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeStop) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    const readerPromises: Promise<void>[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const promise = new Promise<void>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              newPhotos.push(result);
            }
            resolve();
          };
          reader.onerror = () => resolve();
        });
        reader.readAsDataURL(file);
        readerPromises.push(promise);
      }
    });

    Promise.all(readerPromises).then(() => {
      if (newPhotos.length > 0) {
        const currentPhotos = visitPhotos.get(activeStop.id) || [];
        const updatedPhotos = new Map(visitPhotos);
        updatedPhotos.set(activeStop.id, [...currentPhotos, ...newPhotos]);
        setVisitPhotos(updatedPhotos);

        // Save to localStorage
        localStorage.setItem('fieldSales_photos', JSON.stringify(Array.from(updatedPhotos.entries())));

        toast({
          title: "Photos Added",
          description: `Added ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} to ${activeStop.company}.`
        });
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle opening photo upload
  const handleAddPhoto = () => {
    if (!activeStop) return;
    fileInputRef.current?.click();
  };

  // Handle viewing photos
  const handleViewPhotos = () => {
    if (!activeStop) return;
    const photos = visitPhotos.get(activeStop.id) || [];
    if (photos.length > 0) {
      setShowPhotoPreview({ appointmentId: activeStop.id, photos });
    } else {
      handleAddPhoto();
    }
  };

  // Handle removing photo
  const handleRemovePhoto = (photoIndex: number) => {
    if (!activeStop || !showPhotoPreview) return;

    const photos = visitPhotos.get(activeStop.id) || [];
    const updatedPhotos = photos.filter((_, index) => index !== photoIndex);

    const updatedMap = new Map(visitPhotos);
    if (updatedPhotos.length > 0) {
      updatedMap.set(activeStop.id, updatedPhotos);
    } else {
      updatedMap.delete(activeStop.id);
    }

    setVisitPhotos(updatedMap);
    localStorage.setItem('fieldSales_photos', JSON.stringify(Array.from(updatedMap.entries())));

    if (updatedPhotos.length > 0) {
      setShowPhotoPreview({ appointmentId: activeStop.id, photos: updatedPhotos });
    } else {
      setShowPhotoPreview(null);
    }

    toast({
      title: "Photo Removed",
      description: "Photo has been removed from this visit."
    });
  };

  // Handle opening notes dialog
  const handleOpenNotes = () => {
    if (!activeStop) return;

    // Load existing notes from appointment or localStorage
    const savedNotes = localStorage.getItem(`fieldSales_notes_${activeStop.id}`);
    setNotesText(savedNotes || "");
    setShowNotesDialog(true);
  };

  // Handle saving notes
  const handleSaveNotes = () => {
    if (!activeStop) return;

    // Save to localStorage
    localStorage.setItem(`fieldSales_notes_${activeStop.id}`, notesText);

    // Optionally save to appointment if we have the appointment ID
    // For now, we'll just save to localStorage
    // In the future, you could add a notes field to the appointment entity

    toast({
      title: "Notes Saved",
      description: `Notes saved for ${activeStop.company}.`
    });

    setShowNotesDialog(false);
  };

  // Get photos count for active stop
  const activeStopPhotos = activeStop ? visitPhotos.get(activeStop.id) || [] : [];
  const activeStopPhotosCount = activeStopPhotos.length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-heading font-semibold text-foreground">Field View</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {getDateDisplay()}
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
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")} className="hidden">
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleStartRoute}
              disabled={currentRoute.length === 0}
            >
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
              {isLoading ? (
                <div className="p-8 text-center flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : currentRoute.length > 0 ? (
                currentRoute.map((stop, index) => (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStop(stop.id)}
                    className={cn(
                      "relative pl-6 pb-6 border-l-2 cursor-pointer transition-all group",
                      activeStop?.id === stop.id ? "border-primary" : "border-muted-foreground/20",
                      index === currentRoute.length - 1 && "pb-0"
                    )}
                    data-testid={`appointment-card-${stop.id}`}
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
                          <Badge variant="secondary" className="font-normal" data-testid={`badge-time-${stop.id}`}>{stop.time}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-distance-${stop.id}`}>
                            <MapPin className="h-3 w-3" /> {stop.distance}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground" data-testid={`text-prospect-${stop.id}`}>{stop.company}</h3>
                        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-address-${stop.id}`}>{stop.address}</p>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {stop.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium" data-testid={`text-rep-${stop.id}`}>{stop.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground" data-testid="text-no-visits">
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
            {/* Google Maps Layer */}
            <div className="absolute inset-0 z-0">
              {loadError ? (
                <div className="flex items-center justify-center h-full bg-muted">
                  <div className="text-center p-8">
                    <p className="text-destructive font-semibold mb-2">Failed to load Google Maps</p>
                    <p className="text-sm text-muted-foreground">Please check your API key configuration.</p>
                  </div>
                </div>
              ) : !isLoaded ? (
                <div className="flex items-center justify-center h-full bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={12}
                  onLoad={(map) => setMap(map)}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    disableDefaultUI: false,
                  }}
                >
                  {currentRoute.map((stop) => {
                    const isSelected = activeStop?.id === stop.id;
                    return (
                      <React.Fragment key={stop.id}>
                        <Marker
                          position={{ lat: stop.location_lat, lng: stop.location_lng }}
                          icon={{
                            url: isSelected
                              ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                              : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: isSelected
                              ? new google.maps.Size(40, 40)
                              : new google.maps.Size(32, 32),
                          }}
                          onClick={() => {
                            setSelectedStop(stop.id);
                            setInfoWindowOpen(stop.id);
                          }}
                        />
                        {infoWindowOpen === stop.id && (
                          <InfoWindow
                            position={{ lat: stop.location_lat, lng: stop.location_lng }}
                            onCloseClick={() => setInfoWindowOpen(null)}
                          >
                            <div className="p-2">
                              <div className="font-semibold text-sm">{stop.company}</div>
                              <div className="text-xs text-muted-foreground mt-1">{stop.address}</div>
                              <div className="text-xs text-muted-foreground mt-1">{stop.time}</div>
                            </div>
                          </InfoWindow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </GoogleMap>
              )}
            </div>

            {/* Mobile Toggle for List/Map */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden z-50">
              <div className="bg-card border shadow-lg rounded-full p-1 flex gap-1">
                <button
                  onClick={() => {
                    setViewMode("list");
                    // Close info window when switching to list
                    setInfoWindowOpen(null);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  aria-label="Switch to list view"
                >
                  List
                </button>
                <button
                  onClick={() => {
                    setViewMode("map");
                    // Auto-open info window for active stop when switching to map
                    if (activeStop) {
                      setTimeout(() => setInfoWindowOpen(activeStop.id), 300);
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    viewMode === "map"
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  aria-label="Switch to map view"
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
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-12 w-12"
                          onClick={handleNavigation}
                          title="Navigate to this location"
                        >
                          <Navigation className="h-5 w-5" />
                        </Button>
                        <Button size="lg" className="rounded-full px-8 bg-green-600 hover:bg-green-700" onClick={handleCheckIn}>
                          <CheckCircle2 className="h-5 w-5 mr-2" /> Check In
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="ghost"
                        className="h-auto py-4 flex flex-col gap-2 border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 relative"
                        onClick={handleViewPhotos}
                      >
                        <div className="relative">
                          <Camera className="h-6 w-6 text-muted-foreground" />
                          {activeStopPhotosCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {activeStopPhotosCount}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          {activeStopPhotosCount > 0 ? `View Photos (${activeStopPhotosCount})` : "Add Photo"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-auto py-4 flex flex-col gap-2 border border-dashed border-border hover:border-primary/50 hover:bg-primary/5"
                        onClick={handleOpenNotes}
                      >
                        <FileText className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs font-medium">Visit Notes</span>
                      </Button>
                    </div>

                    {/* Hidden file input for photos */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Visit Notes - {activeStop?.company}</DialogTitle>
            <DialogDescription>
              Add notes about your visit to {activeStop?.company}. These notes will be saved locally.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your visit notes here..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="min-h-[200px] resize-none"
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Preview Dialog */}
      <Dialog open={showPhotoPreview !== null} onOpenChange={(open) => !open && setShowPhotoPreview(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visit Photos - {activeStop?.company}</DialogTitle>
            <DialogDescription>
              {showPhotoPreview?.photos.length || 0} photo{showPhotoPreview?.photos.length !== 1 ? 's' : ''} for this visit
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {showPhotoPreview && showPhotoPreview.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {showPhotoPreview.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Visit photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No photos added yet</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleAddPhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Add More Photos
            </Button>
            <Button variant="outline" onClick={() => setShowPhotoPreview(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Appointment Modal */}
      <BookAppointmentWithCalendarModal
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setSelectedProspect(null);
        }}
        onSave={(appointment: AppointmentType) => {
          toast({
            title: "Appointment Booked",
            description: "Appointment has been created and added to your calendar.",
          });
          // Optionally refresh appointments here
        }}
        initialProspect={selectedProspect}
      />
    </div>
  );
}

