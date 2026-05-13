import React, { useState, useMemo, useCallback } from 'react';
import Spinner from '../ui/Spinner';
import ErrorMessage from '../ui/ErrorMessage';

/**
 * Generic admin data table with search, column sorting, and optional bulk selection.
 *
 * Props:
 *   columns        – [{ key, label, width?, render?(row), sortable?, searchable? }]
 *   rows           – data array (each item should have a unique _id)
 *   isLoading      – boolean
 *   isError        – boolean
 *   error          – error object with optional .message
 *   emptyMessage   – text shown when rows is empty
 *   searchable     – boolean – show the global search bar (default true)
 *   bulkActions    – [{ label, icon?, variant?, onAction(selectedIds) }] – if provided, checkboxes appear
 *   onRowClick     – optional callback(row) – makes rows clickable
 */
export default function AdminTable({
  columns,
  rows,
  isLoading,
  isError,
  error,
  emptyMessage,
  searchable = true,
  bulkActions,
  onRowClick,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());

  const hasBulk = Array.isArray(bulkActions) && bulkActions.length > 0;

  /* ── Search filtering ─────────────────────────────────── */
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      columns.some(col => {
        if (col.searchable === false) return false;
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [rows, search, columns]);

  /* ── Sorting ───────────────────────────────────────────── */
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortKey, sortDir, columns]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  /* ── Bulk selection ────────────────────────────────────── */
  const allIds = useMemo(() => sortedRows.map(r => r._id).filter(Boolean), [sortedRows]);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) return <Spinner />;
  if (isError)   return <ErrorMessage message={error?.message} />;

  return (
    <div className="admin-table-container">
      {/* Search + bulk action bar */}
      {(searchable || (hasBulk && selected.size > 0)) && (
        <div className="admin-table-toolbar">
          {searchable && (
            <div className="admin-table-search">
              <span className="material-icons-outlined">search</span>
              <input
                type="text"
                placeholder="Search records…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="admin-table-search-input"
              />
              {search && (
                <button className="admin-table-search-clear" onClick={() => setSearch('')}>
                  <span className="material-icons-outlined">close</span>
                </button>
              )}
            </div>
          )}
          {hasBulk && selected.size > 0 && (
            <div className="admin-table-bulk-bar">
              <span className="admin-table-bulk-count">{selected.size} selected</span>
              {bulkActions.map((ba, i) => (
                <button
                  key={i}
                  className={`admin-btn admin-btn--sm ${ba.variant === 'danger' ? 'admin-btn--danger' : ''}`}
                  onClick={() => { ba.onAction([...selected]); setSelected(new Set()); }}
                >
                  {ba.icon && <span className="material-icons-outlined" style={{ fontSize: '1rem', marginRight: '0.3rem' }}>{ba.icon}</span>}
                  {ba.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {hasBulk && (
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="admin-table-checkbox" />
                </th>
              )}
              {columns.map((col) => {
                const isSortable = col.sortable !== false && col.key !== 'actions' && col.key !== 'image';
                const isActive = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={isSortable ? 'admin-th-sortable' : undefined}
                    onClick={isSortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="admin-th-content">
                      {col.label}
                      {isSortable && (
                        <span className={`material-icons-outlined admin-th-sort-icon${isActive ? ' is-active' : ''}`}>
                          {isActive ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasBulk ? 1 : 0)} className="admin-empty">
                  {search ? `No results for "${search}"` : (emptyMessage ?? 'No records found.')}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, i) => (
                <tr key={row._id ?? i} className={`${selected.has(row._id) ? 'is-selected' : ''}${onRowClick ? ' admin-tr-clickable' : ''}`} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {hasBulk && (
                    <td>
                      <input type="checkbox" checked={selected.has(row._id)} onChange={() => toggleOne(row._id)} className="admin-table-checkbox" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
