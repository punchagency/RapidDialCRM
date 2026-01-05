import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  ChevronsUpDown,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CustomServerApi } from "@/integrations/custom-server/api";
import type { Prospect, FieldRep, Appointment } from "@/lib/types";
import {
  MapsAutocomplete,
  type PlaceResult,
} from "@/components/ui/mapsautocomplete";
import { useToast } from "@/hooks/use-toast";

interface BookAppointmentWithCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (appointment: Appointment) => void;
  initialProspect?: Prospect | null;
  initialAppointment?: Appointment | null; // For editing
}

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      times.push(time);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export function BookAppointmentWithCalendarModal({
  isOpen,
  onClose,
  onSave,
  initialProspect,
  initialAppointment,
}: BookAppointmentWithCalendarModalProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [place, setPlace] = useState("");
  const [selectedFieldRepId, setSelectedFieldRepId] = useState<string>("");
  const [selectedProspectId, setSelectedProspectId] = useState<string>("");
  const [fieldReps, setFieldReps] = useState<FieldRep[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldRepSearchOpen, setFieldRepSearchOpen] = useState(false);
  const [prospectSearchOpen, setProspectSearchOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingAvailableTimes, setLoadingAvailableTimes] = useState(false);
  const isEditing = !!initialAppointment;

  // Set initial values when editing
  useEffect(() => {
    if (initialAppointment) {
      // Load appointment data into form
      if (initialAppointment.scheduledDate) {
        setDate(new Date(initialAppointment.scheduledDate));
      }
      if (initialAppointment.scheduledTime) {
        setTime(initialAppointment.scheduledTime);
      }
      if (initialAppointment.durationMinutes) {
        setDuration(initialAppointment.durationMinutes);
      }
      if (initialAppointment.notes) {
        setNotes(initialAppointment.notes);
      }
      if (initialAppointment.place) {
        setPlace(initialAppointment.place);
      }
      if (initialAppointment.fieldRepId) {
        setSelectedFieldRepId(initialAppointment.fieldRepId);
      }
      if (initialAppointment.prospectId) {
        setSelectedProspectId(initialAppointment.prospectId);
      }
    } else {
      // Reset form for new appointment
      setDate(undefined);
      setTime("09:00");
      setDuration(30);
      setNotes("");
      setPlace("");
      setSelectedFieldRepId("");
      if (!initialProspect) {
        setSelectedProspectId("");
      }
    }
  }, [initialAppointment, initialProspect]);

  // Set initial prospect if provided (for new appointments)
  useEffect(() => {
    if (initialProspect && !initialAppointment) {
      setSelectedProspectId(initialProspect.id);
    }
  }, [initialProspect, initialAppointment]);

  // Fetch field reps and prospects when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [fieldRepsResult, prospectsResult] = await Promise.all([
            CustomServerApi.getFieldReps(),
            CustomServerApi.getProspects(),
          ]);

          if (fieldRepsResult.data) {
            setFieldReps(fieldRepsResult.data);
            // Auto-select first field rep if available
            if (fieldRepsResult.data.length > 0 && !selectedFieldRepId) {
              setSelectedFieldRepId(fieldRepsResult.data[0].id);
            }
          }

          if (prospectsResult.data) {
            setProspects(prospectsResult.data);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
          toast({
            title: "Error",
            description: "Failed to load field reps or prospects",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, selectedFieldRepId, toast]);

  // Calculate available times based on booked appointments and calendar events
  useEffect(() => {
    const calculateAvailableTimes = async () => {
      if (!date || !selectedFieldRepId) {
        setAvailableTimes([]);
        return;
      }

      setLoadingAvailableTimes(true);
      try {
        const dateString = format(date, "yyyy-MM-dd");
        const bookedRanges: Array<{ start: Date; end: Date }> = [];

        // 1. Fetch appointments from database for this field rep and date
        try {
          const { data: appointments } = await CustomServerApi.getAppointmentsByFieldRepAndDate(
            selectedFieldRepId,
            dateString
          );

          if (appointments && Array.isArray(appointments)) {
            appointments.forEach((appointment) => {
              // Skip the appointment being edited (if editing)
              if (isEditing && initialAppointment && appointment.id === initialAppointment.id) {
                return;
              }

              const appointmentStart = new Date(`${appointment.scheduledDate}T${appointment.scheduledTime}`);
              const appointmentEnd = new Date(
                appointmentStart.getTime() + (appointment.durationMinutes || 30) * 60000
              );
              bookedRanges.push({ start: appointmentStart, end: appointmentEnd });
            });
          }
        } catch (error) {
          console.error("Failed to fetch appointments:", error);
        }

        // 2. Fetch Google Calendar events for this date (if connected)
        const accessToken = localStorage.getItem("gcal_access_token");
        const refreshToken = localStorage.getItem("gcal_refresh_token");

        if (accessToken) {
          try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const { data: events } = await CustomServerApi.listCalendarEvents({
              accessToken,
              refreshToken: refreshToken || undefined,
              timeMin: startOfDay.toISOString(),
              timeMax: endOfDay.toISOString(),
            });

            if (events && Array.isArray(events)) {
              events.forEach((event: any) => {
                const start = event.start?.dateTime || event.start?.date;
                const end = event.end?.dateTime || event.end?.date;

                if (start && end) {
                  const eventStart = new Date(start);
                  const eventEnd = new Date(end);
                  bookedRanges.push({ start: eventStart, end: eventEnd });
                }
              });
            }
          } catch (error) {
            console.error("Failed to fetch calendar events:", error);
          }
        }

        // 3. Generate available time slots (15-minute intervals) that don't conflict
        const available: string[] = [];

        for (let hour = 0; hour < 24; hour++) {
          for (let minute of [0, 15, 30, 45]) {
            const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            const slotStart = new Date(date);
            slotStart.setHours(hour, minute, 0, 0);
            const slotEnd = new Date(slotStart.getTime() + duration * 60000);

            // Check if this time slot overlaps with any booked range
            const hasConflict = bookedRanges.some((range) => {
              // Two time ranges overlap if: slotStart < range.end && slotEnd > range.start
              return slotStart < range.end && slotEnd > range.start;
            });

            if (!hasConflict) {
              available.push(timeString);
            }
          }
        }

        setAvailableTimes(available);

        // If current selected time is not available, reset to first available time
        if (available.length > 0 && !available.includes(time)) {
          setTime(available[0]);
        } else if (available.length === 0) {
          // No available times - keep current selection but user will see empty list
          setTime("09:00");
        }
      } catch (error) {
        console.error("Error calculating available times:", error);
        setAvailableTimes([]);
      } finally {
        setLoadingAvailableTimes(false);
      }
    };

    calculateAvailableTimes();
  }, [date, selectedFieldRepId, duration, isEditing, initialAppointment]);

  const handleSave = async () => {
    if (!date || !selectedFieldRepId || !selectedProspectId) return;

    setSaving(true);
    let appointment: Appointment | null = null;
    let calendarEventId: string | null = null;

    try {
      const appointmentData: Omit<
        Appointment,
        "id" | "createdAt" | "updatedAt" | "googleCalendarEventId" | "status"
      > = {
        prospectId: selectedProspectId,
        fieldRepId: selectedFieldRepId,
        scheduledDate: format(date, "yyyy-MM-dd"),
        scheduledTime: time,
        durationMinutes: duration,
        notes: notes || null,
        place: place || null,
      };

      // Step 1: Create or update appointment in database
      if (isEditing && initialAppointment) {
        // Update existing appointment
        const { data: updatedAppointment, error: appointmentError } =
          await CustomServerApi.updateAppointment(initialAppointment.id, appointmentData);

        if (appointmentError || !updatedAppointment) {
          throw new Error(appointmentError || "Failed to update appointment");
        }

        appointment = updatedAppointment;
      } else {
        // Create new appointment
        const { data: createdAppointment, error: appointmentError } =
          await CustomServerApi.createAppointment(appointmentData);

        if (appointmentError || !createdAppointment) {
          throw new Error(appointmentError || "Failed to create appointment");
        }

        appointment = createdAppointment;
      }

      // Step 2: Also create event in Google Calendar if connected
      const accessToken = localStorage.getItem("gcal_access_token");
      const refreshToken = localStorage.getItem("gcal_refresh_token");

      if (accessToken) {
        try {
          const selectedProspect = prospects.find(
            (p) => p.id === selectedProspectId
          );
          const startDateTime = new Date(
            `${appointmentData.scheduledDate}T${appointmentData.scheduledTime}`
          );
          const endDateTime = new Date(
            startDateTime.getTime() + duration * 60000
          );

          const eventData = {
            summary: selectedProspect?.businessName || "Appointment",
            description: appointmentData.notes || "",
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            location: appointmentData.place || "",
          };

          if (isEditing && initialAppointment?.googleCalendarEventId) {
            // Update existing calendar event
            const { data: calendarEvent, error: calendarError } =
              await CustomServerApi.updateCalendarEvent(
                initialAppointment.googleCalendarEventId,
                accessToken,
                refreshToken,
                eventData
              );

            if (calendarError) {
              console.warn("Failed to update calendar event:", calendarError);
              toast({
                title: isEditing ? "Appointment Updated" : "Appointment Created",
                description:
                  "Appointment saved to database, but failed to update Google Calendar event.",
                variant: "default",
              });
            } else {
              toast({
                title: "Success",
                description:
                  "Appointment updated and synced with Google Calendar.",
              });
            }
          } else {
            // Create new calendar event
            const { data: calendarEvent, error: calendarError } =
              await CustomServerApi.createCalendarEvent(
                accessToken,
                refreshToken,
                eventData
              );

            if (calendarEvent && calendarEvent.id) {
              calendarEventId = calendarEvent.id;
              // Update appointment with Google Calendar event ID
              const { data: updatedAppointment, error: updateError } =
                await CustomServerApi.updateAppointment(appointment.id, {
                  googleCalendarEventId: calendarEvent.id,
                });

              if (updatedAppointment) {
                appointment = updatedAppointment;
              }

              if (updateError) {
                console.warn("Failed to update appointment with calendar event ID:", updateError);
              }
            }

            if (calendarError) {
              console.warn("Failed to create calendar event:", calendarError);
              toast({
                title: "Appointment Created",
                description:
                  "Appointment saved to database, but failed to add to Google Calendar.",
                variant: "default",
              });
            } else {
              toast({
                title: "Success",
                description:
                  "Appointment created and added to both database and Google Calendar.",
              });
            }
          }
        } catch (calendarErr) {
          console.error("Calendar error:", calendarErr);
          toast({
            title: "Appointment Created",
            description:
              "Appointment saved to database, but failed to add to Google Calendar.",
            variant: "default",
          });
        }
      } else {
        // Calendar not connected - appointment still created successfully
        toast({
          title: "Appointment Created",
          description: "Appointment saved to database. Connect Google Calendar to sync events.",
        });
      }

      // Step 3: Call onSave callback with the final appointment (with calendar event ID if available)
      if (onSave && appointment) {
        onSave(appointment);
      }

      handleClose();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: isEditing ? "Failed to Update Appointment" : "Failed to Create Appointment",
        description:
          error instanceof Error ? error.message : (isEditing ? "Unable to update appointment" : "Unable to create appointment"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Only reset if not editing (editing state is managed by useEffect)
    if (!isEditing) {
      setDate(undefined);
      setTime("09:00");
      setDuration(30);
      setNotes("");
      setPlace("");
      setSelectedFieldRepId("");
      if (!initialProspect) {
        setSelectedProspectId("");
      }
    }
    onClose();
  };

  // Handle place selection from autocomplete
  const handlePlaceSelected = (placeResult: PlaceResult) => {
    setPlace(placeResult.formattedAddress);
  };

  // Get selected field rep and prospect details
  const selectedRep = fieldReps.find((rep) => rep.id === selectedFieldRepId);
  const selectedProspect = prospects.find(
    (p) => p.id === selectedProspectId
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          if (
            e.target instanceof Element &&
            e.target.closest(".pac-container")
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Appointment" : "Schedule Appointment"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update appointment details and sync with calendar" : "Book an appointment and add it to your calendar"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Prospect Selection - Searchable */}
          <div className="grid gap-2">
            <Label>Prospect *</Label>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading prospects...
              </div>
            ) : prospects.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No prospects available
              </div>
            ) : (
              <Popover
                open={prospectSearchOpen}
                onOpenChange={setProspectSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={prospectSearchOpen}
                    className="justify-between h-auto py-2"
                    disabled={!!initialProspect || isEditing}
                  >
                    {selectedProspect ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {selectedProspect.businessName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selectedProspect.addressCity || ""}
                            {selectedProspect.addressCity &&
                              selectedProspect.addressState
                              ? ", "
                              : ""}
                            {selectedProspect.addressState || ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      "Select prospect..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search prospects..." />
                    <CommandList>
                      <CommandEmpty>No prospect found.</CommandEmpty>
                      <CommandGroup>
                        {prospects.map((prospect) => (
                          <CommandItem
                            key={prospect.id}
                            value={`${prospect.businessName} ${prospect.addressCity || ""} ${prospect.addressState || ""}`}
                            onSelect={() => {
                              setSelectedProspectId(prospect.id);
                              setProspectSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProspectId === prospect.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {prospect.businessName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {prospect.addressCity || ""}
                                {prospect.addressCity && prospect.addressState
                                  ? ", "
                                  : ""}
                                {prospect.addressState || ""}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Field Rep Selection - Searchable */}
          <div className="grid gap-2">
            <Label>Assign to Field Rep *</Label>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading field reps...
              </div>
            ) : fieldReps.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No field reps available
              </div>
            ) : (
              <Popover
                open={fieldRepSearchOpen}
                onOpenChange={setFieldRepSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={fieldRepSearchOpen}
                    className="justify-between h-auto py-2"
                  >
                    {selectedRep ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {getInitials(selectedRep.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {selectedRep.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {selectedRep.territory}
                          </span>
                        </div>
                      </div>
                    ) : (
                      "Select field rep..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search field reps..." />
                    <CommandList>
                      <CommandEmpty>No field rep found.</CommandEmpty>
                      <CommandGroup>
                        {fieldReps.map((rep) => (
                          <CommandItem
                            key={rep.id}
                            value={`${rep.name} ${rep.territory}`}
                            onSelect={() => {
                              setSelectedFieldRepId(rep.id);
                              setFieldRepSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedFieldRepId === rep.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {getInitials(rep.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{rep.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {rep.territory}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Date Picker */}
          <div className="grid gap-2">
            <Label htmlFor="date">Appointment Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
                side="bottom"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="[--cell-size:2.5rem] w-[15rem]"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="time">Time *</Label>
              <Select value={time} onValueChange={setTime} disabled={loadingAvailableTimes || !date || !selectedFieldRepId}>
                <SelectTrigger id="time">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={loadingAvailableTimes ? "Loading available times..." : "Select time"} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {loadingAvailableTimes ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Loading available times...
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {date && selectedFieldRepId ? "No available times for this date" : "Select date and field rep first"}
                    </div>
                  ) : (
                    availableTimes.map((timeOption) => (
                      <SelectItem key={timeOption} value={timeOption}>
                        {timeOption}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (mins) *</Label>
              <Select
                value={duration.toString()}
                onValueChange={(val) => setDuration(parseInt(val))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Address */}
          <div className="grid gap-2">
            <MapsAutocomplete
              label="Appointment Address (Optional)"
              placeholder="Search for appointment location..."
              value={place}
              onValueChange={setPlace}
              onPlaceSelected={handlePlaceSelected}
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this appointment..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !date ||
              !selectedFieldRepId ||
              !selectedProspectId ||
              loading ||
              saving
            }
          >
            {saving ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Appointment" : "Book Appointment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

