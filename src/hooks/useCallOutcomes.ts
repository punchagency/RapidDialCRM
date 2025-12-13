import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';
import type { CallOutcome } from '@/lib/types';

// Query keys
export const callOutcomeKeys = {
  all: ['callOutcomes'] as const,
  lists: () => [...callOutcomeKeys.all, 'list'] as const,
  list: () => [...callOutcomeKeys.lists()] as const,
  details: () => [...callOutcomeKeys.all, 'detail'] as const,
  detail: (id: string) => [...callOutcomeKeys.details(), id] as const,
};

// Get all call outcomes
export function useCallOutcomes() {
  return useQuery({
    queryKey: callOutcomeKeys.list(),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getCallOutcomes();
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 300000, // 5 minutes (cached on backend)
  });
}

// Create call outcome mutation
export function useCreateCallOutcome() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<CallOutcome>) => {
      const { data: result, error } = await CustomServerApi.createCallOutcome(data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to create call outcome');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callOutcomeKeys.lists() });
    },
  });
}

// Update call outcome mutation
export function useUpdateCallOutcome() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CallOutcome> }) => {
      const { data: result, error } = await CustomServerApi.updateCallOutcome(id, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update call outcome');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: callOutcomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: callOutcomeKeys.detail(variables.id) });
    },
  });
}

// Delete call outcome mutation
export function useDeleteCallOutcome() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await CustomServerApi.deleteCallOutcome(id);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: callOutcomeKeys.lists() });
    },
  });
}

// Record call outcome (for prospect calls)
export function useRecordCallOutcome() {
  return useMutation({
    mutationFn: async ({ prospectId, callerId, outcome, notes }: { 
      prospectId: string; 
      callerId: string; 
      outcome: string; 
      notes?: string;
    }) => {
      const { data, error } = await CustomServerApi.recordCallOutcome(prospectId, callerId, outcome, notes);
      if (error) throw new Error(error);
      return data;
    },
  });
}


