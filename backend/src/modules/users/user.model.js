const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const softDeletePlugin = require('../../plugins/softDelete');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'super-admin'],
    default: 'user',
  },
  permissions: [{
    type: String,
    trim: true,
  }],
  avatar:   { type: String, default: '' },
  bio:      { type: String, trim: true, maxlength: 500, default: '' },
  phone:    { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    theme:    { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    language: { type: String, enum: ['en', 'es', 'fr', 'ar'], default: 'en' },
  },
  lastLogin:       { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil:       { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.plugin(softDeletePlugin);

module.exports = mongoose.model('User', userSchema);
