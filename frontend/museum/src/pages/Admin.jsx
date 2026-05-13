import React, { useState } from 'react';
import {
  useMuseums, useCreateMuseum, useUpdateMuseum, useDeleteMuseum,
} from '../hooks/useMuseums';
import {
  useArtifacts, useCreateArtifact, useUpdateArtifact, useDeleteArtifact,
} from '../hooks/useArtifacts';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { formatDate } from '../utils/formatters';
import '../styles/profile.css';

const TABS = ['museums', 'artifacts'];

function ConfirmButton({ onConfirm, isPending, children }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <>
        <button className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? '…' : 'Confirm'}
        </button>
        <button className="admin-btn" onClick={() => setConfirming(false)}>Cancel</button>
      </>
    );
  }
  return (
    <button className="admin-btn admin-btn--danger" onClick={() => setConfirming(true)}>
      {children}
    </button>
  );
}

function MuseumsTab() {
  const { data, isLoading, isError, error } = useMuseums({ limit: 50 });
  const { mutate: deleteMuseum, isPending: deleting } = useDeleteMuseum();
  const museums = data?.items ?? [];

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {museums.length === 0 && (
            <tr><td colSpan={4} className="admin-empty">No museums found.</td></tr>
          )}
          {museums.map((m) => (
            <tr key={m._id}>
              <td>{m.name}</td>
              <td>{m.location?.city ?? '—'}</td>
              <td>{formatDate(m.createdAt)}</td>
              <td className="admin-actions">
                <ConfirmButton onConfirm={() => deleteMuseum(m._id)} isPending={deleting}>
                  Delete
                </ConfirmButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArtifactsTab() {
  const { data, isLoading, isError, error } = useArtifacts({ limit: 50 });
  const { mutate: deleteArtifact, isPending: deleting } = useDeleteArtifact();
  const artifacts = data?.items ?? [];

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message={error?.message} />;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Period</th>
            <th>Origin</th>
            <th>Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {artifacts.length === 0 && (
            <tr><td colSpan={5} className="admin-empty">No artifacts found.</td></tr>
          )}
          {artifacts.map((a) => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.period ?? '—'}</td>
              <td>{a.origin ?? '—'}</td>
              <td>{formatDate(a.createdAt)}</td>
              <td className="admin-actions">
                <ConfirmButton onConfirm={() => deleteArtifact(a._id)} isPending={deleting}>
                  Delete
                </ConfirmButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Admin() {
  const [tab, setTab] = useState('museums');

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage museums and artifacts in the collection.</p>
      </div>

      <div className="profile-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            className={`profile-tab-btn${tab === t ? ' active' : ''}`}
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="profile-panel">
        {tab === 'museums' && <MuseumsTab />}
        {tab === 'artifacts' && <ArtifactsTab />}
      </div>
    </div>
  );
}

export default Admin;
