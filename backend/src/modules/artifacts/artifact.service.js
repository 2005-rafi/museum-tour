const artifactRepository = require('./artifact.repository');
const { createError, ErrorCodes } = require('../../utils/errors');
const { invalidatePattern } = require('../../middleware/cache');
const { withCircuitBreaker } = require('../../middleware/circuitBreaker');
const embeddingService = require('../search/embedding.service');

class ArtifactService {
  constructor() {
    this._breakers = {};
  }

  _getBreaker(name, fn, fallback) {
    if (!this._breakers[name]) {
      this._breakers[name] = withCircuitBreaker(name, fn, fallback);
    }
    return this._breakers[name];
  }

  async create(data) {
    const artifact = await artifactRepository.create(data);
    invalidatePattern('artifacts:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return artifact;
  }

  async getById(id) {
    const fn = this._getBreaker(
      'artifact-getById',
      (aid) => artifactRepository.findById(aid),
      () => null
    );
    const artifact = await fn(id);
    if (!artifact) {
      throw createError(ErrorCodes.ARTIFACT_NOT_FOUND, 'Artifact not found');
    }
    return artifact;
  }

  async getAll(filter, options) {
    const fn = this._getBreaker(
      'artifact-getAll',
      (f, o) => artifactRepository.findAll(f, o),
      () => ({ data: [], pagination: { totalItems: 0, currentPage: 1, totalPages: 0, limit: 20 } })
    );
    return fn(filter, options);
  }

  async update(id, data) {
    const artifact = await artifactRepository.updateById(id, data);
    if (!artifact) {
      throw createError(ErrorCodes.ARTIFACT_NOT_FOUND, 'Artifact not found');
    }
    invalidatePattern('artifacts:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return artifact;
  }

  async delete(id, userId) {
    const artifact = await artifactRepository.softDelete(id, userId);
    if (!artifact) {
      throw createError(ErrorCodes.ARTIFACT_NOT_FOUND, 'Artifact not found');
    }
    invalidatePattern('artifacts:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return artifact;
  }

  async restore(id) {
    const artifact = await artifactRepository.restore(id);
    if (!artifact) {
      throw createError(ErrorCodes.ARTIFACT_NOT_FOUND, 'Artifact not found or not deleted');
    }
    invalidatePattern('artifacts:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return artifact;
  }

  async search(query) {
    return artifactRepository.textSearch(query);
  }

  async batchDelete(ids, userId) {
    const Artifact = require('./artifact.model');
    const result = await Artifact.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true, deletedAt: new Date(), deletedBy: userId || null }
    );
    invalidatePattern('artifacts:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return { deletedCount: result.modifiedCount };
  }

  async batchUpdate(ids, update) {
    const Artifact = require('./artifact.model');
    const { tags, historicalPeriod, origin, periodOrEra, cultureOrCivilization } = update;
    const safeUpdate = {};
    if (tags) safeUpdate.tags = tags;
    if (historicalPeriod) safeUpdate.historicalPeriod = historicalPeriod;
    if (origin) safeUpdate.origin = origin;
    if (periodOrEra) safeUpdate.periodOrEra = periodOrEra;
    if (cultureOrCivilization) safeUpdate.cultureOrCivilization = cultureOrCivilization;

    const result = await Artifact.updateMany({ _id: { $in: ids } }, { $set: safeUpdate });
    invalidatePattern('artifacts:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return { updatedCount: result.modifiedCount };
  }
}

module.exports = new ArtifactService();
