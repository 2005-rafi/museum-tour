const mongoose = require('mongoose');
const softDeletePlugin = require('../../plugins/softDelete');

const commentSchema = new mongoose.Schema({
  artifactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artifact',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  commentText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
}, { timestamps: true });

commentSchema.index({ artifactId: 1, createdAt: -1 });

commentSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('Comment', commentSchema);
