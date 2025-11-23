import { type Prospect, type InsertProspect, type FieldRep, type InsertFieldRep, type Appointment, type InsertAppointment, type Stakeholder, type InsertStakeholder, type User, type InsertUser, type SpecialtyColor, type InsertSpecialtyColor, type CallOutcome, type InsertCallOutcome, prospects, fieldReps, appointments, callHistory, stakeholders, users, specialtyColors, callOutcomes } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, asc, isNull } from "drizzle-orm";

const db = drizzle(neon(process.env.DATABASE_URL!));

export interface IStorage {
  // Prospects
  getProspect(id: string): Promise<Prospect | undefined>;
  listAllProspects(): Promise<Prospect[]>;
  listProspectsByTerritory(territory: string): Promise<Prospect[]>;
  createProspect(prospect: InsertProspect): Promise<Prospect>;
  updateProspect(id: string, prospect: Partial<InsertProspect>): Promise<Prospect | undefined>;
  listProspectsWithoutCoordinates(): Promise<Prospect[]>;

  // Field Reps
  getFieldRep(id: string): Promise<FieldRep | undefined>;
  getFieldRepByTerritory(territory: string): Promise<FieldRep | undefined>;
  createFieldRep(rep: InsertFieldRep): Promise<FieldRep>;
  listFieldReps(): Promise<FieldRep[]>;
  updateFieldRep(id: string, rep: Partial<InsertFieldRep>): Promise<FieldRep | undefined>;

  // Appointments
  getAppointment(id: string): Promise<Appointment | undefined>;
  listAppointmentsByFieldRepAndDate(fieldRepId: string, date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;

  // Call History
  recordCallOutcome(prospectId: string, callerId: string, outcome: string, notes?: string): Promise<void>;

  // Stakeholders
  getStakeholder(id: string): Promise<Stakeholder | undefined>;
  listStakeholdersByProspect(prospectId: string): Promise<Stakeholder[]>;
  createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder>;
  updateStakeholder(id: string, stakeholder: Partial<InsertStakeholder>): Promise<Stakeholder | undefined>;
  deleteStakeholder(id: string): Promise<void>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  listUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Specialty Colors
  getSpecialtyColor(specialty: string): Promise<SpecialtyColor | undefined>;
  listSpecialtyColors(): Promise<SpecialtyColor[]>;
  updateSpecialtyColor(specialty: string, color: Partial<InsertSpecialtyColor>): Promise<SpecialtyColor | undefined>;
  initializeSpecialtyColors(specialties: string[]): Promise<void>;

  // Call Outcomes
  getCallOutcome(label: string): Promise<CallOutcome | undefined>;
  listCallOutcomes(): Promise<CallOutcome[]>;
  createCallOutcome(outcome: InsertCallOutcome): Promise<CallOutcome>;
  updateCallOutcome(id: string, outcome: Partial<InsertCallOutcome>): Promise<CallOutcome | undefined>;
  deleteCallOutcome(id: string): Promise<void>;
  initializeCallOutcomes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProspect(id: string): Promise<Prospect | undefined> {
    const result = await db.select().from(prospects).where(eq(prospects.id, id)).limit(1);
    return result[0];
  }

  async listAllProspects(): Promise<Prospect[]> {
    return await db.select().from(prospects);
  }

  async listProspectsByTerritory(territory: string): Promise<Prospect[]> {
    return await db.select().from(prospects).where(eq(prospects.territory, territory));
  }

  async createProspect(prospect: InsertProspect): Promise<Prospect> {
    const [result] = await db.insert(prospects).values(prospect).returning();
    return result;
  }

  async updateProspect(id: string, prospect: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const [result] = await db.update(prospects).set({ ...prospect, updatedAt: new Date() }).where(eq(prospects.id, id)).returning();
    return result;
  }

  async listProspectsWithoutCoordinates(): Promise<Prospect[]> {
    return await db.select().from(prospects).where(
      and(isNull(prospects.addressLat), isNull(prospects.addressLng))
    );
  }

  async getFieldRep(id: string): Promise<FieldRep | undefined> {
    const result = await db.select().from(fieldReps).where(eq(fieldReps.id, id)).limit(1);
    return result[0];
  }

  async getFieldRepByTerritory(territory: string): Promise<FieldRep | undefined> {
    const result = await db.select().from(fieldReps).where(eq(fieldReps.territory, territory)).limit(1);
    return result[0];
  }

  async createFieldRep(rep: InsertFieldRep): Promise<FieldRep> {
    const [result] = await db.insert(fieldReps).values(rep).returning();
    return result;
  }

  async listFieldReps(): Promise<FieldRep[]> {
    return await db.select().from(fieldReps);
  }

  async updateFieldRep(id: string, rep: Partial<InsertFieldRep>): Promise<FieldRep | undefined> {
    const [result] = await db.update(fieldReps).set({ ...rep, updatedAt: new Date() }).where(eq(fieldReps.id, id)).returning();
    return result;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  }

  async listAppointmentsByFieldRepAndDate(fieldRepId: string, date: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(
      and(eq(appointments.fieldRepId, fieldRepId), eq(appointments.scheduledDate, date))
    ).orderBy(asc(appointments.scheduledTime));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [result] = await db.insert(appointments).values(appointment).returning();
    return result;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [result] = await db.update(appointments).set({ ...appointment, updatedAt: new Date() }).where(eq(appointments.id, id)).returning();
    return result;
  }

  async recordCallOutcome(prospectId: string, callerId: string, outcome: string, notes?: string): Promise<void> {
    await db.insert(callHistory).values({
      prospectId,
      callerId,
      outcome,
      notes,
    });
    
    // Update prospect's lastContactDate
    await this.updateProspect(prospectId, {
      lastContactDate: new Date(),
    });
  }

  async getStakeholder(id: string): Promise<Stakeholder | undefined> {
    const result = await db.select().from(stakeholders).where(eq(stakeholders.id, id)).limit(1);
    return result[0];
  }

  async listStakeholdersByProspect(prospectId: string): Promise<Stakeholder[]> {
    return await db.select().from(stakeholders).where(eq(stakeholders.prospectId, prospectId));
  }

  async createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder> {
    const [result] = await db.insert(stakeholders).values(stakeholder).returning();
    return result;
  }

  async updateStakeholder(id: string, stakeholder: Partial<InsertStakeholder>): Promise<Stakeholder | undefined> {
    const [result] = await db.update(stakeholders).set({ ...stakeholder, updatedAt: new Date() }).where(eq(stakeholders.id, id)).returning();
    return result;
  }

  async deleteStakeholder(id: string): Promise<void> {
    await db.delete(stakeholders).where(eq(stakeholders.id, id));
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [result] = await db.update(users).set({ ...user, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return result;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getSpecialtyColor(specialty: string): Promise<SpecialtyColor | undefined> {
    const result = await db.select().from(specialtyColors).where(eq(specialtyColors.specialty, specialty)).limit(1);
    return result[0];
  }

  async listSpecialtyColors(): Promise<SpecialtyColor[]> {
    return await db.select().from(specialtyColors);
  }

  async updateSpecialtyColor(specialty: string, color: Partial<InsertSpecialtyColor>): Promise<SpecialtyColor | undefined> {
    const [result] = await db.update(specialtyColors).set({ ...color, updatedAt: new Date() }).where(eq(specialtyColors.specialty, specialty)).returning();
    return result;
  }

  async initializeSpecialtyColors(specialtiesList: string[]): Promise<void> {
    const defaultColors = [
      { specialty: "Dental", bgColor: "bg-blue-100", textColor: "text-blue-700" },
      { specialty: "Chiropractor", bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
      { specialty: "Optometry", bgColor: "bg-purple-100", textColor: "text-purple-700" },
      { specialty: "Physical Therapy", bgColor: "bg-orange-100", textColor: "text-orange-700" },
      { specialty: "Orthodontics", bgColor: "bg-pink-100", textColor: "text-pink-700" },
    ];

    for (const color of defaultColors) {
      const existing = await this.getSpecialtyColor(color.specialty);
      if (!existing) {
        await db.insert(specialtyColors).values(color).onConflictDoNothing();
      }
    }
  }

  async getCallOutcome(label: string): Promise<CallOutcome | undefined> {
    const result = await db.select().from(callOutcomes).where(eq(callOutcomes.label, label)).limit(1);
    return result[0];
  }

  async listCallOutcomes(): Promise<CallOutcome[]> {
    return await db.select().from(callOutcomes).orderBy(asc(callOutcomes.sortOrder));
  }

  async createCallOutcome(outcome: InsertCallOutcome): Promise<CallOutcome> {
    const [result] = await db.insert(callOutcomes).values(outcome).returning();
    return result;
  }

  async updateCallOutcome(id: string, outcome: Partial<InsertCallOutcome>): Promise<CallOutcome | undefined> {
    const [result] = await db.update(callOutcomes).set({ ...outcome, updatedAt: new Date() }).where(eq(callOutcomes.id, id)).returning();
    return result;
  }

  async deleteCallOutcome(id: string): Promise<void> {
    await db.delete(callOutcomes).where(eq(callOutcomes.id, id));
  }

  async initializeCallOutcomes(): Promise<void> {
    const defaultOutcomes = [
      { label: "New", bgColor: "bg-slate-100", textColor: "text-slate-700", borderColor: "border-slate-200", hoverColor: "hover:bg-slate-200", sortOrder: 1 },
      { label: "Email Sent", bgColor: "bg-sky-100", textColor: "text-sky-700", borderColor: "border-sky-200", hoverColor: "hover:bg-sky-200", sortOrder: 2 },
      { label: "No Answer", bgColor: "bg-amber-100", textColor: "text-amber-700", borderColor: "border-amber-200", hoverColor: "hover:bg-amber-200", sortOrder: 3 },
      { label: "Connected", bgColor: "bg-indigo-100", textColor: "text-indigo-700", borderColor: "border-indigo-200", hoverColor: "hover:bg-indigo-200", sortOrder: 4 },
      { label: "Responded", bgColor: "bg-violet-100", textColor: "text-violet-700", borderColor: "border-violet-200", hoverColor: "hover:bg-violet-200", sortOrder: 5 },
      { label: "Qualified", bgColor: "bg-emerald-100", textColor: "text-emerald-700", borderColor: "border-emerald-200", hoverColor: "hover:bg-emerald-200", sortOrder: 6 },
      { label: "Meeting Set", bgColor: "bg-teal-100", textColor: "text-teal-700", borderColor: "border-teal-200", hoverColor: "hover:bg-teal-200", sortOrder: 7 },
      { label: "Visit Set", bgColor: "bg-cyan-100", textColor: "text-cyan-700", borderColor: "border-cyan-200", hoverColor: "hover:bg-cyan-200", sortOrder: 8 },
      { label: "Call Set", bgColor: "bg-blue-100", textColor: "text-blue-700", borderColor: "border-blue-200", hoverColor: "hover:bg-blue-200", sortOrder: 9 },
      { label: "Demo Done", bgColor: "bg-fuchsia-100", textColor: "text-fuchsia-700", borderColor: "border-fuchsia-200", hoverColor: "hover:bg-fuchsia-200", sortOrder: 10 },
      { label: "Proposal", bgColor: "bg-purple-100", textColor: "text-purple-700", borderColor: "border-purple-200", hoverColor: "hover:bg-purple-200", sortOrder: 11 },
      { label: "Negotiating", bgColor: "bg-pink-100", textColor: "text-pink-700", borderColor: "border-pink-200", hoverColor: "hover:bg-pink-200", sortOrder: 12 },
      { label: "Closed Won", bgColor: "bg-green-100", textColor: "text-green-700", borderColor: "border-green-200", hoverColor: "hover:bg-green-200", sortOrder: 13 },
      { label: "Closed Lost", bgColor: "bg-red-100", textColor: "text-red-700", borderColor: "border-red-200", hoverColor: "hover:bg-red-200", sortOrder: 14 },
      { label: "Nurture", bgColor: "bg-lime-100", textColor: "text-lime-700", borderColor: "border-lime-200", hoverColor: "hover:bg-lime-200", sortOrder: 15 },
      { label: "Follow Up", bgColor: "bg-orange-100", textColor: "text-orange-700", borderColor: "border-orange-200", hoverColor: "hover:bg-orange-200", sortOrder: 16 },
      { label: "No Response", bgColor: "bg-gray-100", textColor: "text-gray-700", borderColor: "border-gray-200", hoverColor: "hover:bg-gray-200", sortOrder: 17 },
      { label: "DNC", bgColor: "bg-gray-200", textColor: "text-gray-800", borderColor: "border-gray-300", hoverColor: "hover:bg-gray-300", sortOrder: 18 },
    ];

    for (const outcome of defaultOutcomes) {
      const existing = await this.getCallOutcome(outcome.label);
      if (!existing) {
        await db.insert(callOutcomes).values(outcome).onConflictDoNothing();
      }
    }
  }
}

export const storage = new DatabaseStorage();
