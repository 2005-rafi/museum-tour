/**
 * Mongoose Soft Delete Plugin
 * Adds isDeleted/deletedAt/deletedBy fields and automatically
 * filters out soft-deleted documents from all find operations.
 */

const mongoose = require('mongoose');

const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  });

  // Automatically exclude soft-deleted documents from find queries
  const excludeDeleted = function () {
    if (this.getOptions()._includeDeleted) return;
    const filter = this.getFilter();
    if (!('isDeleted' in filter)) {
      this.where({ isDeleted: { $ne: true } });
    }
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  // Soft delete by ID
  schema.statics.softDeleteById = function (id, deletedByUserId) {
    return this.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: deletedByUserId || null },
      { new: true }
    );
  };

  // Restore a soft-deleted document by ID
  schema.statics.restoreById = function (id) {
    return this.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    ).setOptions({ _includeDeleted: true });
  };

  // Find only soft-deleted documents
  schema.statics.findDeleted = function (filter = {}) {
    return this.find({ ...filter, isDeleted: true }).setOptions({ _includeDeleted: true });
  };

  // Find all documents including soft-deleted
  schema.statics.findWithDeleted = function (filter = {}) {
    return this.find(filter).setOptions({ _includeDeleted: true });
  };

  // Count including soft-deleted
  schema.statics.countWithDeleted = function (filter = {}) {
    return this.countDocuments(filter).setOptions({ _includeDeleted: true });
  };
};

module.exports = softDeletePlugin;
