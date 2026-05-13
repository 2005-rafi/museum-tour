import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';
import { QUERY_KEYS } from '../utils/constants';
import { useAuthContext } from '../context/AuthContext';

// Re-export named hooks from useAuth for backwards compatibility
export { useAuthActions, useAuthState } from './useAuth';

/**
 * Fetch logged-in user's full profile
 */
export function useProfile() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch liked artifacts for the current user
 */
export function useLikedArtifacts(params = {}) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: [QUERY_KEYS.LIKED_ARTIFACTS, params],
    queryFn: () => userService.getLikedArtifacts(params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch comments made by the current user
 */
export function useUserComments(params = {}) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: [QUERY_KEYS.USER_COMMENTS, params],
    queryFn: () => userService.getUserComments(params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}
