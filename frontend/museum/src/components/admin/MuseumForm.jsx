import React, { useState } from 'react';

const EMPTY_FORM = {
  name: '',
  description: '',
  location: { address: '', city: '', state: '', country: '', zipCode: '' },
  imageUrl: '',
  // Core Historical Context
  establishedYear: '',
  founder: '',
  originalPurpose: '',
  // Architectural History
  architecturalStyle: '',
  architect: '',
  historicalDesignations: '',
  // Educational Scope
  museumType: '',
  erasCovered: '',
  collectionSize: '',
  // Interactive Links
  websiteUrl: '',
  virtualTourUrl: '',
};

/**
 * Shared create / edit form for museums.
 *
 * Props:
 *   initial   – existing museum object for edit mode (omit for create)
 *   onSubmit  – called with the prepared payload object
 *   isPending – disables controls while the mutation is in-flight
 *   onCancel  – called when the user clicks Cancel
 */
export default function MuseumForm({ initial, onSubmit, isPending, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    return {
      name:        initial.name        ?? '',
      description: initial.description ?? '',
      location: {
        address: initial.location?.address ?? '',
        city:    initial.location?.city    ?? '',
        state:   initial.location?.state   ?? '',
        country: initial.location?.country ?? '',
        zipCode: initial.location?.zipCode ?? '',
      },
      imageUrl: initial.imageUrl ?? initial.images?.[0]?.url ?? '',
      establishedYear:        initial.establishedYear ?? '',
      founder:                initial.founder ?? '',
      originalPurpose:        initial.originalPurpose ?? '',
      architecturalStyle:     initial.architecturalStyle ?? '',
      architect:              initial.architect ?? '',
      historicalDesignations: Array.isArray(initial.historicalDesignations) ? initial.historicalDesignations.join(', ') : '',
      museumType:             initial.museumType ?? '',
      erasCovered:            Array.isArray(initial.erasCovered) ? initial.erasCovered.join(', ') : '',
      collectionSize:         initial.collectionSize ?? '',
      websiteUrl:             initial.websiteUrl ?? '',
      virtualTourUrl:         initial.virtualTourUrl ?? '',
    };
  });

  const [errors, setErrors] = useState({});

  // Generic field setter: supports dot-notation for nested (e.g. 'location.city')
  const set = (path, value) =>
    setForm((prev) => {
      if (!path.includes('.')) return { ...prev, [path]: value };
      const [parent, child] = path.split('.');
      return { ...prev, [parent]: { ...prev[parent], [child]: value } };
    });

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                errs.name        = 'Name is required.';
    if (!form.description.trim())         errs.description = 'Description is required.';
    if (!form.location.city.trim())       errs.city        = 'City is required.';
    if (!form.location.country.trim())    errs.country     = 'Country is required.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const historicalDesignations = form.historicalDesignations
      .split(',').map((s) => s.trim()).filter(Boolean);
    const erasCovered = form.erasCovered
      .split(',').map((s) => s.trim()).filter(Boolean);

    onSubmit({
      name:        form.name.trim(),
      description: form.description.trim(),
      location: {
        address: form.location.address.trim(),
        city:    form.location.city.trim(),
        state:   form.location.state.trim(),
        country: form.location.country.trim(),
        zipCode: form.location.zipCode.trim(),
      },
      images: form.imageUrl ? [{ url: form.imageUrl.trim(), caption: '' }] : [],
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
      founder: form.founder.trim() || undefined,
      originalPurpose: form.originalPurpose.trim() || undefined,
      architecturalStyle: form.architecturalStyle.trim() || undefined,
      architect: form.architect.trim() || undefined,
      historicalDesignations: historicalDesignations.length ? historicalDesignations : undefined,
      museumType: form.museumType.trim() || undefined,
      erasCovered: erasCovered.length ? erasCovered : undefined,
      collectionSize: form.collectionSize ? Number(form.collectionSize) : undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      virtualTourUrl: form.virtualTourUrl.trim() || undefined,
    });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {/* Name */}
      <div className="admin-form-field">
        <label htmlFor="mf-name">Name *</label>
        <input
          id="mf-name"
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Museum name"
          aria-invalid={!!errors.name}
        />
        {errors.name && <span className="admin-form-error">{errors.name}</span>}
      </div>

      {/* Description */}
      <div className="admin-form-field">
        <label htmlFor="mf-desc">Description *</label>
        <textarea
          id="mf-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Museum description"
          rows={4}
          aria-invalid={!!errors.description}
        />
        {errors.description && <span className="admin-form-error">{errors.description}</span>}
      </div>

      {/* Location */}
      <fieldset className="admin-form-fieldset">
        <legend>Location</legend>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="mf-address">Address</label>
            <input
              id="mf-address"
              type="text"
              value={form.location.address}
              onChange={(e) => set('location.address', e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-city">City *</label>
            <input
              id="mf-city"
              type="text"
              value={form.location.city}
              onChange={(e) => set('location.city', e.target.value)}
              placeholder="City"
              aria-invalid={!!errors.city}
            />
            {errors.city && <span className="admin-form-error">{errors.city}</span>}
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="mf-state">State / Province</label>
            <input
              id="mf-state"
              type="text"
              value={form.location.state}
              onChange={(e) => set('location.state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-country">Country *</label>
            <input
              id="mf-country"
              type="text"
              value={form.location.country}
              onChange={(e) => set('location.country', e.target.value)}
              placeholder="Country"
              aria-invalid={!!errors.country}
            />
            {errors.country && <span className="admin-form-error">{errors.country}</span>}
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-zip">Zip / Postal Code</label>
            <input
              id="mf-zip"
              type="text"
              value={form.location.zipCode}
              onChange={(e) => set('location.zipCode', e.target.value)}
              placeholder="Zip code"
            />
          </div>
        </div>
      </fieldset>

      {/* Image URL */}
      <div className="admin-form-field">
        <label htmlFor="mf-img">Image URL</label>
        <input
          id="mf-img"
          type="url"
          value={form.imageUrl}
          onChange={(e) => set('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
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

      {/* Core Historical Context */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Historical Context</h4>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="mf-year">Established Year</label>
            <input id="mf-year" type="number" value={form.establishedYear} onChange={(e) => set('establishedYear', e.target.value)} placeholder="e.g. 1753" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-founder">Founder</label>
            <input id="mf-founder" type="text" value={form.founder} onChange={(e) => set('founder', e.target.value)} placeholder="e.g. Sir Hans Sloane" />
          </div>
        </div>
        <div className="admin-form-field">
          <label htmlFor="mf-purpose">Original Purpose</label>
          <input id="mf-purpose" type="text" value={form.originalPurpose} onChange={(e) => set('originalPurpose', e.target.value)} placeholder="e.g. Royal residence" />
        </div>
      </div>

      {/* Architectural History */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Architectural History</h4>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="mf-archstyle">Architectural Style</label>
            <input id="mf-archstyle" type="text" value={form.architecturalStyle} onChange={(e) => set('architecturalStyle', e.target.value)} placeholder="e.g. Neoclassical" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-architect">Architect</label>
            <input id="mf-architect" type="text" value={form.architect} onChange={(e) => set('architect', e.target.value)} placeholder="e.g. Robert Smirke" />
          </div>
        </div>
        <div className="admin-form-field">
          <label htmlFor="mf-designations">Historical Designations</label>
          <input id="mf-designations" type="text" value={form.historicalDesignations} onChange={(e) => set('historicalDesignations', e.target.value)} placeholder="UNESCO World Heritage, National Historic Landmark (comma-separated)" />
        </div>
      </div>

      {/* Educational Scope */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Educational Scope</h4>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="mf-type">Museum Type</label>
            <input id="mf-type" type="text" value={form.museumType} onChange={(e) => set('museumType', e.target.value)} placeholder="e.g. Art, Natural History, Science" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-colsize">Collection Size</label>
            <input id="mf-colsize" type="number" value={form.collectionSize} onChange={(e) => set('collectionSize', e.target.value)} placeholder="e.g. 8000000" />
          </div>
        </div>
        <div className="admin-form-field">
          <label htmlFor="mf-eras">Eras Covered</label>
          <input id="mf-eras" type="text" value={form.erasCovered} onChange={(e) => set('erasCovered', e.target.value)} placeholder="Ancient, Medieval, Renaissance (comma-separated)" />
        </div>
      </div>

      {/* Interactive Links */}
      <div className="admin-form-section">
        <h4 className="admin-form-section-title">Interactive Links</h4>
        <div className="admin-form-row">
          <div className="admin-form-field">
            <label htmlFor="mf-web">Website URL</label>
            <input id="mf-web" type="url" value={form.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} placeholder="https://museum.org" />
          </div>
          <div className="admin-form-field">
            <label htmlFor="mf-tour">Virtual Tour URL</label>
            <input id="mf-tour" type="url" value={form.virtualTourUrl} onChange={(e) => set('virtualTourUrl', e.target.value)} placeholder="https://tour.museum.org" />
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={isPending}>
          Cancel
        </button>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Museum'}
        </button>
      </div>
    </form>
  );
}
