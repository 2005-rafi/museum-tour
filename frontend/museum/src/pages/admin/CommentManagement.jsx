import React, { useState } from 'react';
import { useAdminComments, useAdminDeleteComment, useAdminBulkDeleteComments } from '../../hooks/useAdmin';
import AdminTable   from '../../components/admin/AdminTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export default function CommentManagement() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminComments({ page, limit: 50 });
  const { mutate: deleteComment, isPending: deleting } = useAdminDeleteComment();
  const { mutate: bulkDelete } = useAdminBulkDeleteComments();

  const comments = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = () =>
    deleteComment(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (c) => (
        <div>
          <span className="admin-comment-user-name">{c.userId?.name ?? '—'}</span>
          <br />
          <span className="admin-comment-user-email">{c.userId?.email ?? ''}</span>
        </div>
      ),
    },
    {
      key: 'artifact',
      label: 'Artifact',
      render: (c) => c.artifactId?.name ?? '—',
    },
    {
      key: 'commentText',
      label: 'Comment',
      render: (c) => (
        <span className="admin-comment-text" title={c.commentText}>
          {c.commentText?.length > 80 ? c.commentText.slice(0, 80) + '…' : c.commentText}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (c) => (
        <span title={formatDate(c.createdAt)}>
          {formatRelativeTime(c.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (c) => (
        <button
          className="admin-btn admin-btn--sm admin-btn--danger"
          onClick={() => setDeleteTarget(c)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Comments</h1>
          <p className="admin-page-subtitle">
            {data?.total ?? 0} comment{(data?.total ?? 0) !== 1 ? 's' : ''} across all artifacts
          </p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={comments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No comments found."
        bulkActions={[
          { label: 'Delete Selected', icon: 'delete', variant: 'danger', onAction: (ids) => bulkDelete(ids) },
        ]}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-btn admin-btn--sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="admin-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="admin-btn admin-btn--sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Comment"
        message={`Delete this comment by "${deleteTarget?.userId?.name ?? 'user'}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleting}
        confirmLabel="Delete"
      />
    </div>
  );
}
