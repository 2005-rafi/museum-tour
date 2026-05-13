import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../services/adminService';
import { QUERY_KEYS } from '../utils/constants';

/**
 * Fetch paginated user list (admin only)
 */
export function useUsers(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Delete a user account (admin only)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] }),
  });
}

/**
 * Suspend or unsuspend a user (admin only)
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, suspended }) => adminService.suspendUser(id, suspended),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] }),
  });
}

/**
 * Fetch paginated comment list (admin only)
 */
export function useAdminComments(params = {}) {
  return useQuery({
    queryKey: ['admin-comments', params],
    queryFn: () => adminService.getComments(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Delete any comment (admin only)
 */
export function useAdminDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  });
}

/**
 * Bulk-delete comments (admin only)
 */
export function useAdminBulkDeleteComments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => adminService.bulkDeleteComments(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  });
}

/**
 * Fetch paginated likes list (admin only)
 */
export function useAdminLikes(params = {}) {
  return useQuery({
    queryKey: ['admin-likes', params],
    queryFn: () => adminService.getLikes(params),
    staleTime: 60 * 1000,
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────

/**
 * Fetch paginated message list (admin only)
 */
export function useAdminMessages(params = {}) {
  return useQuery({
    queryKey: ['admin-messages', params],
    queryFn: () => adminService.getMessages(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch unread message count (admin sidebar badge)
 */
export function useUnreadMessageCount() {
  return useQuery({
    queryKey: ['admin-messages-unread'],
    queryFn: () => adminService.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Update a message's status (admin only)
 */
export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => adminService.updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread'] });
    },
  });
}

/**
 * Delete a message (admin only)
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-messages-unread'] });
    },
  });
}
