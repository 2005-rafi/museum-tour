import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { useAdminStats } from '../../context/AdminContext';
import StatsCard from '../../components/admin/StatsCard';
import { formatRelativeTime } from '../../utils/formatters';
import { downloadCSV } from '../../utils/csvExport';

const CHART_COLORS = ['#69341f', '#d4a373', '#8b6551', '#a0917a', '#2c1810', '#c0784a', '#5a2d16', '#b08968', '#6b5b52', '#ddb892'];
const SENTIMENT_COLORS = { positive: '#27ae60', neutral: '#a0917a', negative: '#c0392b' };
const HEATMAP_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const QUICK_ACTIONS = [
  { to: '/admin/museums',       icon: 'museum',       label: 'Manage Museums',   desc: 'Add, edit, or remove museums' },
  { to: '/admin/artifacts',     icon: 'inventory_2',  label: 'Manage Artifacts', desc: 'Browse and manage the artifact collection' },
  { to: '/admin/artifacts/new', icon: 'add_circle',   label: 'Upload Artifact',  desc: 'Add a new artifact to the system' },
  { to: '/admin/users',         icon: 'group',        label: 'Manage Users',     desc: 'View and remove user accounts' },
  { to: '/admin/comments',      icon: 'forum',        label: 'View Comments',    desc: 'Moderate comments across artifacts' },
  { to: '/admin/likes',         icon: 'favorite',     label: 'View Likes',       desc: 'See which artifacts are most popular' },
];

/* ── Reusable tooltip ──────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart-tooltip">
      <p className="admin-chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

/* ── Empty-state placeholder for charts ────────────────────────────────────── */
function EmptyChart({ icon, message, actionLabel, actionTo }) {
  return (
    <div className="admin-chart-empty">
      <span className="material-icons-outlined" aria-hidden="true">{icon}</span>
      <p>{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="admin-btn admin-btn--sm admin-btn--primary" style={{ marginTop: '0.75rem' }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/* ── Delta badge (arrow + number) ──────────────────────────────────────────── */
function DeltaBadge({ delta, prev }) {
  if (delta === 0 && prev === 0) return <span className="stats-delta stats-delta--neutral">—</span>;
  const pct = prev > 0 ? Math.round((delta / prev) * 100) : (delta > 0 ? 100 : 0);
  const sign = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  return (
    <span className={`stats-delta stats-delta--${sign}`}>
      {sign === 'up' && <span className="material-icons-outlined">arrow_upward</span>}
      {sign === 'down' && <span className="material-icons-outlined">arrow_downward</span>}
      {delta !== 0 && <>{Math.abs(delta)} ({pct}%)</>}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { analytics, isLoading, range, setRange, RANGE_OPTIONS, pollInterval } = useAdminStats();
  const navigate = useNavigate();
  const [showAllOrphaned, setShowAllOrphaned] = useState(false);
  const ORPHANED_LIMIT = 5;

  const kpis         = analytics?.kpis         ?? {};
  const timeSeries   = analytics?.timeSeries   ?? [];
  const topArtifacts = analytics?.topArtifacts ?? [];
  const topMuseums   = analytics?.topMuseums   ?? [];
  const eraDist      = analytics?.eraDistribution ?? [];
  const sentiment    = analytics?.sentiment    ?? {};
  const trending     = analytics?.trending     ?? [];
  const orphaned     = analytics?.orphaned     ?? [];
  const heatmapRaw   = analytics?.heatmap      ?? [];
  const recent       = analytics?.recentActivity ?? {};
  const recentComments = recent.comments ?? [];
  const recentLikes    = recent.likes    ?? [];

  const rangeLabel = RANGE_OPTIONS.find(o => o.value === range)?.label || '';

  /* Heatmap: compute max for color scaling */
  const heatmapMax = useMemo(() => Math.max(1, ...heatmapRaw.map(h => h.count)), [heatmapRaw]);
  const hasHeatmap = heatmapRaw.some(h => h.count > 0);

  /* Derived chart data */
  const topArtifactsBars = topArtifacts
    .filter(a => a.interactions > 0)
    .map(a => ({
      name: a.name?.length > 20 ? a.name.slice(0, 20) + '…' : a.name,
      likes: a.likes,
      comments: a.comments,
    }));

  const topMuseumsBars = topMuseums
    .filter(m => m.interactions > 0)
    .map(m => ({
      name: m.name?.length > 20 ? m.name.slice(0, 20) + '…' : m.name,
      interactions: m.interactions,
      artifacts: m.artifactCount,
    }));

  const sentimentPie = [
    { name: 'Positive', value: sentiment.positive || 0 },
    { name: 'Neutral',  value: sentiment.neutral  || 0 },
    { name: 'Negative', value: sentiment.negative || 0 },
  ].filter(d => d.value > 0);

  const hasTimeSeries   = timeSeries.some(d => d.likes > 0 || d.comments > 0);
  const hasArtifactBars = topArtifactsBars.length > 0;
  const hasMuseumBars   = topMuseumsBars.length > 0;
  const hasEra          = eraDist.length > 0;
  const hasSentiment    = sentimentPie.length > 0;
  const hasTrending     = trending.length > 0;
  const hasOrphaned     = orphaned.length > 0;

  /* CSV helpers */
  const exportActivity = () => {
    const rows = [
      ...recentComments.map(c => ({
        type: 'Comment',
        user: c.userId?.name || 'Unknown',
        artifact: c.artifactId?.name || '',
        text: c.commentText || '',
        date: c.createdAt,
      })),
      ...recentLikes.map(l => ({
        type: 'Like',
        user: l.userId?.name || 'Unknown',
        artifact: l.artifactId?.name || '',
        text: '',
        date: l.createdAt,
      })),
    ];
    downloadCSV(rows, 'recent-activity.csv', ['type', 'user', 'artifact', 'text', 'date']);
  };

  const stats = [
    { icon: 'group',       label: 'Total Users',       value: kpis.users?.total,     delta: kpis.users?.delta,     prev: kpis.users?.prev,     color: '#69341f' },
    { icon: 'museum',      label: 'Total Museums',     value: kpis.museums?.total,   delta: kpis.museums?.delta,   prev: kpis.museums?.prev,   color: '#d4a373' },
    { icon: 'inventory_2', label: 'Total Artifacts',   value: kpis.artifacts?.total, delta: kpis.artifacts?.delta, prev: kpis.artifacts?.prev, color: '#8b6551' },
    { icon: 'forum',       label: 'Total Comments',    value: kpis.comments?.total,  delta: kpis.comments?.delta,  prev: kpis.comments?.prev,  color: '#a0917a' },
    { icon: 'favorite',    label: 'Total Likes',       value: kpis.likes?.total,     delta: kpis.likes?.delta,     prev: kpis.likes?.prev,     color: '#c0784a' },
    { icon: 'speed',       label: 'Engagement Rate',   value: kpis.engagementRate,   color: '#5a2d16', isRatio: true },
    { icon: 'person',      label: 'Active Users (7d)', value: kpis.weeklyActiveUsers, color: '#27ae60' },
  ];

  return (
    <div className="admin-page">
      {/* ── Header + Date Filter ─────────────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Live overview · refreshes every {pollInterval / 1000}s
          </p>
        </div>
        <div className="admin-range-filter">
          {RANGE_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`admin-range-btn${range === o.value ? ' is-active' : ''}`}
              onClick={() => setRange(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="stats-grid">
        {stats.map((s) => (
          <StatsCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            color={s.color}
            isLoading={isLoading}
            delta={s.delta}
            prev={s.prev}
            isRatio={s.isRatio}
          />
        ))}
      </div>

      {/* ── Quick Actions (elevated for instant access) ──────────────────── */}
      <div className="admin-quick-grid">
        {QUICK_ACTIONS.map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} className="admin-quick-card">
            <span className="material-icons-outlined admin-quick-icon" aria-hidden="true">{icon}</span>
            <div className="admin-quick-body">
              <div className="admin-quick-label">{label}</div>
              <div className="admin-quick-desc">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Charts: time-series + era ────────────────────────────────────── */}
      {!isLoading && (
        <>
          <h2 className="admin-section-title">Analytics</h2>
          <div className="admin-charts-grid">
            {/* Time-Series Line Chart */}
            <div className="admin-chart-card admin-chart-card--wide">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">timeline</span>
                Engagement Over Time
              </h3>
              <div className="admin-chart-body">
                {hasTimeSeries ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={timeSeries} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd4" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#6b5b52' }}
                        tickFormatter={d => d.slice(5)} /* MM-DD */
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#6b5b52' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="likes" name="Likes" stroke="#69341f" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comments" name="Comments" stroke="#d4a373" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart icon="show_chart" message="Not enough engagement data yet." actionLabel="Upload an Artifact" actionTo="/admin/artifacts/new" />
                )}
              </div>
            </div>

            {/* Era Distribution (stacked bar) */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">category</span>
                Artifacts by Era
              </h3>
              <div className="admin-chart-body">
                {hasEra ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={eraDist} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6b5b52' }} allowDecimals={false} />
                      <YAxis
                        type="category" dataKey="era"
                        tick={{ fontSize: 11, fill: '#6b5b52' }}
                        width={150}
                        tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="admin-chart-tooltip">
                              <p className="admin-chart-tooltip-label">{d.era}</p>
                              <p>{d.count} artifact{d.count !== 1 ? 's' : ''}</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" name="Artifacts" fill="#69341f" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart icon="history" message="No era data available." actionLabel="Upload an Artifact" actionTo="/admin/artifacts/new" />
                )}
              </div>
            </div>
          </div>

          {/* ── Engagement Heatmap ───────────────────────────────────────── */}
          {hasHeatmap && (
            <div className="admin-chart-card" style={{ marginBottom: '1.5rem' }}>
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">grid_on</span>
                Engagement Heatmap
                <span className="admin-chart-badge">Best time to publish</span>
              </h3>
              <div className="admin-chart-body">
                <div className="admin-heatmap">
                  <div className="admin-heatmap-corner" />
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="admin-heatmap-hour">
                      {h % 3 === 0 ? `${h.toString().padStart(2, '0')}` : ''}
                    </div>
                  ))}
                  {HEATMAP_DAYS.map((day, di) => (
                    <React.Fragment key={day}>
                      <div className="admin-heatmap-day">{day}</div>
                      {Array.from({ length: 24 }, (_, h) => {
                        const cell = heatmapRaw.find(c => c.dayIndex === di && c.hour === h);
                        const count = cell?.count || 0;
                        const intensity = count / heatmapMax;
                        return (
                          <div
                            key={h}
                            className="admin-heatmap-cell"
                            style={{ backgroundColor: count > 0 ? `rgba(105, 52, 31, ${0.1 + intensity * 0.85})` : undefined }}
                            title={`${day} ${h}:00 — ${count} interaction${count !== 1 ? 's' : ''}`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                <div className="admin-heatmap-legend">
                  <span>Less</span>
                  {[0.1, 0.3, 0.55, 0.75, 0.95].map((o, i) => (
                    <div key={i} className="admin-heatmap-cell admin-heatmap-legend-cell" style={{ backgroundColor: `rgba(105, 52, 31, ${o})` }} />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Charts: top artifacts + top museums ──────────────────────── */}
          <div className="admin-charts-grid">
            {/* Top Artifacts (Horizontal bar) */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">bar_chart</span>
                Top 10 Artifacts
              </h3>
              <div className="admin-chart-body">
                {hasArtifactBars ? (
                  <ResponsiveContainer width="100%" height={Math.max(280, topArtifactsBars.length * 36)}>
                    <BarChart data={topArtifactsBars} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6b5b52' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b5b52' }} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="likes" name="Likes" fill="#69341f" stackId="a" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="comments" name="Comments" fill="#d4a373" stackId="a" radius={[0, 4, 4, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart icon="inventory_2" message="No artifact interactions yet." actionLabel="Feature an Artifact" actionTo="/admin/artifacts" />
                )}
              </div>
            </div>

            {/* Top Museums */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">museum</span>
                Most Popular Museums
              </h3>
              <div className="admin-chart-body">
                {hasMuseumBars ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topMuseumsBars} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6b5b52' }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b5b52' }} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="interactions" name="Interactions" fill="#8b6551" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart icon="museum" message="No museum engagement data yet." actionLabel="Add a Museum" actionTo="/admin/museums" />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Intelligence Section ─────────────────────────────────────────── */}
      {!isLoading && (hasTrending || hasSentiment || hasOrphaned) && (
        <>
          <h2 className="admin-section-title">Intelligence</h2>
          <div className="admin-charts-grid">
            {/* Trending Now */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">trending_up</span>
                Trending Now
                <span className="admin-chart-badge">48h velocity</span>
              </h3>
              <div className="admin-chart-body admin-chart-body--list">
                {hasTrending ? (
                  <ol className="admin-trending-list">
                    {trending.map((t, i) => (
                      <li key={t._id} className="admin-trending-item">
                        <span className="admin-trending-rank">#{i + 1}</span>
                        <div className="admin-trending-body">
                          <span className="admin-trending-name">{t.name}</span>
                          <span className="admin-trending-meta">{t.museum}</span>
                        </div>
                        <div className="admin-trending-score">
                          <span className="admin-trending-velocity">{t.velocity}</span>
                          <span className="admin-trending-breakdown">
                            {t.recentLikes}L · {t.recentComments}C
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyChart icon="trending_up" message="No trending artifacts in the last 48 hours." actionLabel="Upload an Artifact" actionTo="/admin/artifacts/new" />
                )}
              </div>
            </div>

            {/* Sentiment */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">sentiment_satisfied</span>
                Comment Sentiment
              </h3>
              <div className="admin-chart-body">
                {hasSentiment ? (
                  <>
                    <div className="admin-sentiment-score">
                      Score: <strong>{sentiment.score >= 0 ? '+' : ''}{sentiment.score}</strong>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={sentimentPie}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sentimentPie.map((d) => (
                            <Cell key={d.name} fill={SENTIMENT_COLORS[d.name.toLowerCase()] || '#a0917a'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    {sentiment.controversialArtifacts?.length > 0 && (
                      <div className="admin-controversial">
                        <h4>Controversial Discussions</h4>
                        <ul>
                          {sentiment.controversialArtifacts.map((a, i) => (
                            <li key={i}>
                              <strong>{a.name}</strong> — {Math.round(a.negativeRatio * 100)}% negative ({a.commentCount} comments)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyChart icon="sentiment_satisfied" message="No comments to analyse yet." actionLabel="View Artifacts" actionTo="/admin/artifacts" />
                )}
              </div>
            </div>
          </div>

          {/* Orphaned Artifacts */}
          {hasOrphaned && (
            <div className="admin-chart-card admin-orphaned-card">
              <h3 className="admin-chart-title">
                <span className="material-icons-outlined" aria-hidden="true">visibility_off</span>
                Zero-Interaction Artifacts
                <span className="admin-chart-badge">{orphaned.length} items need attention</span>
              </h3>
              <div className="admin-table-wrap" style={{ boxShadow: 'none' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Artifact</th>
                      <th>Museum</th>
                      <th>Era</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllOrphaned ? orphaned : orphaned.slice(0, ORPHANED_LIMIT)).map(a => (
                      <tr
                        key={a._id}
                        className="admin-orphaned-row"
                        onClick={() => navigate(`/admin/artifacts/${a._id}`)}
                      >
                        <td><strong>{a.name}</strong></td>
                        <td>{a.museum}</td>
                        <td>{a.era}</td>
                        <td>{formatRelativeTime(a.createdAt)}</td>
                        <td className="admin-orphaned-actions" onClick={e => e.stopPropagation()}>
                          <Link to={`/admin/artifacts/${a._id}`} className="admin-orphaned-link">
                            <span className="material-icons-outlined">edit</span>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orphaned.length > ORPHANED_LIMIT && !showAllOrphaned && (
                <button
                  className="admin-orphaned-footer"
                  onClick={() => setShowAllOrphaned(true)}
                >
                  View Full Report ({orphaned.length - ORPHANED_LIMIT} more)
                  <span className="material-icons-outlined">expand_more</span>
                </button>
              )}
              {showAllOrphaned && orphaned.length > ORPHANED_LIMIT && (
                <button
                  className="admin-orphaned-footer"
                  onClick={() => setShowAllOrphaned(false)}
                >
                  Show Less
                  <span className="material-icons-outlined">expand_less</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Recent Activity ──────────────────────────────────────────────── */}
      {!isLoading && (recentComments.length > 0 || recentLikes.length > 0) && (
        <>
          <div className="admin-section-header">
            <h2 className="admin-section-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
              Recent Activity
            </h2>
            <button className="admin-btn admin-btn--sm" onClick={exportActivity}>
              <span className="material-icons-outlined" style={{ fontSize: '1rem', marginRight: '0.35rem' }}>download</span>
              Export CSV
            </button>
          </div>
          <div className="admin-activity-grid">
            {recentComments.length > 0 && (
              <div className="admin-activity-card">
                <h3 className="admin-activity-title">
                  <span className="material-icons-outlined" aria-hidden="true">forum</span>
                  Latest Comments
                </h3>
                <ul className="admin-activity-list">
                  {recentComments.map((c) => (
                    <li key={c._id} className="admin-activity-item">
                      <div className="admin-activity-avatar">
                        {c.userId?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="admin-activity-body">
                        <span className="admin-activity-user">{c.userId?.name ?? 'User'}</span>
                        <span className="admin-activity-text">
                          {c.commentText?.length > 60 ? c.commentText.slice(0, 60) + '…' : c.commentText}
                        </span>
                        <span className="admin-activity-time">{formatRelativeTime(c.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link to="/admin/comments" className="admin-activity-viewall">
                  View all comments
                  <span className="material-icons-outlined">arrow_forward</span>
                </Link>
              </div>
            )}

            {recentLikes.length > 0 && (
              <div className="admin-activity-card">
                <h3 className="admin-activity-title">
                  <span className="material-icons-outlined" aria-hidden="true">favorite</span>
                  Latest Likes
                </h3>
                <ul className="admin-activity-list">
                  {recentLikes.map((l) => (
                    <li key={l._id} className="admin-activity-item">
                      <div className="admin-activity-avatar">
                        {l.userId?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="admin-activity-body">
                        <span className="admin-activity-user">{l.userId?.name ?? 'User'}</span>
                        <span className="admin-activity-text">
                          liked <strong>{l.artifactId?.name ?? 'an artifact'}</strong>
                        </span>
                        <span className="admin-activity-time">{formatRelativeTime(l.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link to="/admin/likes" className="admin-activity-viewall">
                  View all likes
                  <span className="material-icons-outlined">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
