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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CustomServerApi } from "@/integrations/custom-server/api";
import type { Prospect, FieldRep, Appointment } from "@/lib/types";
import {
  MapsAutocomplete,
  type PlaceResult,
} from "@/components/ui/mapsautocomplete";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    appointmentData: Omit<
      Appointment,
      "id" | "createdAt" | "updatedAt" | "googleCalendarEventId" | "status"
    >
  ) => void;
  prospect: Prospect;
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

export function BookAppointmentModal({
  isOpen,
  onClose,
  onSave,
  prospect,
}: BookAppointmentModalProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [place, setPlace] = useState("");
  const [selectedFieldRepId, setSelectedFieldRepId] = useState<string>("");
  const [fieldReps, setFieldReps] = useState<FieldRep[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch field reps when modal opens

  useEffect(() => {
    if (isOpen) {
      const fetchFieldReps = async () => {
        setLoading(true);
        try {
          const { data } = await CustomServerApi.getFieldReps();
          if (data) {
            setFieldReps(data);
            // Auto-select first field rep if available
            if (data.length > 0 && !selectedFieldRepId) {
              setSelectedFieldRepId(data[0].id);
            }
          }
        } catch (error) {
          console.error("Failed to fetch field reps:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFieldReps();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!date || !selectedFieldRepId) return;

    const appointmentData: Omit<
      Appointment,
      "id" | "createdAt" | "updatedAt" | "googleCalendarEventId" | "status"
    > = {
      prospectId: prospect.id,
      fieldRepId: selectedFieldRepId,
      scheduledDate: format(date, "yyyy-MM-dd"),
      scheduledTime: time,
      durationMinutes: duration,
      notes: notes || null,
      place: place || null,
    };

    onSave(appointmentData);
    handleClose();
  };

  const handleClose = () => {
    setDate(undefined);
    setTime("09:00");
    setDuration(30);
    setNotes("");
    setPlace("");
    setSelectedFieldRepId("");
    onClose();
  };

  // Handle place selection from autocomplete
  const handlePlaceSelected = (placeResult: PlaceResult) => {
    setPlace(placeResult.formattedAddress);
  };

  // Get selected field rep details
  const selectedRep = fieldReps.find((rep) => rep.id === selectedFieldRepId);

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
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Book an appointment with {prospect.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Field Rep Selection - Searchable */}
          <div className="grid gap-2">
            <Label>Assign to Field Rep</Label>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading field reps...
              </div>
            ) : fieldReps.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No field reps available
              </div>
            ) : (
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
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
                              setSearchOpen(false);
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
            <Label htmlFor="date">Appointment Date</Label>
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
              <Label htmlFor="time">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {TIME_OPTIONS.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (mins)</Label>
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!date || !selectedFieldRepId || loading}
          >
            Book Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
