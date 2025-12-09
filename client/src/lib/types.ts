// Frontend type definitions
// These are simplified types for the client-side only
// The server schema is the source of truth

export type Prospect = {
  id: string;
  businessName: string;
  phoneNumber: string;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  addressLat: string | null;
  addressLng: string | null;
  specialty: string;
  territory: string;
  lastContactDate: Date | null;
  lastCallOutcome: string | null;
  appointmentStatus: {
    isBooked: boolean;
    scheduledDate: string | null;
    fieldRepId: string | null;
  };
  priorityScore: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FieldRep = {
  id: string;
  name: string;
  territory: string;
  homeZipCode: string | null;
  homeLat: string | null;
  homeLng: string | null;
  googleCalendarId: string | null;
  googleRefreshToken: string | null;
  workSchedule: {
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = {
  id: string;
  prospectId: string | null;
  fieldRepId: string | null;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number | null;
  googleCalendarEventId: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  territory: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Stakeholder = {
  id: string;
  prospectId: string;
  name: string;
  title: string | null;
  email: string | null;
  phoneNumber: string | null;
  isPrimary: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SpecialtyColor = {
  id: string;
  specialty: string;
  bgColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CallOutcome = {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string | null;
  hoverColor: string | null;
  sortOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole =
  | "admin"
  | "manager"
  | "inside_sales_rep"
  | "field_sales_rep"
  | "data_loader";

