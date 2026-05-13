import React from 'react';

/**
 * @param {{ page: number, totalPages: number, onPageChange: (p:number) => void }} props
 */
function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  );

  const items = [];
  let prev = null;
  for (const p of visible) {
    if (prev !== null && p - prev > 1) {
      items.push(<span key={`ellipsis-${p}`} className="pagination-ellipsis">…</span>);
    }
    items.push(
      <button
        key={p}
        className={`pagination-btn${p === page ? ' pagination-btn--active' : ''}`}
        onClick={() => onPageChange(p)}
        aria-label={`Page ${p}`}
        aria-current={p === page ? 'page' : undefined}
      >
        {p}
      </button>
    );
    prev = p;
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn pagination-btn--nav"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <i className="fas fa-chevron-left" />
      </button>
      {items}
      <button
        className="pagination-btn pagination-btn--nav"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
}

export default Pagination;
