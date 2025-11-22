import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, jsonb, integer, date, time, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Prospects Table
export const prospects = pgTable("prospects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  addressStreet: varchar("address_street", { length: 255 }),
  addressCity: varchar("address_city", { length: 100 }),
  addressState: varchar("address_state", { length: 2 }),
  addressZip: varchar("address_zip", { length: 10 }),
  addressLat: decimal("address_lat", { precision: 10, scale: 8 }),
  addressLng: decimal("address_lng", { precision: 11, scale: 8 }),
  specialty: varchar("specialty", { length: 50 }).notNull(),
  territory: varchar("territory", { length: 20 }).notNull(),
  lastContactDate: timestamp("last_contact_date"),
  appointmentStatus: jsonb("appointment_status").default(sql`'{"isBooked": false, "scheduledDate": null, "fieldRepId": null}'::jsonb`),
  priorityScore: integer("priority_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  territoryIdx: index("idx_prospects_territory").on(table.territory),
  coordinatesIdx: index("idx_prospects_coordinates").on(table.addressLat, table.addressLng),
  specialtyIdx: index("idx_prospects_specialty").on(table.specialty),
  lastContactIdx: index("idx_prospects_last_contact").on(table.lastContactDate),
}));

// Field Reps Table
export const fieldReps = pgTable("field_reps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  territory: varchar("territory", { length: 20 }).notNull(),
  homeZipCode: varchar("home_zip_code", { length: 10 }),
  homeLat: decimal("home_lat", { precision: 10, scale: 8 }),
  homeLng: decimal("home_lng", { precision: 11, scale: 8 }),
  googleCalendarId: varchar("google_calendar_id", { length: 255 }),
  googleRefreshToken: text("google_refresh_token"),
  workSchedule: jsonb("work_schedule").default(sql`'{"daysOfWeek": ["monday","tuesday","wednesday","thursday","friday"], "startTime": "09:00", "endTime": "17:00"}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Appointments Table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").references(() => prospects.id),
  fieldRepId: varchar("field_rep_id").references(() => fieldReps.id),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: time("scheduled_time").notNull(),
  durationMinutes: integer("duration_minutes").default(45),
  googleCalendarEventId: varchar("google_calendar_event_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  fieldRepIdx: index("idx_appointments_field_rep").on(table.fieldRepId),
  dateIdx: index("idx_appointments_date").on(table.scheduledDate),
}));

// Call History Table
export const callHistory = pgTable("call_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").references(() => prospects.id),
  callerId: varchar("caller_id", { length: 100 }),
  attemptDate: timestamp("attempt_date").defaultNow(),
  outcome: varchar("outcome", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  prospectIdx: index("idx_call_history_prospect").on(table.prospectId),
  dateIdx: index("idx_call_history_date").on(table.attemptDate),
  callerIdx: index("idx_call_history_caller").on(table.callerId),
}));

// Zod Schemas
export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFieldRepSchema = createInsertSchema(fieldReps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Prospect = typeof prospects.$inferSelect;
export type InsertProspect = z.infer<typeof insertProspectSchema>;

export type FieldRep = typeof fieldReps.$inferSelect;
export type InsertFieldRep = z.infer<typeof insertFieldRepSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type CallHistory = typeof callHistory.$inferSelect;
