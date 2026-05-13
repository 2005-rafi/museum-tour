import React, { useState } from 'react';
import { useUsers, useDeleteUser, useSuspendUser } from '../../hooks/useAdmin';
import AdminTable   from '../../components/admin/AdminTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination   from '../../components/ui/Pagination';
import { formatDate } from '../../utils/formatters';

const PAGE_SIZE = 20;

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useUsers({ limit: PAGE_SIZE, page });
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();
  const { mutate: suspendUser, isPending: suspending } = useSuspendUser();

  const users      = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);

  const handleDelete = () =>
    deleteUser(deleteTarget._id, { onSuccess: () => setDeleteTarget(null) });

  const handleSuspend = () => {
    const isSuspended = !!(suspendTarget.lockUntil && new Date(suspendTarget.lockUntil) > new Date());
    suspendUser(
      { id: suspendTarget._id, suspended: !isSuspended },
      { onSuccess: () => setSuspendTarget(null) },
    );
  };

  const isUserSuspended = (u) =>
    !!(u.lockUntil && new Date(u.lockUntil) > new Date());

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (u) => u.name || '—',
    },
    {
      key: 'email',
      label: 'Email',
      render: (u) => u.email ?? '—',
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <span className={`admin-role-badge admin-role-badge--${u.role ?? 'user'}`}>
          {u.role ?? 'user'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <span className={`admin-role-badge ${isUserSuspended(u) ? 'admin-role-badge--suspended' : 'admin-role-badge--active'}`}>
          {isUserSuspended(u) ? 'Suspended' : 'Active'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (u) => formatDate(u.createdAt),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (u) => {
        const isAdminUser = u.role === 'admin' || u.role === 'super-admin';
        return (
          <div className="admin-actions">
            {!isAdminUser && (
              <button
                className={`admin-btn admin-btn--sm ${isUserSuspended(u) ? '' : 'admin-btn--danger'}`}
                onClick={() => setSuspendTarget(u)}
              >
                {isUserSuspended(u) ? 'Restore' : 'Suspend'}
              </button>
            )}
            {!isAdminUser && (
              <button
                className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => setDeleteTarget(u)}
              >
                Remove
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">
            {total} registered user{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={users}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No users found."
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Remove User"
        message={`Remove the account for "${deleteTarget?.email}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleting}
        confirmLabel="Remove"
      />

      <ConfirmModal
        isOpen={!!suspendTarget}
        title={isUserSuspended(suspendTarget ?? {}) ? 'Restore User' : 'Suspend User'}
        message={
          isUserSuspended(suspendTarget ?? {})
            ? `Restore access for "${suspendTarget?.email}"?`
            : `Suspend the account "${suspendTarget?.email}"? They will not be able to log in.`
        }
        onConfirm={handleSuspend}
        onCancel={() => setSuspendTarget(null)}
        isPending={suspending}
        confirmLabel={isUserSuspended(suspendTarget ?? {}) ? 'Restore' : 'Suspend'}
      />
    </div>
  );
}
