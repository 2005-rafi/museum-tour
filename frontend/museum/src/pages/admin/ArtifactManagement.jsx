import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useArtifacts, useDeleteArtifact, useRestoreArtifact, useBatchDeleteArtifacts } from '../../hooks/useArtifacts';
import AdminTable   from '../../components/admin/AdminTable';
import Pagination   from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../utils/formatters';

const PAGE_SIZE = 20;

export default function ArtifactManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useArtifacts({ limit: PAGE_SIZE, page });
  const { mutate: deleteArtifact, isPending: deleting } = useDeleteArtifact();
  const { mutate: restoreArtifact } = useRestoreArtifact();
  const { mutate: batchDelete } = useBatchDeleteArtifacts();
  const { showToast, ToastContainer } = useToast();

  const artifacts  = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const [lightboxSrc, setLightboxSrc] = useState(null);

  const handleDelete = (artifact) =>
    deleteArtifact(artifact._id, {
      onSuccess: () => {
        showToast({
          message: `"${artifact.name}" deleted.`,
          onUndo: () => restoreArtifact(artifact._id),
        });
      },
    });

  const columns = [
    {
      key: 'image',
      label: '',
      width: '52px',
      sortable: false,
      searchable: false,
      render: (a) => {
        const src = a.imageUrl ?? a.images?.[0]?.url;
        return src
          ? <img src={src} alt={a.name} className="admin-table-thumb admin-table-thumb--clickable" onClick={(e) => { e.stopPropagation(); setLightboxSrc(src); }} />
          : <div className="admin-table-thumb-placeholder"><span className="material-icons-outlined">inventory_2</span></div>;
      },
    },
    { key: 'name',   label: 'Name' },
    { key: 'period', label: 'Period', render: (a) => a.historicalPeriod ?? '—' },
    { key: 'origin', label: 'Origin', render: (a) => a.origin ?? '—' },
    { key: 'culture', label: 'Culture', render: (a) => a.cultureOrCivilization ?? '—' },
    {
      key: 'status',
      label: 'Status',
      render: (a) => {
        const hasImage = !!(a.imageUrl || a.images?.[0]?.url);
        return (
          <span className={`admin-status-badge ${hasImage ? 'admin-status-badge--live' : 'admin-status-badge--draft'}`}>
            <span className="material-icons-outlined" style={{ fontSize: '0.85rem' }}>{hasImage ? 'check_circle' : 'pending'}</span>
            {hasImage ? 'Live' : 'Incomplete'}
          </span>
        );
      },
    },
    { key: 'createdAt', label: 'Added', render: (a) => formatDate(a.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (a) => (
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn--sm"
            onClick={() => navigate(`/admin/artifacts/${a._id}/edit`)}
          >
            Edit
          </button>
          <button
            className="admin-btn admin-btn--sm admin-btn--danger"
            onClick={() => handleDelete(a)}
            disabled={deleting}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Artifacts</h1>
          <p className="admin-page-subtitle">
            {total} artifact{total !== 1 ? 's' : ''} in the collection
          </p>
        </div>
        <Link to="/admin/artifacts/new" className="admin-btn admin-btn--primary">
          + Upload Artifact
        </Link>
      </div>

      <AdminTable
        columns={columns}
        rows={artifacts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No artifacts found."
        bulkActions={[
          { label: 'Delete Selected', icon: 'delete', variant: 'danger', onAction: (ids) => batchDelete(ids) },
        ]}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ToastContainer />

      {/* Image Lightbox */}
      {lightboxSrc && (
        <div className="admin-lightbox" onClick={() => setLightboxSrc(null)}>
          <button className="admin-lightbox-close" onClick={() => setLightboxSrc(null)}>
            <span className="material-icons-outlined">close</span>
          </button>
          <img src={lightboxSrc} alt="Artifact" className="admin-lightbox-img" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
