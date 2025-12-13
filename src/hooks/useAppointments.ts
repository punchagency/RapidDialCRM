import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (fieldRepId?: string, date?: string) => [...appointmentKeys.lists(), fieldRepId, date] as const,
  today: (territory?: string) => [...appointmentKeys.all, 'today', territory] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

// Get today's appointments
export function useTodayAppointments(territory?: string) {
  return useQuery({
    queryKey: appointmentKeys.today(territory),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getTodayAppointments(territory);
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });
}

// Get appointments by field rep and date
export function useAppointmentsByFieldRepAndDate(fieldRepId: string, date: string) {
  return useQuery({
    queryKey: appointmentKeys.list(fieldRepId, date),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getAppointmentsByFieldRepAndDate(fieldRepId, date);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!fieldRepId && !!date,
  });
}

// Create appointment mutation
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<any>) => {
      const { data: result, error } = await CustomServerApi.createAppointment(data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to create appointment');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

// Update appointment mutation
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      const { data: result, error } = await CustomServerApi.updateAppointment(id, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update appointment');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
    },
  });
}

