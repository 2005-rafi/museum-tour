import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateArtifact } from '../../hooks/useArtifacts';
import ArtifactForm from '../../components/admin/ArtifactForm';

export default function ArtifactUpload() {
  const navigate = useNavigate();
  const { mutate: createArtifact, isPending } = useCreateArtifact();

  const handleSubmit = (payload) =>
    createArtifact(payload, {
      onSuccess: () => navigate('/admin/artifacts'),
    });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Upload Artifact</h1>
          <p className="admin-page-subtitle">Add a new artifact to the collection</p>
        </div>
      </div>

      <div className="admin-form-panel">
        <ArtifactForm
          onSubmit={handleSubmit}
          isPending={isPending}
          onCancel={() => navigate('/admin/artifacts')}
        />
      </div>
    </div>
  );
}
