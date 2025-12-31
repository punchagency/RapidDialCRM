import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CustomServerApi } from "@/integrations/custom-server/api";
import { Calendar, Plus, RefreshCw, Loader2, Clock, MapPin, Users, Edit, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { BookAppointmentWithCalendarModal } from "@/components/crm/BookAppointmentWithCalendarModal";
import type { Appointment } from "@/lib/types";

interface CalendarEvent {
 id: string;
 summary: string;
 description?: string;
 start: { dateTime?: string; date?: string };
 end: { dateTime?: string; date?: string };
 location?: string;
 attendees?: Array<{ email: string; displayName?: string }>;
}

export default function CalendarPage() {
 const { toast } = useToast();
 const [selectedDate, setSelectedDate] = useState<Date>(new Date());
 const [events, setEvents] = useState<CalendarEvent[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isConnected, setIsConnected] = useState(false);
 const [isSyncing, setIsSyncing] = useState(false);
 const [accessToken, setAccessToken] = useState<string | null>(null);
 const [refreshToken, setRefreshToken] = useState<string | null>(null);
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
 const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

 // Check connection status and load tokens
 useEffect(() => {
  const storedAccessToken = localStorage.getItem("gcal_access_token");
  const storedRefreshToken = localStorage.getItem("gcal_refresh_token");

  if (storedAccessToken) {
   setAccessToken(storedAccessToken);
   setRefreshToken(storedRefreshToken);
   setIsConnected(true);
   loadEvents(storedAccessToken, storedRefreshToken);
  } else {
   checkConfig();
  }
 }, []);

 // Load events when date changes
 useEffect(() => {
  if (accessToken && isConnected) {
   loadEvents(accessToken, refreshToken);
  }
 }, [selectedDate, accessToken, isConnected]);

 const checkConfig = async () => {
  try {
   const { data, error } = await CustomServerApi.getCalendarConfig();
   if (error) {
    console.error("Calendar config error:", error);
   }
  } catch (error) {
   console.error("Failed to check calendar config:", error);
  }
 };

 const handleConnect = async () => {
  try {
   const { data, error } = await CustomServerApi.getCalendarAuthUrl();
   if (error) {
    throw new Error(error);
   }
   if (data?.authUrl) {
    // Open OAuth flow in new window (will redirect to frontend callback)
    const authWindow = window.open(data.authUrl, "Google Calendar Auth", "width=500,height=600");

    // Listen for success message from callback page
    const handleMessage = async (event: MessageEvent) => {
     // Verify message is from same origin
     if (event.origin !== window.location.origin) return;

     if (event.data.type === "GOOGLE_CALENDAR_AUTH_SUCCESS") {
      const { accessToken, refreshToken } = event.data;
      window.removeEventListener("message", handleMessage);

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setIsConnected(true);

      toast({
       title: "Connected",
       description: "Google Calendar has been connected successfully.",
      });

      loadEvents(accessToken, refreshToken);
     }
    };

    window.addEventListener("message", handleMessage);

    // Fallback: check if window was closed manually
    const checkClosed = setInterval(() => {
     if (authWindow?.closed) {
      clearInterval(checkClosed);
      window.removeEventListener("message", handleMessage);
     }
    }, 1000);
   }
  } catch (error) {
   toast({
    title: "Connection Failed",
    description: error instanceof Error ? error.message : "Unable to connect to Google Calendar",
    variant: "destructive",
   });
  }
 };

 const handleDisconnect = () => {
  localStorage.removeItem("gcal_access_token");
  localStorage.removeItem("gcal_refresh_token");
  setAccessToken(null);
  setRefreshToken(null);
  setIsConnected(false);
  setEvents([]);
  toast({
   title: "Disconnected",
   description: "Google Calendar has been disconnected.",
  });
 };

 const loadEvents = async (token: string, refresh?: string | null) => {
  if (!token) return;

  setIsLoading(true);
  try {
   const monthStart = startOfMonth(selectedDate);
   const monthEnd = endOfMonth(selectedDate);

   const { data, error } = await CustomServerApi.listCalendarEvents({
    accessToken: token,
    refreshToken: refresh || undefined,
    timeMin: monthStart.toISOString(),
    timeMax: monthEnd.toISOString(),
   });

   if (error) {
    throw new Error(error);
   }

   setEvents(data || []);
  } catch (error) {
   console.error("Failed to load events:", error);
   toast({
    title: "Failed to Load Events",
    description: error instanceof Error ? error.message : "Unable to load calendar events",
    variant: "destructive",
   });
  } finally {
   setIsLoading(false);
  }
 };

 const handleSync = async () => {
  if (!accessToken) return;

  setIsSyncing(true);
  try {
   const { data, error } = await CustomServerApi.syncCalendar(accessToken, refreshToken);
   if (error) {
    throw new Error(error);
   }

   toast({
    title: "Sync Complete",
    description: `Created ${data?.created || 0} events, updated ${data?.updated || 0} events.`,
   });

   // Reload events
   await loadEvents(accessToken, refreshToken);
  } catch (error) {
   toast({
    title: "Sync Failed",
    description: error instanceof Error ? error.message : "Unable to sync calendar",
    variant: "destructive",
   });
  } finally {
   setIsSyncing(false);
  }
 };

 const handleAppointmentSaved = async (appointment: Appointment) => {
  // Reload events after appointment is saved
  if (accessToken) {
   await loadEvents(accessToken, refreshToken);
  }
  setEditingAppointment(null);
 };

 // Handle edit event
 const handleEditEvent = async (event: CalendarEvent) => {
  if (!accessToken) return;

  try {
   // Find appointment by googleCalendarEventId
   const { data: appointment, error } = await CustomServerApi.getAppointmentByCalendarEvent(event.id);
   console.log("appointment",appointment);
   console.log("error",error);

   if (error || !appointment) {
    toast({
     title: "Event Not Found",
     description: "This event is not linked to an appointment. Cannot edit.",
     variant: "destructive",
    });
    return;
   }

   setEditingAppointment(appointment);
   setIsDialogOpen(true);
  } catch (error) {
   toast({
    title: "Error",
    description: "Failed to load appointment details.",
    variant: "destructive",
   });
  }
 };

 // Handle delete event
 const handleDeleteEvent = async (event: CalendarEvent) => {
  if (!accessToken) {
   toast({
    title: "Not Connected",
    description: "Google Calendar is not connected.",
    variant: "destructive",
   });
   return;
  }

  if (!confirm(`Are you sure you want to delete "${event.summary}"? This will remove it from both the calendar and appointments.`)) {
   return;
  }

  setDeletingEventId(event.id);

  try {
   // Find appointment by googleCalendarEventId
   const { data: appointment, error: findError } = await CustomServerApi.getAppointmentByCalendarEvent(event.id);

   // Delete from Google Calendar
   if (event.id) {
    const { error: calendarError } = await CustomServerApi.deleteCalendarEvent(
     event.id,
     accessToken,
     refreshToken || undefined
    );

    if (calendarError) {
     console.warn("Failed to delete from calendar:", calendarError);
    }
   }

   // Delete from appointments database if found
   if (appointment && !findError) {
    const { error: deleteError } = await CustomServerApi.deleteAppointment(appointment.id);
    if (deleteError) {
     console.warn("Failed to delete appointment:", deleteError);
    }
   }

   toast({
    title: "Event Deleted",
    description: "Event has been removed from calendar and appointments.",
   });

   // Reload events
   await loadEvents(accessToken, refreshToken);
  } catch (error) {
   toast({
    title: "Delete Failed",
    description: error instanceof Error ? error.message : "Unable to delete event",
    variant: "destructive",
   });
  } finally {
   setDeletingEventId(null);
  }
 };

 // Get events for a specific date
 const getEventsForDate = (date: Date) => {
  return events.filter((event) => {
   const eventStart = event.start.dateTime
    ? parseISO(event.start.dateTime)
    : event.start.date
     ? new Date(event.start.date)
     : null;

   if (!eventStart) return false;
   return isSameDay(eventStart, date);
  });
 };

 // Get calendar days
 const monthStart = startOfMonth(selectedDate);
 const monthEnd = endOfMonth(selectedDate);
 const calendarStart = startOfWeek(monthStart);
 const calendarEnd = endOfWeek(monthEnd);
 const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

 return (
  <div className="flex h-screen bg-background overflow-hidden">
   <Sidebar />

   <main className="flex-1 flex flex-col overflow-hidden relative bg-muted/30">
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-10">
     <h1 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
      <Calendar className="h-5 w-5" /> Calendar
     </h1>
     <div className="flex items-center gap-2">
      {isConnected ? (
       <>
        <Button
         variant="outline"
         size="sm"
         onClick={handleSync}
         disabled={isSyncing}
         className="gap-2"
        >
         {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
         ) : (
          <RefreshCw className="h-4 w-4" />
         )}
         Sync
        </Button>
        <Button
         size="sm"
         onClick={() => setIsDialogOpen(true)}
         className="gap-2"
        >
         <Plus className="h-4 w-4" /> Add Event
        </Button>
        <Button
         variant="outline"
         size="sm"
         onClick={handleDisconnect}
        >
         Disconnect
        </Button>
       </>
      ) : (
       <Button size="sm" onClick={handleConnect} className="gap-2">
        <Calendar className="h-4 w-4" /> Connect Google Calendar
       </Button>
      )}
     </div>
    </header>

    <div className="flex-1 overflow-y-auto p-6">
     {!isConnected ? (
      <Card className="max-w-2xl mx-auto mt-12">
       <CardHeader>
        <CardTitle>Connect Google Calendar</CardTitle>
        <CardDescription>
         Connect your Google Calendar to view and manage appointments, sync events, and prevent double-booking.
        </CardDescription>
       </CardHeader>
       <CardContent>
        <Button onClick={handleConnect} className="w-full gap-2">
         <Calendar className="h-4 w-4" /> Connect Google Calendar
        </Button>
       </CardContent>
      </Card>
     ) : (
      <div className="max-w-7xl mx-auto space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
         <Card>
          <CardHeader>
           <CardTitle>{format(selectedDate, "MMMM yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
           <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
             <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
             </div>
            ))}
           </div>
           <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
             const dayEvents = getEventsForDate(day);
             const isCurrentMonth = isSameMonth(day, selectedDate);
             const isToday = isSameDay(day, new Date());
             const isSelected = isSameDay(day, selectedDate);

             return (
              <button
               key={day.toISOString()}
               onClick={() => setSelectedDate(day)}
               className={cn(
                "aspect-square p-2 rounded-lg text-sm transition-colors",
                !isCurrentMonth && "text-muted-foreground/50",
                isToday && "bg-primary/10 font-semibold",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && !isToday && "hover:bg-muted"
               )}
              >
               <div className="flex flex-col items-center gap-1">
                <span>{format(day, "d")}</span>
                {dayEvents.length > 0 && (
                 <div className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, idx) => (
                   <div
                    key={idx}
                    className="w-1 h-1 rounded-full bg-primary"
                   />
                  ))}
                 </div>
                )}
               </div>
              </button>
             );
            })}
           </div>
          </CardContent>
         </Card>
        </div>

        {/* Events List */}
        <div>
         <Card>
          <CardHeader>
           <CardTitle>Events for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
           {isLoading ? (
            <div className="flex items-center justify-center py-8">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
           ) : (
            <ScrollArea className="h-[500px]">
             <div className="space-y-3">
              {getEventsForDate(selectedDate).length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-8">
                No events scheduled for this day
               </p>
              ) : (
               getEventsForDate(selectedDate).map((event) => {
                const startTime = event.start.dateTime
                 ? format(parseISO(event.start.dateTime), "h:mm a")
                 : "All day";
                const endTime = event.end.dateTime
                 ? format(parseISO(event.end.dateTime), "h:mm a")
                 : "";

                return (
                 <div
                  key={event.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                 >
                  <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{event.summary}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                     <Clock className="h-3 w-3" />
                     <span>
                      {startTime}
                      {endTime && ` - ${endTime}`}
                     </span>
                    </div>
                    {event.location && (
                     <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                     </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                     <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{event.attendees.length} attendee(s)</span>
                     </div>
                    )}
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                     variant="ghost"
                     size="icon"
                     className="h-7 w-7"
                     onClick={() => handleEditEvent(event)}
                     title="Edit event"
                    >
                     <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                     variant="ghost"
                     size="icon"
                     className="h-7 w-7 text-destructive hover:text-destructive"
                     onClick={() => handleDeleteEvent(event)}
                     disabled={deletingEventId === event.id}
                     title="Delete event"
                    >
                     {deletingEventId === event.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                     ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                     )}
                    </Button>
                   </div>
                  </div>
                 </div>
                );
               })
              )}
             </div>
            </ScrollArea>
           )}
          </CardContent>
         </Card>
        </div>
       </div>
      </div>
     )}
    </div>
   </main>

   {/* Book Appointment Modal */}
   <BookAppointmentWithCalendarModal
    isOpen={isDialogOpen}
    onClose={() => {
     setIsDialogOpen(false);
     setEditingAppointment(null);
    }}
    onSave={handleAppointmentSaved}
    initialAppointment={editingAppointment}
   />
  </div>
 );
}

