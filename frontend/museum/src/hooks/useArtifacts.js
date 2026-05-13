import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import artifactService from '../services/artifactService';
import { QUERY_KEYS } from '../utils/constants';

/**
 * Fetch paginated artifact list
 */
export function useArtifacts(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.ARTIFACTS, params],
    queryFn: () => artifactService.getArtifacts(params),
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Fetch a single artifact by ID
 */
export function useArtifactDetail(id) {
  return useQuery({
    queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, id],
    queryFn: () => artifactService.getArtifactById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Fetch comments for an artifact
 */
export function useArtifactComments(artifactId) {
  return useQuery({
    queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, artifactId, 'comments'],
    queryFn: () => artifactService.getComments(artifactId),
    enabled: !!artifactId,
    staleTime: 60 * 1000,
  });
}

/**
 * Toggle like – optimistic update
 */
export function useLikeArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isLiked }) =>
      isLiked ? artifactService.unlikeArtifact(id) : artifactService.likeArtifact(id),
    onMutate: async ({ id, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, id] });
      const previous = queryClient.getQueryData([QUERY_KEYS.ARTIFACT_DETAIL, id]);
      queryClient.setQueryData([QUERY_KEYS.ARTIFACT_DETAIL, id], (old) =>
        old
          ? {
              ...old,
              isLiked: !isLiked,
              likesCount: isLiked
                ? Math.max(0, (old.likesCount || 0) - 1)
                : (old.likesCount || 0) + 1,
            }
          : old
      );
      return { previous };
    },
    onError: (_, { id }, context) => {
      queryClient.setQueryData([QUERY_KEYS.ARTIFACT_DETAIL, id], context?.previous);
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, id] });
    },
  });
}

/**
 * Add comment – with optimistic insert so the comment appears instantly.
 * Pass { artifactId, text, user } from the page component to populate the
 * temp comment's author info while the request is in-flight.
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ artifactId, text }) => artifactService.addComment(artifactId, text),
    onMutate: async ({ artifactId, text, user: commentUser }) => {
      const commentsKey = [QUERY_KEYS.ARTIFACT_DETAIL, artifactId, 'comments'];
      await queryClient.cancelQueries({ queryKey: commentsKey });
      const previous = queryClient.getQueryData(commentsKey);
      queryClient.setQueryData(commentsKey, (old) => {
        if (!old) return old;
        const tempComment = {
          _id: `opt_${Date.now()}`,
          commentText: text,
          createdAt: new Date().toISOString(),
          userId: commentUser
            ? { _id: commentUser._id, name: commentUser.name }
            : null,
        };
        return { ...old, data: [...(old.data ?? []), tempComment] };
      });
      return { previous };
    },
    onError: (_, { artifactId }, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData([QUERY_KEYS.ARTIFACT_DETAIL, artifactId, 'comments'], context.previous);
      }
    },
    onSettled: (_, __, { artifactId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, artifactId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_COMMENTS] });
    },
  });
}

/**
 * Edit comment
 */
export function useEditComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, text }) => artifactService.editComment(commentId, text),
    onSuccess: (_, { artifactId }) => {
      if (artifactId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, artifactId] });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_COMMENTS] });
    },
  });
}

/**
 * Delete comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }) => artifactService.deleteComment(commentId),
    onSuccess: (_, { artifactId }) => {
      if (artifactId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, artifactId] });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_COMMENTS] });
    },
  });
}

/**
 * Admin – create artifact
 */
export function useCreateArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => artifactService.createArtifact(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACTS] }),
  });
}

/**
 * Admin – update artifact
 */
export function useUpdateArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => artifactService.updateArtifact(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACT_DETAIL, id] });
    },
  });
}

/**
 * Admin -- delete artifact
 */
export function useDeleteArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => artifactService.deleteArtifact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACTS] }),
  });
}

/**
 * Admin -- restore a soft-deleted artifact (undo)
 */
export function useRestoreArtifact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => artifactService.restoreArtifact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MUSEUM_ARTIFACTS] });
    },
  });
}

/**
 * Admin – batch delete artifacts
 */
export function useBatchDeleteArtifacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => artifactService.batchDelete(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ARTIFACTS] }),
  });
}
