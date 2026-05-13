const mongoose = require('mongoose');
const softDeletePlugin = require('../../plugins/softDelete');
const { invalidatePattern } = require('../../middleware/cache');

const museumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    address: { type: String, trim: true, default: '' },
    city:    { type: String, trim: true, required: true },
    state:   { type: String, trim: true, default: '' },
    country: { type: String, trim: true, required: true },
    zipCode: { type: String, trim: true, default: '' },
  },
  description: {
    type: String,
    required: true,
  },

  // ── Core Historical Context ─────────────────────────────────────────────
  establishedYear: { type: Number },
  founder:         { type: String, trim: true, default: '' },
  originalPurpose: { type: String, trim: true, default: '' },

  // ── Architectural History ───────────────────────────────────────────────
  architecturalStyle:      { type: String, trim: true, default: '' },
  architect:               { type: String, trim: true, default: '' },
  historicalDesignations:  [{ type: String, trim: true }],

  // ── Educational Scope ──────────────────────────────────────────────────
  museumType:     { type: String, trim: true, default: '' },
  erasCovered:    [{ type: String, trim: true }],
  collectionSize: { type: Number, min: 0 },

  // ── Interactive Links ──────────────────────────────────────────────────
  websiteUrl:    { type: String, trim: true, default: '' },
  virtualTourUrl:{ type: String, trim: true, default: '' },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  images: [{
    url: String,
    caption: String,
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
}, { timestamps: true });

museumSchema.index({ name: 'text', description: 'text', tags: 'text' });
museumSchema.index({ tags: 1 });
museumSchema.index({ 'location.city': 1, 'location.country': 1 });
museumSchema.index({ museumType: 1 });
museumSchema.index({ establishedYear: 1 });

museumSchema.plugin(softDeletePlugin);

// Automatic cache invalidation on any write
const invalidateMuseumCache = () => { invalidatePattern('museums:'); invalidatePattern('search:'); };
museumSchema.post('save', invalidateMuseumCache);
museumSchema.post('findOneAndUpdate', invalidateMuseumCache);
museumSchema.post('updateMany', invalidateMuseumCache);
museumSchema.post('findOneAndDelete', invalidateMuseumCache);

module.exports = mongoose.model('Museum', museumSchema);
