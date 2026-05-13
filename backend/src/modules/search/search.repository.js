const Artifact = require('../artifacts/artifact.model');
const Museum = require('../museums/museum.model');

class SearchRepository {
  async searchArtifacts(query, filters = {}, limit = 100) {
    const filter = { $text: { $search: query } };
    if (filters.period) filter.historicalPeriod = filters.period;
    if (filters.tags && filters.tags.length) filter.tags = { $in: filters.tags };
    if (filters.museum) filter.museumId = filters.museum;

    return Artifact.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  }

  async searchMuseums(query, filters = {}, limit = 100) {
    const filter = { $text: { $search: query } };
    if (filters.location) {
      // Escape regex metacharacters to prevent ReDoS attacks
      const escaped = filters.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const locRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { 'location.city': locRegex },
        { 'location.state': locRegex },
        { 'location.country': locRegex },
      ];
    }
    if (filters.tags && filters.tags.length) filter.tags = { $in: filters.tags };

    return Museum.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();
  }

  async getRecentArtifacts(limit = 50) {
    return Artifact.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async getRecentMuseums(limit = 50) {
    return Museum.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

module.exports = new SearchRepository();
