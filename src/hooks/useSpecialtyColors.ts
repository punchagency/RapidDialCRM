import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';
import type { SpecialtyColor } from '@/lib/types';

// Query keys
export const specialtyColorKeys = {
  all: ['specialtyColors'] as const,
  lists: () => [...specialtyColorKeys.all, 'list'] as const,
  list: () => [...specialtyColorKeys.lists()] as const,
  details: () => [...specialtyColorKeys.all, 'detail'] as const,
  detail: (specialty: string) => [...specialtyColorKeys.details(), specialty] as const,
};

// Get all specialty colors
export function useSpecialtyColors() {
  return useQuery({
    queryKey: specialtyColorKeys.list(),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getSpecialtyColors();
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 300000, // 5 minutes (cached on backend)
  });
}

// Get single specialty color
export function useSpecialtyColor(specialty: string) {
  return useQuery({
    queryKey: specialtyColorKeys.detail(specialty),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getSpecialtyColor(specialty);
      if (error) throw new Error(error);
      if (!data) throw new Error('Specialty color not found');
      return data;
    },
    enabled: !!specialty,
  });
}

// Update specialty color mutation
export function useUpdateSpecialtyColor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ specialty, data }: { specialty: string; data: Partial<SpecialtyColor> }) => {
      const { data: result, error } = await CustomServerApi.updateSpecialtyColor(specialty, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update specialty color');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: specialtyColorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: specialtyColorKeys.detail(variables.specialty) });
    },
  });
}


