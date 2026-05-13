import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import museumService from '../services/museumService';
import { QUERY_KEYS } from '../utils/constants';

/**
 * Fetch paginated museum list
 */
export function useMuseums(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MUSEUMS, params],
    queryFn: () => museumService.getMuseums(params),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

/**
 * Fetch a single museum by ID
 */
export function useMuseumDetail(id) {
  return useQuery({
    queryKey: [QUERY_KEYS.MUSEUM_DETAIL, id],
    queryFn: () => museumService.getMuseumById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch artifacts belonging to a museum
 */
export function useMuseumArtifacts(museumId, params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.MUSEUM_ARTIFACTS, museumId, params],
    queryFn: () => museumService.getMuseumArtifacts(museumId, params),
    enabled: !!museumId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Admin – create museum
 */
export function useCreateMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => museumService.createMuseum(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MUSEUMS] }),
  });
}

/**
 * Admin – update museum
 */
export function useUpdateMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => museumService.updateMuseum(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MUSEUMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MUSEUM_DETAIL, id] });
    },
  });
}

/**
 * Admin -- delete museum
 */
export function useDeleteMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => museumService.deleteMuseum(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MUSEUMS] }),
  });
}

/**
 * Admin -- restore a soft-deleted museum (undo)
 */
export function useRestoreMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => museumService.restoreMuseum(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MUSEUMS] }),
  });
}
