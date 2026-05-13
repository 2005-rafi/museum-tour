import React, { useState } from 'react';
import { useProfile, useLikedArtifacts, useUserComments } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import ArtifactCard from '../components/cards/ArtifactCard';
import Spinner from '../components/ui/Spinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import '../styles/profile.css';
import '../styles/auth.css';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'liked', label: 'Liked Artifacts' },
  { key: 'comments', label: 'Comments' },
  { key: 'settings', label: 'Settings' },
];

/* ── Settings sub-form ───────────────────────────────────────── */
function SettingsTab({ user, updateUser }) {
  const [form, setForm] = useState({
    name:     user?.name     ?? '',
    bio:      user?.bio      ?? '',
    phone:    user?.phone    ?? '',
    location: user?.location ?? '',
  });
  const [errors, setErrors]     = useState({});
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState(null);

  const validate = () => {
    const errs = {};
    const name = form.name.trim();
    if (!name)                       errs.name = 'Name is required.';
    else if (name.length < 2)        errs.name = 'Name must be at least 2 characters.';
    else if (name.length > 50)       errs.name = 'Name must be 50 characters or fewer.';

    if (form.bio.length > 500)       errs.bio  = 'Bio must be 500 characters or fewer.';
    if (form.phone.length > 20)      errs.phone = 'Phone must be 20 characters or fewer.';
    if (form.location.length > 100)  errs.location = 'Location must be 100 characters or fewer.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSaved(false);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setSaveError(null);
    setErrors({});
    try {
      const updated = await userService.updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
      });
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-settings-form" onSubmit={handleSubmit} noValidate>
      <h3>Profile Settings</h3>
      {saveError && <div className="auth-error" role="alert">{saveError}</div>}
      {saved && <div className="auth-success" role="status">Profile updated successfully!</div>}

      <div className="auth-field">
        <label htmlFor="settingsName">Full Name *</label>
        <input
          id="settingsName"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={saving}
          aria-invalid={!!errors.name}
          maxLength={50}
        />
        {errors.name && <span className="auth-field-error">{errors.name}</span>}
      </div>

      <div className="auth-field">
        <label htmlFor="settingsEmail">Email</label>
        <input
          id="settingsEmail"
          type="email"
          value={user?.email ?? ''}
          disabled
        />
        <span className="auth-field-hint">Email cannot be changed.</span>
      </div>

      <div className="auth-field">
        <label htmlFor="settingsBio">Bio</label>
        <textarea
          id="settingsBio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          disabled={saving}
          rows={3}
          placeholder="Tell us about yourself"
          aria-invalid={!!errors.bio}
          maxLength={500}
        />
        <span className="auth-field-hint">{form.bio.length}/500</span>
        {errors.bio && <span className="auth-field-error">{errors.bio}</span>}
      </div>

      <div className="auth-field-row">
        <div className="auth-field">
          <label htmlFor="settingsPhone">Phone</label>
          <input
            id="settingsPhone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={!!errors.phone}
            maxLength={20}
          />
          {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
        </div>
        <div className="auth-field">
          <label htmlFor="settingsLocation">Location</label>
          <input
            id="settingsLocation"
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            disabled={saving}
            aria-invalid={!!errors.location}
            maxLength={100}
          />
          {errors.location && <span className="auth-field-error">{errors.location}</span>}
        </div>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
function Profile() {
  const [tab, setTab] = useState('overview');
  const { user, updateUser } = useAuth();

  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile();
  const { data: likedData, isLoading: likedLoading } = useLikedArtifacts();
  const { data: commentsData, isLoading: commentsLoading } = useUserComments();

  const likedArtifacts = likedData?.items    ?? [];
  const comments       = commentsData?.items ?? [];

  if (profileLoading) return <Spinner fullPage />;
  if (profileError) return <ErrorMessage message="Failed to load profile." />;

  const displayUser = profile ?? user;

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <span aria-hidden="true">
            {displayUser?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">
            {displayUser?.name ?? 'User'}
          </h1>
          <p className="profile-email">{displayUser?.email}</p>
          {displayUser?.bio && (
            <p className="profile-bio">{displayUser.bio}</p>
          )}
          <p className="profile-joined">
            Member since {formatDate(displayUser?.createdAt)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            className={`profile-tab-btn${tab === t.key ? ' active' : ''}`}
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="profile-panel">
        {tab === 'overview' && (
          <div className="profile-overview">
            <div className="profile-stat-grid">
              <div className="profile-stat-card">
                <span className="profile-stat-number">{likedArtifacts.length}</span>
                <span className="profile-stat-label">Liked Artifacts</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-number">{comments.length}</span>
                <span className="profile-stat-label">Comments</span>
              </div>
              <div className="profile-stat-card">
                <span className="profile-stat-number capitalize">{displayUser?.role ?? 'User'}</span>
                <span className="profile-stat-label">Role</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'liked' && (
          <div className="profile-liked">
            {likedLoading && <Spinner />}
            {!likedLoading && likedArtifacts.length === 0 && (
              <EmptyState
                icon="far fa-heart"
                title="No liked artifacts"
                message="Artifacts you like will appear here."
              />
            )}
            {!likedLoading && likedArtifacts.length > 0 && (
              <div className="artifacts-grid">
                {likedArtifacts.map((artifact) => (
                  <ArtifactCard key={artifact._id} artifact={artifact} isLiked />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div className="profile-comments">
            {commentsLoading && <Spinner />}
            {!commentsLoading && comments.length === 0 && (
              <EmptyState
                icon="far fa-comment"
                title="No comments yet"
                message="Your comments will appear here."
              />
            )}
            {!commentsLoading && comments.length > 0 && (
              <ul className="profile-comments-list">
                {comments.map((c) => (
                  <li key={c._id} className="profile-comment-item">
                    <p className="profile-comment-text">{c.commentText ?? c.text}</p>
                    <span className="profile-comment-meta" title={formatDate(c.createdAt)}>
                      {formatRelativeTime(c.createdAt)}
                      {c.artifactId && (
                        <> — on <a href={`/artifacts/${c.artifactId._id ?? c.artifactId}`}>{c.artifactId?.name ?? 'view artifact'}</a></>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'settings' && <SettingsTab user={displayUser} updateUser={updateUser} />}
      </div>
    </div>
  );
}

export default Profile;
