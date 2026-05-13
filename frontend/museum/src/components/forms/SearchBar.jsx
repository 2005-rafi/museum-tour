import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SearchBar – standalone search input.
 * Submits on Enter or button click; navigates to /search?q=...
 */
function SearchBar({ initialValue = '', placeholder = 'Search museums and artifacts…', className = '' }) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  const submit = () => {
    const q = value.trim();
    if (q.length >= 2) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className={`search-bar ${className}`.trim()}>
      <div className="search-bar-inner">
        <i className="fas fa-search search-bar-icon" aria-hidden="true" />
        <input
          type="search"
          className="search-bar-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search"
        />
        <button className="search-bar-btn" onClick={submit} aria-label="Search">
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
