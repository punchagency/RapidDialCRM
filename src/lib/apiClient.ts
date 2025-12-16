import { Prospect, FieldRep, Appointment } from "@/lib/types";
import * as ProspectServices from "@/services/ProspectServices";
import * as CallServices from "@/services/CallServices";
import * as FieldRepServices from "@/services/FieldRepServices";
import * as AppointmentServices from "@/services/AppointmentServices";

const API_BASE = "";

export async function fetchProspects(
  territory?: string,
  limit: number = 100,
  offset: number = 0
): Promise<Prospect[]> {
  try {
    const response = await ProspectServices.fetchProspects(
      territory,
      limit,
      offset
    );
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch prospects:", error);
    return [];
  }
}

export async function getProspect(id: string): Promise<Prospect | null> {
  try {
    const response = await ProspectServices.getProspect(id);
    return response.data;
  } catch (error) {
    console.error("Failed to get prospect:", error);
    return null;
  }
}

export async function updateProspect(
  id: string,
  data: Partial<Prospect>
): Promise<Prospect | null> {
  try {
    const response = await ProspectServices.updateProspect(id, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update prospect:", error);
    return null;
  }
}

export async function getCallingList(fieldRepId: string): Promise<Prospect[]> {
  try {
    const response = await ProspectServices.getCallingList(fieldRepId);
    return response.data.prospects || [];
  } catch (error) {
    console.error("Failed to get calling list:", error);
    return [];
  }
}

export async function recordCallOutcome(
  prospectId: string,
  outcome: string,
  notes?: string
): Promise<void> {
  try {
    await CallServices.recordCallOutcome(prospectId, outcome, notes);
  } catch (error) {
    console.error("Failed to record call outcome:", error);
  }
}

export async function listFieldReps(): Promise<FieldRep[]> {
  try {
    const response = await FieldRepServices.listFieldReps();
    return response.data || [];
  } catch (error) {
    console.error("Failed to list field reps:", error);
    return [];
  }
}

export async function listAppointments(
  fieldRepId: string,
  date: string
): Promise<Appointment[]> {
  try {
    const response = await AppointmentServices.listAppointments(fieldRepId, date);
    return response.data || [];
  } catch (error) {
    console.error("Failed to list appointments:", error);
    return [];
  }
}
