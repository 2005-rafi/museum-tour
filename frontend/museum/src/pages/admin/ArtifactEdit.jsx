import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useArtifactDetail, useUpdateArtifact } from '../../hooks/useArtifacts';
import ArtifactForm  from '../../components/admin/ArtifactForm';
import Spinner       from '../../components/ui/Spinner';
import ErrorMessage  from '../../components/ui/ErrorMessage';

export default function ArtifactEdit() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const { data: artifact, isLoading, isError, error } = useArtifactDetail(id);
  const { mutate: updateArtifact, isPending } = useUpdateArtifact();

  const handleSubmit = (payload) =>
    updateArtifact(
      { id, data: payload },
      { onSuccess: () => navigate('/admin/artifacts') },
    );

  if (isLoading) return <Spinner fullPage />;
  if (isError)   return <ErrorMessage message={error?.message} />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Artifact</h1>
          <p className="admin-page-subtitle">{artifact?.name}</p>
        </div>
      </div>

      <div className="admin-form-panel">
        <ArtifactForm
          initial={artifact}
          onSubmit={handleSubmit}
          isPending={isPending}
          onCancel={() => navigate('/admin/artifacts')}
        />
      </div>
    </div>
  );
}
