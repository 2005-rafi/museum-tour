import React, { useState } from 'react';
import {
  useAdminMessages,
  useUpdateMessageStatus,
  useDeleteMessage,
} from '../../hooks/useAdmin';
import AdminTable   from '../../components/admin/AdminTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Drawer       from '../../components/admin/Drawer';
import Pagination   from '../../components/ui/Pagination';
import { formatDate, formatRelativeTime, truncate } from '../../utils/formatters';

const PAGE_SIZE = 20;

const STATUS_CONFIG = {
  unread:   { label: 'Unread',   cls: 'admin-msg-badge--unread' },
  read:     { label: 'Read',     cls: 'admin-msg-badge--read' },
  resolved: { label: 'Resolved', cls: 'admin-msg-badge--resolved' },
};

export default function MessageInbox() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminMessages({ limit: PAGE_SIZE, page });
  const { mutate: updateStatus } = useUpdateMessageStatus();
  const { mutate: deleteMessage, isPending: deleting } = useDeleteMessage();

  const messages   = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  const [selected, setSelected]     = useState(null);   // message for drawer
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = () =>
    deleteMessage(deleteTarget._id, { onSuccess: () => { setDeleteTarget(null); if (selected?._id === deleteTarget._id) setSelected(null); } });

  const handleStatusChange = (id, status) => {
    updateStatus({ id, status });
    // Optimistically update selected drawer
    if (selected?._id === id) setSelected((prev) => ({ ...prev, status }));
  };

  const openMessage = (msg) => {
    setSelected(msg);
    // Auto-mark as read if unread
    if (msg.status === 'unread') {
      updateStatus({ id: msg._id, status: 'read' });
      setSelected({ ...msg, status: 'read' });
    }
  };

  const columns = [
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (m) => {
        const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.unread;
        return <span className={`admin-msg-badge ${cfg.cls}`}>{cfg.label}</span>;
      },
    },
    { key: 'createdAt', label: 'Date',    render: (m) => formatRelativeTime(m.createdAt) },
    { key: 'name',      label: 'Sender' },
    { key: 'subject',   label: 'Subject', render: (m) => truncate(m.subject, 50) },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (m) => (
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn--sm"
            onClick={(e) => { e.stopPropagation(); openMessage(m); }}
          >
            View
          </button>
          <button
            className="admin-btn admin-btn--sm admin-btn--danger"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }}
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
          <h1 className="admin-page-title">Inbox</h1>
          <p className="admin-page-subtitle">
            {total} message{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={messages}
        isLoading={isLoading}
        isError={isError}
        error={error}
        emptyMessage="No messages yet."
        onRowClick={openMessage}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Message detail drawer */}
      <Drawer
        isOpen={!!selected}
        title="Message Detail"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="admin-msg-detail">
            <div className="admin-msg-detail-meta">
              <div className="admin-msg-detail-row">
                <span className="admin-msg-detail-label">From</span>
                <span>{selected.name}</span>
              </div>
              <div className="admin-msg-detail-row">
                <span className="admin-msg-detail-label">Email</span>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </div>
              <div className="admin-msg-detail-row">
                <span className="admin-msg-detail-label">Date</span>
                <span>{formatDate(selected.createdAt)}</span>
              </div>
              <div className="admin-msg-detail-row">
                <span className="admin-msg-detail-label">Status</span>
                <span className={`admin-msg-badge ${(STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.unread).cls}`}>
                  {(STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.unread).label}
                </span>
              </div>
            </div>

            <h3 className="admin-msg-detail-subject">{selected.subject}</h3>
            <p className="admin-msg-detail-content">{selected.content}</p>

            <div className="admin-msg-detail-actions">
              {selected.status !== 'read' && (
                <button
                  className="admin-btn admin-btn--sm"
                  onClick={() => handleStatusChange(selected._id, 'read')}
                >
                  <span className="material-icons-outlined" style={{ fontSize: '1rem', marginRight: '0.3rem' }}>mark_email_read</span>
                  Mark as Read
                </button>
              )}
              {selected.status !== 'resolved' && (
                <button
                  className="admin-btn admin-btn--sm admin-btn--success"
                  onClick={() => handleStatusChange(selected._id, 'resolved')}
                >
                  <span className="material-icons-outlined" style={{ fontSize: '1rem', marginRight: '0.3rem' }}>check_circle</span>
                  Mark as Resolved
                </button>
              )}
              <button
                className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => { setDeleteTarget(selected); }}
              >
                <span className="material-icons-outlined" style={{ fontSize: '1rem', marginRight: '0.3rem' }}>delete</span>
                Delete
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Message"
        message={`Delete message from "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleting}
      />
    </div>
  );
}
