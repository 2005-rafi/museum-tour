const mongoose = require('mongoose');
const softDeletePlugin = require('../../plugins/softDelete');
const { invalidatePattern } = require('../../middleware/cache');

const artifactSchema = new mongoose.Schema({
  museumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  historicalPeriod: {
    type: String,
    required: true,
    trim: true,
  },
  origin: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },

  // -- Creation & Origin --------------------------------------------------
  creationDate:        { type: String, trim: true, default: '' },
  periodOrEra:         { type: String, trim: true, default: '' },
  cultureOrCivilization: { type: String, trim: true, default: '' },
  originLocation:      { type: String, trim: true, default: '' },

  // -- Discovery Data -----------------------------------------------------
  discoveryYear:       { type: Number },
  discoveredBy:        { type: String, trim: true, default: '' },
  discoveryLocation:   { type: String, trim: true, default: '' },

  // -- Physical Attributes ------------------------------------------------
  materials: [{ type: String, trim: true }],
  dimensions: {
    height: { type: String, trim: true, default: '' },
    width:  { type: String, trim: true, default: '' },
    depth:  { type: String, trim: true, default: '' },
    weight: { type: String, trim: true, default: '' },
    unit:   { type: String, trim: true, default: 'cm' },
  },

  // -- Educational Hooks --------------------------------------------------
  historicalSignificance: { type: String, default: '' },
  funFacts:              [{ type: String, trim: true }],
  threeDModelUrl:        { type: String, trim: true, default: '' },

  // -- Legacy / existing fields -------------------------------------------
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  discoveryStory: {
    type: String,
  },
  culturalSignificance: {
    type: String,
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
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

artifactSchema.index({ name: 'text', description: 'text', tags: 'text' });
artifactSchema.index({ museumId: 1 });
artifactSchema.index({ tags: 1 });
artifactSchema.index({ historicalPeriod: 1 });
artifactSchema.index({ likesCount: -1 });
artifactSchema.index({ cultureOrCivilization: 1 });
artifactSchema.index({ periodOrEra: 1 });

artifactSchema.plugin(softDeletePlugin);

// Automatic cache invalidation on any write
const invalidateArtifactCache = () => { invalidatePattern('artifacts:'); invalidatePattern('search:'); };
artifactSchema.post('save', invalidateArtifactCache);
artifactSchema.post('findOneAndUpdate', invalidateArtifactCache);
artifactSchema.post('updateMany', invalidateArtifactCache);
artifactSchema.post('findOneAndDelete', invalidateArtifactCache);

// Cascading cleanup: when an artifact is soft-deleted, remove associated likes
// and soft-delete associated comments
artifactSchema.post('findOneAndUpdate', async function (doc) {
  if (doc && doc.isDeleted) {
    const Comment = mongoose.model('Comment');
    const Like = mongoose.model('Like');
    await Promise.all([
      Comment.updateMany(
        { artifactId: doc._id, isDeleted: { $ne: true } },
        { isDeleted: true, deletedAt: new Date() }
      ),
      Like.deleteMany({ artifactId: doc._id }),
    ]);
  }
});

// Cascading cleanup on hard delete
artifactSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter()).select('_id');
  if (doc) {
    const Comment = mongoose.model('Comment');
    const Like = mongoose.model('Like');
    await Promise.all([
      Comment.deleteMany({ artifactId: doc._id }),
      Like.deleteMany({ artifactId: doc._id }),
    ]);
  }
});

module.exports = mongoose.model('Artifact', artifactSchema);
