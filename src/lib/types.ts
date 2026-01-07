export type Prospect = {
  id: string;
  assignedInsideSalesRepId: string | null;
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
  officeEmail: string | null;
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
  bufferTimeMinutes: number | null;
  googleCalendarEventId: string | null;
  status: string | null;
  notes: string | null;
  place: string | null;
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
  inviteStatus?: string;
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
  contactType?: "client-admin" | "provider";
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

export type CallHistory = {
  id: string;
  prospectId?: string;
  callerId?: string;
  fieldRepId?: string;
  callDuration?: number;
  recordingUrl?: string;
  callSid?: string;
  attemptDate: Date;
  status: string;
  outcome: string;
  notes?: string;
  createdAt: Date;
  prospect?: Prospect;
  caller?: User;
};

export type UserRole =
  | "admin"
  | "manager"
  | "inside_sales_rep"
  | "field_sales_rep"
  | "data_loader";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  specialty?: string;
}

export interface Territory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  to: string;
  from?: string;
  subject: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Script {
  id: string;
  name: string;
  profession: string;
  content: string;
  dynamicFields?: string[];
  branches?: Array<{
    id: string;
    condition: string;
    action: string;
    content: string;
  }>;
  version: number;
  isPublished: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
