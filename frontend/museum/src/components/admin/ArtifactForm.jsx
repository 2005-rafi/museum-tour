import React, { useState } from 'react';
import { useMuseums } from '../../hooks/useMuseums';

/**
 * Shared create / edit form for artifacts.
 *
 * Props:
 *   initial   – existing artifact object for edit mode (omit for create)
 *   onSubmit  – called with the prepared payload object
 *   isPending – disables controls while the mutation is in-flight
 *   onCancel  – called when the user clicks Cancel
 */
export default function ArtifactForm({ initial, onSubmit, isPending, onCancel }) {
  const { data: museumsData } = useMuseums({ limit: 100 });
  const museums = museumsData?.items ?? [];

  const [form, setForm] = useState(() => {
    // museumId may be a populated object { _id, name, ... } or a plain string
    const rawMuseumId = initial?.museumId;
    const resolvedMuseumId = rawMuseumId && typeof rawMuseumId === 'object'
      ? rawMuseumId._id?.toString?.() ?? rawMuseumId._id ?? ''
      : rawMuseumId ?? '';

    return {
      name:               initial?.name               ?? '',
      description:        initial?.description        ?? '',
      historicalPeriod:   initial?.historicalPeriod   ?? '',
      origin:             initial?.origin             ?? '',
      discoveryStory:     initial?.discoveryStory     ?? '',
      culturalSignificance: initial?.culturalSignificance ?? '',
      tags:               Array.isArray(initial?.tags)
                            ? initial.tags.join(', ')
                            : (initial?.tags ?? ''),
      museumId:           resolvedMuseumId,
      imageUrl:           initial?.imageUrl ?? initial?.images?.[0]?.url ?? '',
      // Creation & Origin
      creationDate:         initial?.creationDate ?? '',
      periodOrEra:          initial?.periodOrEra ?? '',
      cultureOrCivilization: initial?.cultureOrCivilization ?? '',
      originLocation:       initial?.originLocation ?? '',
      // Discovery Data
      discoveryYear:        initial?.discoveryYear ?? '',
      discoveredBy:         initial?.discoveredBy ?? '',
      discoveryLocation:    initial?.discoveryLocation ?? '',
      // Physical Attributes
      materials:            Array.isArray(initial?.materials) ? initial.materials.join(', ') : '',
      dimHeight:            initial?.dimensions?.height ?? '',
      dimWidth:             initial?.dimensions?.width ?? '',
      dimDepth:             initial?.dimensions?.depth ?? '',
      dimWeight:            initial?.dimensions?.weight ?? '',
      dimUnit:              initial?.dimensions?.unit ?? 'cm',
      // Educational Hooks
      historicalSignificance: initial?.historicalSignificance ?? '',
      funFacts:             Array.isArray(initial?.funFacts) ? initial.funFacts.join('\n') : '',
      threeDModelUrl:       initial?.threeDModelUrl ?? '',
    };
  });

  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim())             errs.name             = 'Name is required.';
    if (!form.description.trim())      errs.description      = 'Description is required.';
    if (!form.origin.trim())           errs.origin           = 'Origin is required.';
    if (!form.historicalPeriod.trim()) errs.historicalPeriod = 'Historical period is required.';
    if (!form.museumId)                errs.museumId         = 'Please select a museum.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const materials = form.materials
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const funFacts = form.funFacts
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const dimensions = {};
    if (form.dimHeight) dimensions.height = form.dimHeight.trim();
    if (form.dimWidth) dimensions.width = form.dimWidth.trim();
    if (form.dimDepth) dimensions.depth = form.dimDepth.trim();
    if (form.dimWeight) dimensions.weight = form.dimWeight.trim();
    dimensions.unit = form.dimUnit || 'cm';

    onSubmit({
      name:                 form.name.trim(),
      description:          form.description.trim(),
      historicalPeriod:     form.historicalPeriod.trim(),
      origin:               form.origin.trim(),
      discoveryStory:       form.discoveryStory.trim() || undefined,
      culturalSignificance: form.culturalSignificance.trim() || undefined,
      tags,
      museumId: form.museumId,
      images:   form.imageUrl ? [{ url: form.imageUrl.trim(), caption: '' }] : [],
      // Creation & Origin
      creationDate: form.creationDate.trim() || undefined,
      periodOrEra: form.periodOrEra.trim() || undefined,
      cultureOrCivilization: form.cultureOrCivilization.trim() || undefined,
      originLocation: form.originLocation.trim() || undefined,
      // Discovery Data
      discoveryYear: form.discoveryYear ? Number(form.discoveryYear) : undefined,
      discoveredBy: form.discoveredBy.trim() || undefined,
      discoveryLocation: form.discoveryLocation.trim() || undefined,
      // Physical Attributes
      materials: materials.length ? materials : undefined,
      dimensions: (dimensions.height || dimensions.width || dimensions.depth || dimensions.weight) ? dimensions : undefined,
      // Educational Hooks
      historicalSignificance: form.historicalSignificance.trim() || undefined,
      funFacts: funFacts.length ? funFacts : undefined,
      threeDModelUrl: form.threeDModelUrl.trim() || undefined,
    });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {/* Name */}
      <div className="admin-form-field">
        <label htmlFor="af-name">Name *</label>
        <input
          id="af-name"
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Artifact name"
          aria-invalid={!!errors.name}
        />
        {errors.name && <span className="admin-form-error">{errors.name}</span>}
      </div>

      {/* Description */}
      <div className="admin-form-field">
        <label htmlFor="af-desc">Description *</label>
        <textarea
          id="af-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Describe the artifact…"
          rows={4}
          aria-invalid={!!errors.description}
        />
        {errors.description && <span className="admin-form-error">{errors.description}</span>}
      </div>

      {/* Period / Origin */}
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label htmlFor="af-period">Historical Period *</label>
          <input
            id="af-period"
            type="text"
            value={form.historicalPeriod}
            onChange={(e) => set('historicalPeriod', e.target.value)}
            placeholder="e.g. Ancient Egypt"
            aria-invalid={!!errors.historicalPeriod}
          />
          {errors.historicalPeriod && <span className="admin-form-error">{errors.historicalPeriod}</span>}
        </div>
        <div className="admin-form-field">
          <label htmlFor="af-origin">Origin *</label>
          <input
            id="af-origin"
            type="text"
            value={form.origin}
            onChange={(e) => set('origin', e.target.value)}
            placeholder="e.g. Egypt"
            aria-invalid={!!errors.origin}
          />
          {errors.origin && <span className="admin-form-error">{errors.origin}</span>}
        </div>
      </div>

      {/* Discovery Story / Cultural Significance */}
      <div className="admin-form-field">
        <label htmlFor="af-story">Discovery Story</label>
        <textarea
          id="af-story"
          value={form.discoveryStory}
          onChange={(e) => set('discoveryStory', e.target.value)}
          placeholder="How was this artifact discovered?"
          rows={3}
        />
      </div>
      <div className="admin-form-field">
        <label htmlFor="af-significance">Cultural Significance</label>
        <textarea
          id="af-significance"
          value={form.culturalSignificance}
          onChange={(e) => set('culturalSignificance', e.target.value)}
          placeholder="What is the cultural significance?"
          rows={3}
        />
      </div>

      {/* Museum + Tags */}
      <div className="admin-form-row">
        <div className="admin-form-field">
          <label htmlFor="af-museum">Museum *</label>
          <select
            id="af-museum"
            value={form.museumId}
            onChange={(e) => set('museumId', e.target.value)}
            aria-invalid={!!errors.museumId}
          >
            <option value="">— Select museum —</option>
            {museums.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          {errors.museumId && <span className="admin-form-error">{errors.museumId}</span>}
        </div>

        <div className="admin-form-field">
          <label htmlFor="af-tags">Tags</label>
          <input
            id="af-tags"
            type="text"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="gold, roman, coin  (comma-separated)"
          />
        </div>
      </div>

      {/* Image URL */}
      <div className="admin-form-field">
        <label htmlFor="af-img">Image URL</label>
        <input
          id="af-img"
          type="url"
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          placeholder="https://example.com/artifact.jpg"
        />
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="preview"
            className="admin-img-preview"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>

      {/* Creation & Origin */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Creation &amp; Origin</h4>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="af-creationdate">Creation Date</label>
            <input id="af-creationdate" type="text" value={form.creationDate} onChange={(e) => set('creationDate', e.target.value)} placeholder="e.g. c. 3100 BCE" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-era">Period / Era</label>
            <input id="af-era" type="text" value={form.periodOrEra} onChange={(e) => set('periodOrEra', e.target.value)} placeholder="e.g. Bronze Age" />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="af-culture">Culture / Civilization</label>
            <input id="af-culture" type="text" value={form.cultureOrCivilization} onChange={(e) => set('cultureOrCivilization', e.target.value)} placeholder="e.g. Mesopotamian" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-originloc">Origin Location</label>
            <input id="af-originloc" type="text" value={form.originLocation} onChange={(e) => set('originLocation', e.target.value)} placeholder="e.g. Valley of the Kings, Egypt" />
          </div>
        </div>
      </div>

      {/* Discovery Data */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Discovery Data</h4>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="af-discyear">Discovery Year</label>
            <input id="af-discyear" type="number" value={form.discoveryYear} onChange={(e) => set('discoveryYear', e.target.value)} placeholder="e.g. 1922" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-discby">Discovered By</label>
            <input id="af-discby" type="text" value={form.discoveredBy} onChange={(e) => set('discoveredBy', e.target.value)} placeholder="e.g. Howard Carter" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-discloc">Discovery Location</label>
            <input id="af-discloc" type="text" value={form.discoveryLocation} onChange={(e) => set('discoveryLocation', e.target.value)} placeholder="e.g. Tomb KV62, Egypt" />
          </div>
        </div>
      </div>

      {/* Physical Attributes */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Physical Attributes</h4>
        <div className="admin-form-field">
          <label htmlFor="af-materials">Materials</label>
          <input id="af-materials" type="text" value={form.materials} onChange={(e) => set('materials', e.target.value)} placeholder="Gold, Lapis Lazuli, Wood (comma-separated)" />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="af-dimh">Height</label>
            <input id="af-dimh" type="text" value={form.dimHeight} onChange={(e) => set('dimHeight', e.target.value)} placeholder="e.g. 54" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-dimw">Width</label>
            <input id="af-dimw" type="text" value={form.dimWidth} onChange={(e) => set('dimWidth', e.target.value)} placeholder="e.g. 39.3" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-dimd">Depth</label>
            <input id="af-dimd" type="text" value={form.dimDepth} onChange={(e) => set('dimDepth', e.target.value)} placeholder="e.g. 10" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-dimwt">Weight</label>
            <input id="af-dimwt" type="text" value={form.dimWeight} onChange={(e) => set('dimWeight', e.target.value)} placeholder="e.g. 11 kg" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="af-dimunit">Unit</label>
            <select id="af-dimunit" value={form.dimUnit} onChange={(e) => set('dimUnit', e.target.value)}>
              <option value="cm">cm</option>
              <option value="in">in</option>
              <option value="m">m</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Educational Hooks */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Educational Hooks</h4>
        <div className="admin-form-field">
          <label htmlFor="af-histsig">Historical Significance</label>
          <textarea id="af-histsig" value={form.historicalSignificance} onChange={(e) => set('historicalSignificance', e.target.value)} placeholder="Why is this artifact historically important?" rows={3} />
        </div>
        <div className="admin-form-field">
          <label htmlFor="af-funfacts">Fun Facts (one per line)</label>
          <textarea id="af-funfacts" value={form.funFacts} onChange={(e) => set('funFacts', e.target.value)} placeholder={"The mask weighs over 10 kg of solid gold.\nIt was buried for over 3,000 years."} rows={3} />
        </div>
        <div className="admin-form-field">
          <label htmlFor="af-3d">3D Model URL</label>
          <input id="af-3d" type="url" value={form.threeDModelUrl} onChange={(e) => set('threeDModelUrl', e.target.value)} placeholder="https://sketchfab.com/models/..." />
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Artifact'}
        </button>
      </div>
    </form>
  );
}
