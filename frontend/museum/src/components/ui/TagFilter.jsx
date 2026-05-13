import React from 'react';

/**
 * TagFilter – a row of pill buttons for filtering by tag/period/category.
 *
 * Props:
 *   tags      – array of strings or { value, label } objects
 *   selected  – string (single mode) | string[] (multi mode)
 *   onChange  – called with the new value (string | string[])
 *   label     – optional heading label shown before the pills
 *   multi     – if true, supports multiple active selections
 *   className – extra class names on the root element
 */
function TagFilter({ tags = [], selected, onChange, label, multi = false, className = '' }) {
  const normalise = (v) => (typeof v === 'string' ? { value: v, label: v } : v);

  const isActive = (value) => {
    if (multi) return Array.isArray(selected) ? selected.includes(value) : false;
    return selected === value;
  };

  const handleClick = (value) => {
    if (!onChange) return;
    if (multi) {
      const arr = Array.isArray(selected) ? selected : [];
      onChange(arr.includes(value) ? arr.filter((t) => t !== value) : [...arr, value]);
    } else {
      // single-select: clicking the active tag deselects it (clear)
      onChange(isActive(value) ? '' : value);
    }
  };

  if (!tags.length) return null;

  return (
    <div className={`tag-filter ${className}`.trim()}>
      {label && <span className="tag-filter-label">{label}</span>}
      <div className="tag-filter-list">
        {tags.map(normalise).map(({ value, label: lbl }) => (
          <button
            key={value}
            type="button"
            className={`tag-filter-btn${isActive(value) ? ' tag-filter-btn--active' : ''}`}
            onClick={() => handleClick(value)}
            aria-pressed={isActive(value)}
          >
            {lbl || value}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagFilter;
