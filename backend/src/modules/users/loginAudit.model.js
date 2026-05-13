const mongoose = require('mongoose');

const loginAuditSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email:         { type: String, required: true },
  ipAddress:     { type: String },
  userAgent:     { type: String },
  success:       { type: Boolean, required: true },
  failureReason: { type: String, enum: ['INVALID_EMAIL', 'INVALID_PASSWORD', 'ACCOUNT_LOCKED', null], default: null },
}, { timestamps: true });

loginAuditSchema.index({ userId: 1, createdAt: -1 });
loginAuditSchema.index({ email: 1, createdAt: -1 });
loginAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 days TTL

module.exports = mongoose.model('LoginAudit', loginAuditSchema);
