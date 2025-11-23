import { type Prospect, type InsertProspect, type FieldRep, type InsertFieldRep, type Appointment, type InsertAppointment, type Stakeholder, type InsertStakeholder, type User, type InsertUser, prospects, fieldReps, appointments, callHistory, stakeholders, users } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
