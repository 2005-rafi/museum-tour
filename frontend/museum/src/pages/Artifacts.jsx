import React from 'react';
import { useArtifacts, useLikeArtifact } from '../hooks/useArtifacts';
import { useAuthState } from '../hooks/useUser';
import { useArtifactFilters } from '../context/ArtifactContext';
import ArtifactCard from '../components/cards/ArtifactCard';
import TagFilter from '../components/ui/TagFilter';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import '../styles/artifacts.css';

const PAGE_SIZE = 12;

const PERIOD_OPTIONS = [
  { value: 'ancient',       label: 'Ancient' },
  { value: 'medieval',      label: 'Medieval' },
  { value: 'renaissance',   label: 'Renaissance' },
  { value: 'modern',        label: 'Modern' },
  { value: 'contemporary',  label: 'Contemporary' },
];

function Artifacts() {
  // Filter state lives in ArtifactContext so it persists across navigation
  const {
    search,
    debouncedSearch,
    period,
    page,
    setSearch,
    setPeriod,
    setPage,
    reset,
  } = useArtifactFilters();

  const { data, isLoading, isError, error, refetch } = useArtifacts({
    search: debouncedSearch,
    period,
    limit: PAGE_SIZE,
    page,
  });

  const { isAuthenticated } = useAuthState();
  const { mutate: toggleLike } = useLikeArtifact();

  const artifacts  = data?.items ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.pages ?? Math.ceil(total / PAGE_SIZE);

  const handleLike = (id, isLiked) => {
    if (!isAuthenticated) return;
    toggleLike({ id, isLiked });
  };

  return (
    <div className="artifacts-page">
      <div className="museum-header">
        <h1>Artifacts Collection</h1>
        <p className="museum-description">
          Explore our diverse collection of historical artifacts from around the world
        </p>
      </div>

      {/* Filter bar */}
      <div className="artifacts-filter-bar">
        <input
          type="search"
          className="artifacts-filter-input"
          placeholder="Search artifacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search artifacts"
        />
        <TagFilter
          label="Period:"
          tags={PERIOD_OPTIONS}
          selected={period}
          onChange={setPeriod}
        />
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage message={error?.message} onRetry={refetch} />}

      {!isLoading && !isError && artifacts.length === 0 && (
        <EmptyState
          icon="fas fa-archive"
          title="No artifacts found"
          message="Try adjusting your filters or search."
          action={{ label: 'Clear Filters', onClick: reset }}
        />
      )}

      {!isLoading && artifacts.length > 0 && (
        <>
          <div className="artifacts-grid">
            {artifacts.map((artifact) => (
              <ArtifactCard
                key={artifact._id}
                artifact={artifact}
                isLiked={artifact.isLiked}
                onLike={isAuthenticated ? handleLike : undefined}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default Artifacts;
