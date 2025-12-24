import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomServerApi } from '@/integrations/custom-server/api';
import type { User } from '@/lib/types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  byEmail: (email: string) => [...userKeys.all, 'email', email] as const,
  territories: (id: string) => [...userKeys.detail(id), 'territories'] as const,
  professions: (id: string) => [...userKeys.detail(id), 'professions'] as const,
  assignments: (id: string) => [...userKeys.detail(id), 'assignments'] as const,
};

// Get all users
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getUsers();
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 60000, // 1 minute
  });
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getUser(id);
      if (error) throw new Error(error);
      if (!data) throw new Error('User not found');
      return data;
    },
    enabled: !!id,
  });
}

// Get user by email
export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: userKeys.byEmail(email),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getUserByEmail(email);
      if (error) throw new Error(error);
      if (!data) throw new Error('User not found');
      return data;
    },
    enabled: !!email,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const { data: result, error } = await CustomServerApi.createUser(data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to create user');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const { data: result, error } = await CustomServerApi.updateUser(id, data);
      if (error) throw new Error(error);
      if (!result) throw new Error('Failed to update user');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await CustomServerApi.deleteUser(id);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Get user territories
export function useUserTerritories(userId: string) {
  return useQuery({
    queryKey: userKeys.territories(userId),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getUserTerritories(userId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!userId,
  });
}

// Set user territories mutation
export function useSetUserTerritories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, territories }: { userId: string; territories: string[] }) => {
      const { data, error } = await CustomServerApi.setUserTerritories(userId, territories);
      if (error) throw new Error(error);
      return data || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.territories(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.assignments(variables.userId) });
    },
  });
}

// Get user professions
export function useUserProfessions(userId: string) {
  return useQuery({
    queryKey: userKeys.professions(userId),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getUserProfessions(userId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!userId,
  });
}

// Set user professions mutation
export function useSetUserProfessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, professions }: { userId: string; professions: string[] }) => {
      const { data, error } = await CustomServerApi.setUserProfessions(userId, professions);
      if (error) throw new Error(error);
      return data || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.professions(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.assignments(variables.userId) });
    },
  });
}

// Get user assignments
export function useUserAssignments(userId: string) {
  return useQuery({
    queryKey: userKeys.assignments(userId),
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getUserAssignments(userId);
      if (error) throw new Error(error);
      if (!data) throw new Error('Failed to fetch assignments');
      return data;
    },
    enabled: !!userId,
  });
}

// Set user assignments mutation
export function useSetUserAssignments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, assignments }: { userId: string; assignments: { territories: string[]; professions: string[] } }) => {
      const { data, error } = await CustomServerApi.setUserAssignments(userId, assignments);
      if (error) throw new Error(error);
      if (!data) throw new Error('Failed to update assignments');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.assignments(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.territories(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.professions(variables.userId) });
    },
  });
}

// Get all territories
export function useAllTerritories() {
  return useQuery({
    queryKey: ['territories'],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getAllTerritories();
      if (error) throw new Error(error);
      const territories = data?.map((territory: any) => territory.name) || [];
      return territories;
    },
    staleTime: 300000, // 5 minutes
  });
}

// Get all professions
export function useAllProfessions() {
  return useQuery({
    queryKey: ['professions'],
    queryFn: async () => {
      const { data, error } = await CustomServerApi.getAllProfessions();
      if (error) throw new Error(error);
      const professions = data?.map((profession: any) => profession.name) || [];
      return professions;
    },
    staleTime: 300000, // 5 minutes
  });
}


