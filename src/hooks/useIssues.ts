import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';

// Query keys
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (status?: string) => [...issueKeys.lists(), status] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: string) => [...issueKeys.details(), id] as const,
};

// Get all issues
export function useIssues(status?: string) {
  return useQuery({
    queryKey: issueKeys.list(status),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getIssues(status);
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });
}

// Get single issue
export function useIssue(id: string) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getIssue(id);
      if (error) throw new Error(error);
      if (!data) throw new Error('Issue not found');
      return data;
    },
    enabled: !!id,
  });
}

// Create issue mutation
export function useCreateIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<any>) => {
      const { data: result, error } = await CustomServerApi.createIssue(data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to create issue');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}

// Update issue mutation
export function useUpdateIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<any> }) => {
      const { data: result, error } = await CustomServerApi.updateIssue(id, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update issue');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(variables.id) });
    },
  });
}

// Delete issue mutation
export function useDeleteIssue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await CustomServerApi.deleteIssue(id);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}


