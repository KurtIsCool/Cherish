import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '../api/dbClient';
import { queryKeys } from '../api/queryKeys';

export const useVaultItems = (filters) => {
  return useQuery({
    queryKey: queryKeys.vaultItems.list(filters),
    queryFn: () => base44.entities.VaultItem.list(filters),
  });
};

export const useCreateVaultItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newItem) => base44.entities.VaultItem.create(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaultItems.lists() });
    },
  });
};

export const useUpdateVaultItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => base44.entities.VaultItem.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaultItems.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vaultItems.detail(variables.id) });
    },
  });
};

export const useDeleteVaultItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => base44.entities.VaultItem.delete(itemId),
    onSuccess: (_, deletedItemId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaultItems.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.vaultItems.detail(deletedItemId) });
    },
  });
};
