import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '../api/dbClient';
import { queryKeys } from '../api/queryKeys';

export const useMemories = (filters) => {
  return useQuery({
    queryKey: queryKeys.memories.list(filters),
    queryFn: () => base44.entities.Memory.list(filters),
  });
};

export const useCreateMemory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newMemory) => base44.entities.Memory.create(newMemory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.lists() });
    },
  });
};

export const useDeleteMemory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memoryId) => base44.entities.Memory.delete(memoryId),
    onSuccess: (_, deletedMemoryId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.memories.detail(deletedMemoryId) });
    },
  });
};
