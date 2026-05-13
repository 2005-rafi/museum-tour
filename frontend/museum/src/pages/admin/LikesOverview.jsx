import React, { useState } from 'react';
import { useAdminLikes } from '../../hooks/useAdmin';
import AdminTable from '../../components/admin/AdminTable';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

export default function LikesOverview() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminLikes({ page, limit: 50 });

  const likes = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (l) => (
        <div>
          <span className="admin-comment-user-name">{l.userId?.name ?? '—'}</span>
          <br />
          <span className="admin-comment-user-email">{l.userId?.email ?? ''}</span>
        </div>
      ),
    },
    {
      key: 'artifact',
      label: 'Artifact',
      render: (l) => {
        const src = l.artifactId?.images?.[0]?.url;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {src
              ? <img src={src} alt="" className="admin-table-thumb" />
              : <div className="admin-table-thumb-placeholder"><span className="material-icons-outlined">inventory_2</span></div>
            }
            <span>{l.artifactId?.name ?? '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Liked On',
      render: (l) => (
        <span title={formatDate(l.createdAt)}>
          {formatRelativeTime(l.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Likes</h1>
          <p className="admin-page-subtitle">
            {data?.total ?? 0} like{(data?.total ?? 0) !== 1 ? 's' : ''} across all artifacts
          </p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={likes}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No likes found."
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
    </div>
  );
}
