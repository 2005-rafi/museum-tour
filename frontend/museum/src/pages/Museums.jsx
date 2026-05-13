import React, { useState } from 'react';
import { useMuseums } from '../hooks/useMuseums';
import { useMuseumFilters } from '../context/MuseumContext';
import MuseumCard from '../components/cards/MuseumCard';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import '../styles/museums.css';

const PAGE_SIZE = 12;

function Museums() {
  // Filter state lives in MuseumContext so it persists across navigation
  const { search, debouncedSearch, setSearch, reset } = useMuseumFilters();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useMuseums(
    debouncedSearch
      ? { search: debouncedSearch, limit: PAGE_SIZE, page }
      : { limit: PAGE_SIZE, page }
  );

  const museums    = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  // Reset to page 1 when search changes
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="museums-page">
      <div className="museums-header">
        <h1>World-Class Museums</h1>
        <p>Explore our curated selection of prestigious museums from around the globe</p>
        <div className="museums-search">
          <input
            type="search"
            className="museums-search-input"
            placeholder="Search museums by name or location…"
            value={search}
            onChange={handleSearch}
            aria-label="Search museums"
          />
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorMessage message={error?.message} onRetry={refetch} />}

      {!isLoading && !isError && museums.length === 0 && (
        <EmptyState
          icon="fas fa-landmark"
          title="No museums found"
          message={search ? `No results for "${search}". Try a different search.` : 'No museums available yet.'}
          action={search ? { label: 'Clear Search', onClick: reset } : undefined}
        />
      )}

      {!isLoading && museums.length > 0 && (
        <>
          <div className="museums-grid">
            {museums.map((museum) => (
              <MuseumCard key={museum._id} museum={museum} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default Museums;
