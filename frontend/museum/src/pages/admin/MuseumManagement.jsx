import React, { useState } from 'react';
import {
  useMuseums,
  useCreateMuseum,
  useUpdateMuseum,
  useDeleteMuseum,
  useRestoreMuseum,
} from '../../hooks/useMuseums';
import AdminTable  from '../../components/admin/AdminTable';
import Drawer       from '../../components/admin/Drawer';
import MuseumForm  from '../../components/admin/MuseumForm';
import Pagination  from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatLocation } from '../../utils/formatters';

const PAGE_SIZE = 20;

export default function MuseumManagement() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useMuseums({ limit: PAGE_SIZE, page });
  const { mutate: createMuseum, isPending: creating } = useCreateMuseum();
  const { mutate: updateMuseum, isPending: updating } = useUpdateMuseum();
  const { mutate: deleteMuseum, isPending: deleting } = useDeleteMuseum();
  const { mutate: restoreMuseum } = useRestoreMuseum();
  const { showToast, ToastContainer } = useToast();

  const museums    = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  // mode: null | 'create' | { museum: <object> }
  const [mode, setMode]             = useState(null);

  const handleCreate = (payload) =>
    createMuseum(payload, { onSuccess: () => setMode(null) });

  const handleUpdate = (payload) =>
    updateMuseum(
      { id: mode.museum._id, data: payload },
      { onSuccess: () => setMode(null) },
    );

  const handleDelete = (museum) =>
    deleteMuseum(museum._id, {
      onSuccess: () => {
        showToast({
          message: `"${museum.name}" deleted.`,
          onUndo: () => restoreMuseum(museum._id),
        });
      },
    });

  const columns = [
    { key: 'name',      label: 'Name' },
    { key: 'location',  label: 'Location', render: (m) => formatLocation(m.location) },
    { key: 'type',      label: 'Type',     render: (m) => m.museumType || '\u2014' },
    { key: 'established', label: 'Est.', render: (m) => m.establishedYear ?? '\u2014' },
    { key: 'createdAt', label: 'Added',    render: (m) => formatDate(m.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (m) => (
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn--sm"
            onClick={() => setMode({ museum: m })}
          >
            Edit
          </button>
          <button
            className="admin-btn admin-btn--sm admin-btn--danger"
            onClick={() => handleDelete(m)}
            disabled={deleting}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const isFormOpen = mode === 'create' || (mode && mode.museum);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Museums</h1>
          <p className="admin-page-subtitle">
            {total} museum{total !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setMode('create')}
        >
          + Add Museum
        </button>
      </div>

      {/* Slide-out drawer for create / edit */}
      <Drawer
        isOpen={isFormOpen}
        title={mode === 'create' ? 'New Museum' : `Edit: ${mode?.museum?.name ?? ''}`}
        onClose={() => setMode(null)}
      >
        <MuseumForm
          initial={mode !== 'create' ? mode?.museum : undefined}
          onSubmit={mode === 'create' ? handleCreate : handleUpdate}
          isPending={creating || updating}
          onCancel={() => setMode(null)}
        />
      </Drawer>

      <AdminTable
        columns={columns}
        rows={museums}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No museums found. Click '+ Add Museum' to create one."
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ToastContainer />
    </div>
  );
}
