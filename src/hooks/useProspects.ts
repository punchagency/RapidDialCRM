import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';
import type { Prospect } from '@/lib/types';

// Query keys
export const prospectKeys = {
  all: ['prospects'] as const,
  lists: () => [...prospectKeys.all, 'list'] as const,
  list: (filters?: { territory?: string; limit?: number; offset?: number }) => 
    [...prospectKeys.lists(), filters] as const,
  details: () => [...prospectKeys.all, 'detail'] as const,
  detail: (id: string) => [...prospectKeys.details(), id] as const,
  byTerritory: (territory: string) => [...prospectKeys.all, 'territory', territory] as const,
};

// Get all prospects
export function useProspects(params?: { territory?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: prospectKeys.list(params),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getProspects(params);
      console.log("data", data);
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });
}

// Get single prospect
export function useProspect(id: string) {
  return useQuery({
    queryKey: prospectKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getProspect(id);
      if (error) throw new Error(error);
      if (!data) throw new Error('Prospect not found');
      return data;
    },
    enabled: !!id,
  });
}

// Get prospects by territory
export function useProspectsByTerritory(territory: string) {
  return useQuery({
    queryKey: prospectKeys.byTerritory(territory),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getProspectsByTerritory(territory);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!territory,
  });
}

// Create prospect mutation
export function useCreateProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Prospect>) => {
      const { data: result, error } = await CustomServerApi.createProspect(data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to create prospect');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prospectKeys.lists() });
    },
  });
}

// Update prospect mutation
export function useUpdateProspect() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prospect> }) => {
      const { data: result, error } = await CustomServerApi.updateProspect(id, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update prospect');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: prospectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: prospectKeys.detail(variables.id) });
    },
  });
}


