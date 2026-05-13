import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import MuseumCard from '../components/cards/MuseumCard';
import ArtifactCard from '../components/cards/ArtifactCard';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import '../styles/artifacts.css';

const TABS = ['all', 'museums', 'artifacts'];

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);
  const [tab, setTab] = useState('all');

  // Sync input if URL query changes (e.g. from Navbar search)
  useEffect(() => {
    setInput(query);
  }, [query]);

  const { data, isLoading, isError, error } = useSearch(query);

  const museums = Array.isArray(data?.museums) ? data.museums : [];
  const artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];
  const total = museums.length + artifacts.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) setSearchParams({ q: trimmed });
  };

  const visibleMuseums = tab === 'artifacts' ? [] : museums;
  const visibleArtifacts = tab === 'museums' ? [] : artifacts;

  return (
    <div className="search-page">
      <div className="search-page-header">
        <h1>Search</h1>

        <form className="search-page-form" onSubmit={handleSubmit} role="search">
          <input
            type="search"
            className="search-page-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search museums, artifacts…"
            aria-label="Search"
            autoFocus
          />
          <button type="submit" className="search-page-btn">
            <i className="fas fa-search" aria-hidden="true" /> Search
          </button>
        </form>
      </div>

      {query && (
        <>
          {/* Tabs */}
          <div className="search-tabs" role="tablist" aria-label="Result type">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                className={`search-tab-btn${tab === t ? ' active' : ''}`}
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t === 'all' && `All (${total})`}
                {t === 'museums' && `Museums (${museums.length})`}
                {t === 'artifacts' && `Artifacts (${artifacts.length})`}
              </button>
            ))}
          </div>

          {isLoading && <Spinner />}
          {isError && <ErrorMessage message={error?.message} />}

          {!isLoading && !isError && total === 0 && (
            <EmptyState
              icon="fas fa-search"
              title="No results found"
              message={`Nothing matched "${query}". Try a different search.`}
            />
          )}

          {!isLoading && !isError && (
            <div className="search-results">
              {visibleMuseums.length > 0 && (
                <section className="search-section">
                  <h2 className="search-section-title">Museums</h2>
                  <div className="museums-grid">
                    {visibleMuseums.map((museum) => (
                      <MuseumCard key={museum._id} museum={museum} />
                    ))}
                  </div>
                </section>
              )}

              {visibleArtifacts.length > 0 && (
                <section className="search-section">
                  <h2 className="search-section-title">Artifacts</h2>
                  <div className="artifacts-grid">
                    {visibleArtifacts.map((artifact) => (
                      <ArtifactCard key={artifact._id} artifact={artifact} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {!query && (
        <EmptyState
          icon="fas fa-search"
          title="Start searching"
          message="Enter a keyword above to find museums and artifacts."
        />
      )}
    </div>
  );
}

export default Search;
