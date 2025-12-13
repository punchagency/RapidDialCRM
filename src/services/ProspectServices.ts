import https from "@/services/http";
import { Prospect } from "@/lib/types";

export const fetchProspects = (
  territory?: string,
  limit: number = 100,
  offset: number = 0
) => {
  const params = new URLSearchParams();
  if (territory) params.append("territory", territory);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  return https.get<{ data: Prospect[] }>(`/prospects?${params.toString()}`);
};

export const getProspect = (id: string) => {
  return https.get<Prospect>(`/prospects/${id}`);
};

export const updateProspect = (id: string, data: Partial<Prospect>) => {
  return https.patch<Prospect>(`/prospects/${id}`, data);
};

export const getCallingList = (fieldRepId: string) => {
  return https.get<{ prospects: Prospect[] }>(`/calling-list/${fieldRepId}`);
};
