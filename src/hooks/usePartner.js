import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '../api/dbClient';
import { queryKeys } from '../api/queryKeys';

export const usePartner = () => {
  return useQuery({
    queryKey: queryKeys.partner.all,
    queryFn: () => base44.entities.Partner.list(),
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPartner) => base44.entities.Partner.create(newPartner),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partner.all });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => base44.entities.Partner.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partner.all });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partnerId) => base44.entities.Partner.delete(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partner.all });
    },
  });
};
