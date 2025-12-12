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
  const response = await ProspectServices.fetchProspects(
    territory,
    limit,
    offset
  );
  return response.data.data || response.data;
}

export async function getProspect(id: string): Promise<Prospect> {
  const response = await ProspectServices.getProspect(id);
  return response.data;
}

export async function updateProspect(
  id: string,
  data: Partial<Prospect>
): Promise<Prospect> {
  const response = await ProspectServices.updateProspect(id, data);
  return response.data;
}

export async function getCallingList(fieldRepId: string): Promise<Prospect[]> {
  const response = await ProspectServices.getCallingList(fieldRepId);
  return response.data.prospects || [];
}

export async function recordCallOutcome(
  prospectId: string,
  outcome: string,
  notes?: string
): Promise<void> {
  await CallServices.recordCallOutcome(prospectId, outcome, notes);
}

export async function listFieldReps(): Promise<FieldRep[]> {
  const response = await FieldRepServices.listFieldReps();
  return response.data;
}

export async function listAppointments(
  fieldRepId: string,
  date: string
): Promise<Appointment[]> {
  const response = await AppointmentServices.listAppointments(fieldRepId, date);
  return response.data;
}
