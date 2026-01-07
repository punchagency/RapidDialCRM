import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';
import type { Script } from '@/lib/types';

// Query keys
export const scriptKeys = {
 all: ['scripts'] as const,
 lists: () => [...scriptKeys.all, 'list'] as const,
 list: (profession?: string) => [...scriptKeys.lists(), profession] as const,
 details: () => [...scriptKeys.all, 'detail'] as const,
 detail: (id: string) => [...scriptKeys.details(), id] as const,
 default: (profession: string) => [...scriptKeys.all, 'default', profession] as const,
};

// Get all scripts
export function useScripts(profession?: string) {
 return useQuery({
  queryKey: scriptKeys.list(profession),
  queryFn: async () => {
   const { data, error } = await CustomServerApi.getScripts(profession);
   if (error) throw new Error(error);
   return (data || []) as Script[];
  },
  staleTime: 60000, // 1 minute
 });
}

// Get single script
export function useScript(id: string) {
 return useQuery({
  queryKey: scriptKeys.detail(id),
  queryFn: async () => {
   const { data, error } = await CustomServerApi.getScript(id);
   if (error) throw new Error(error);
   if (!data) throw new Error('Script not found');
   return data as Script;
  },
  enabled: !!id,
 });
}

// Get default script for profession
export function useDefaultScript(profession: string) {
 return useQuery({
  queryKey: scriptKeys.default(profession),
  queryFn: async () => {
   const { data, error } = await CustomServerApi.getDefaultScript(profession);
   if (error) throw new Error(error);
   if (!data) throw new Error('Default script not found');
   return data as Script;
  },
  enabled: !!profession,
 });
}

// Create script mutation
export function useCreateScript() {
 const queryClient = useQueryClient();

 return useMutation({
  mutationFn: async (data: Partial<Script>) => {
   const { data: result, error } = await CustomServerApi.createScript(data);
   if (error) throw new Error(error);
   if (!result) throw new Error('Failed to create script');
   return result as Script;
  },
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: scriptKeys.lists() });
  },
 });
}

// Update script mutation
export function useUpdateScript() {
 const queryClient = useQueryClient();

 return useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<Script> }) => {
   const { data: result, error } = await CustomServerApi.updateScript(id, data);
   if (error) throw new Error(error);
   if (!result) throw new Error('Failed to update script');
   return result as Script;
  },
  onSuccess: (_, variables) => {
   queryClient.invalidateQueries({ queryKey: scriptKeys.lists() });
   queryClient.invalidateQueries({ queryKey: scriptKeys.detail(variables.id) });
  },
 });
}

// Delete script mutation
export function useDeleteScript() {
 const queryClient = useQueryClient();

 return useMutation({
  mutationFn: async (id: string) => {
   const { data, error } = await CustomServerApi.deleteScript(id);
   if (error) throw new Error(error);
   return data;
  },
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: scriptKeys.lists() });
  },
 });
}

