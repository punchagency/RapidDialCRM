import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';
import type { FieldRep } from '@/lib/types';

// Query keys
export const fieldRepKeys = {
  all: ['fieldReps'] as const,
  lists: () => [...fieldRepKeys.all, 'list'] as const,
  list: () => [...fieldRepKeys.lists()] as const,
  details: () => [...fieldRepKeys.all, 'detail'] as const,
  detail: (id: string) => [...fieldRepKeys.details(), id] as const,
};

// Get all field reps
export function useFieldReps() {
  return useQuery({
    queryKey: fieldRepKeys.list(),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getFieldReps();
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 60000, // 1 minute
  });
}

// Create field rep mutation
export function useCreateFieldRep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<FieldRep>) => {
      const { data: result, error } = await CustomServerApi.createFieldRep(data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to create field rep');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldRepKeys.lists() });
    },
  });
}

// Update field rep mutation
export function useUpdateFieldRep() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FieldRep> }) => {
      const { data: result, error } = await CustomServerApi.updateFieldRep(id, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update field rep');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fieldRepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fieldRepKeys.detail(variables.id) });
    },
  });
}

// Get calling list for field rep
export function useCallingList(fieldRepId: string) {
  return useQuery({
    queryKey: ['callingList', fieldRepId],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getCallingList(fieldRepId);
      if (error) throw new Error(error);
      if (!data) throw new Error('Failed to fetch calling list');
      return data;
    },
    enabled: !!fieldRepId,
    staleTime: 30000, // 30 seconds
  });
}


