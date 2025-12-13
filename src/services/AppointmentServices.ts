import https from "@/services/http";
import { Appointment } from "@/lib/types";

export const listAppointments = (fieldRepId: string, date: string) => {
  return https.get<Appointment[]>(`/appointments/${fieldRepId}/${date}`);
};
