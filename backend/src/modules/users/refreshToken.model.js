const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:      { type: String, required: true, unique: true },
  expiresAt:  { type: Date, required: true },
  lastUsedAt: { type: Date },
  ipAddress:  { type: String },
  userAgent:  { type: String },
  isRevoked:  { type: Boolean, default: false },
}, { timestamps: true });

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(40).toString('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
