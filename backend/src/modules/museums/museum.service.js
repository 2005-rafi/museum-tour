const museumRepository = require('./museum.repository');
const { createError, ErrorCodes } = require('../../utils/errors');
const { invalidatePattern } = require('../../middleware/cache');
const { withCircuitBreaker } = require('../../middleware/circuitBreaker');
const embeddingService = require('../search/embedding.service');

class MuseumService {
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
    const museum = await museumRepository.create(data);
    invalidatePattern('museums:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return museum;
  }

  async getById(id) {
    const fn = this._getBreaker(
      'museum-getById',
      (mid) => museumRepository.findById(mid),
      () => null
    );
    const museum = await fn(id);
    if (!museum) {
      throw createError(ErrorCodes.MUSEUM_NOT_FOUND, 'Museum not found');
    }
    return museum;
  }

  async getAll(options) {
    const fn = this._getBreaker(
      'museum-getAll',
      (o) => museumRepository.findAll({}, o),
      () => ({ data: [], pagination: { totalItems: 0, currentPage: 1, totalPages: 0, limit: 20 } })
    );
    return fn(options);
  }

  async update(id, data) {
    const museum = await museumRepository.updateById(id, data);
    if (!museum) {
      throw createError(ErrorCodes.MUSEUM_NOT_FOUND, 'Museum not found');
    }
    invalidatePattern('museums:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return museum;
  }

  async delete(id, userId) {
    const museum = await museumRepository.softDelete(id, userId);
    if (!museum) {
      throw createError(ErrorCodes.MUSEUM_NOT_FOUND, 'Museum not found');
    }
    invalidatePattern('museums:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return museum;
  }

  async restore(id) {
    const museum = await museumRepository.restore(id);
    if (!museum) {
      throw createError(ErrorCodes.MUSEUM_NOT_FOUND, 'Museum not found or not deleted');
    }
    invalidatePattern('museums:');
    invalidatePattern('search:');
    embeddingService.invalidate();
    return museum;
  }

  async search(query) {
    return museumRepository.textSearch(query);
  }
}

module.exports = new MuseumService();
