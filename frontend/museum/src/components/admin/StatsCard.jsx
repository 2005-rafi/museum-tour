import React from 'react';

export default function StatsCard({ icon, label, value, color = '#69341f', isLoading, delta, prev, isRatio }) {
  const hasChange = delta !== undefined && delta !== null;
  const sign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  const pct = hasChange && prev > 0 ? Math.round((delta / prev) * 100) : (hasChange && delta > 0 ? 100 : 0);

  return (
    <div className="stats-card" style={{ '--card-color': color }}>
      <div className="stats-card-icon" aria-hidden="true">
        <span className="material-icons-outlined">{icon}</span>
      </div>
      <div className="stats-card-body">
        <div className="stats-card-value">
          {isLoading ? (
            <span className="stats-skeleton" />
          ) : isRatio ? (
            <>{value ?? '—'}<span className="stats-card-ratio-unit">/artifact</span></>
          ) : (
            value ?? '—'
          )}
        </div>
        <div className="stats-card-label">{label}</div>
        {hasChange && !isLoading && (
          <div className={`stats-card-delta stats-card-delta--${sign}`}>
            {sign === 'up' && <span className="material-icons-outlined">arrow_upward</span>}
            {sign === 'down' && <span className="material-icons-outlined">arrow_downward</span>}
            {delta !== 0 ? (
              <span>{sign === 'down' ? '' : '+'}{delta} ({pct}%)</span>
            ) : (
              <span>No change</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
