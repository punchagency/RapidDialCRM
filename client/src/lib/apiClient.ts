import { Prospect, FieldRep, Appointment } from "@shared/schema";

const API_BASE = "";

export async function fetchProspects(territory?: string): Promise<Prospect[]> {
  const url = territory ? `/api/prospects?territory=${territory}` : "/api/prospects";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch prospects");
  return response.json();
}

export async function getProspect(id: string): Promise<Prospect> {
  const response = await fetch(`/api/prospects/${id}`);
  if (!response.ok) throw new Error("Failed to fetch prospect");
  return response.json();
}

export async function updateProspect(id: string, data: Partial<Prospect>): Promise<Prospect> {
  const response = await fetch(`/api/prospects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update prospect");
  return response.json();
}

export async function getCallingList(fieldRepId: string): Promise<Prospect[]> {
  const response = await fetch(`/api/calling-list/${fieldRepId}`);
  if (!response.ok) throw new Error("Failed to fetch calling list");
  const data = await response.json();
  return data.prospects || [];
}

export async function recordCallOutcome(prospectId: string, outcome: string, notes?: string): Promise<void> {
  const response = await fetch("/api/call-outcome", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospectId, callerId: "current-user", outcome, notes }),
  });
  if (!response.ok) throw new Error("Failed to record call outcome");
}

export async function listFieldReps(): Promise<FieldRep[]> {
  const response = await fetch("/api/field-reps");
  if (!response.ok) throw new Error("Failed to fetch field reps");
  return response.json();
}

export async function listAppointments(fieldRepId: string, date: string): Promise<Appointment[]> {
  const response = await fetch(`/api/appointments/${fieldRepId}/${date}`);
  if (!response.ok) throw new Error("Failed to fetch appointments");
  return response.json();
}
