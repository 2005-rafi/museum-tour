const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
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
}, { timestamps: true });

likeSchema.index({ artifactId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
