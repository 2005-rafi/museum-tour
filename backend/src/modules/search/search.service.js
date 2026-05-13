const Fuse = require('fuse.js');
const searchRepository = require('./search.repository');
const embeddingService = require('./embedding.service');
const { rankResults, combineSimilarity } = require('../../utils/ranking');
const {
  expandQuery,
  buildDocumentText,
  computeTfIdfSimilarity,
  fuzzySimilarity,
} = require('../../utils/textProcessing');

const ARTIFACT_TEXT_FIELDS = ['name', 'description', 'tags', 'historicalPeriod', 'origin'];
const MUSEUM_TEXT_FIELDS = ['name', 'description', 'tags', 'location'];
const MAX_RESULTS = 30;

class SearchService {
  async search(query, filters = {}) {
    const expandedQuery = expandQuery(query);
    const { type, period, tags, location, museum } = filters;

    const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];
    const artifactFilters = {};
    const museumFilters = {};
    if (period) artifactFilters.period = period;
    if (parsedTags.length) { artifactFilters.tags = parsedTags; museumFilters.tags = parsedTags; }
    if (location) museumFilters.location = location;
    if (museum) artifactFilters.museum = museum;

    const searchArtifacts = !type || type === 'artifact';
    const searchMuseums = !type || type === 'museum';

    const [artifacts, museums] = await Promise.all([
      searchArtifacts ? searchRepository.searchArtifacts(expandedQuery, artifactFilters, 100) : [],
      searchMuseums ? searchRepository.searchMuseums(expandedQuery, museumFilters, 100) : [],
    ]);

    // Get embedding results as additional candidates
    let embeddingArtifacts = [];
    let embeddingMuseums = [];
    if (embeddingService.isReady) {
      if (searchArtifacts) embeddingArtifacts = embeddingService.searchArtifacts(query, 50);
      if (searchMuseums) embeddingMuseums = embeddingService.searchMuseums(query, 50);
    }

    // Merge text search results with embedding results (deduplicate by _id)
    const mergedArtifacts = this._mergeResults(artifacts, embeddingArtifacts);
    const mergedMuseums = this._mergeResults(museums, embeddingMuseums);

    // Return actual matches only — no fallback to unrelated recent items
    const finalArtifacts = searchArtifacts ? mergedArtifacts : [];
    const finalMuseums = searchMuseums ? mergedMuseums : [];

    const rankedArtifacts = this._rankDocuments(query, finalArtifacts, ARTIFACT_TEXT_FIELDS, true);
    const rankedMuseums = this._rankDocuments(query, finalMuseums, MUSEUM_TEXT_FIELDS, false);

    return {
      query,
      filters,
      artifacts: rankedArtifacts.slice(0, MAX_RESULTS),
      museums: rankedMuseums.slice(0, MAX_RESULTS),
      totalResults: rankedArtifacts.length + rankedMuseums.length,
    };
  }

  /**
   * Merge text search results with embedding results, deduplicating by _id.
   * Embedding scores are preserved on merged documents for the 4th ranking signal.
   */
  _mergeResults(textResults, embeddingResults) {
    const idMap = new Map();
    // Add text search results first
    for (const doc of textResults) {
      const id = (doc._id || doc.id || '').toString();
      idMap.set(id, { ...doc, embeddingScore: 0 });
    }
    // Merge embedding results — add score to existing or insert new
    for (const doc of embeddingResults) {
      const id = (doc._id || doc.id || '').toString();
      if (idMap.has(id)) {
        idMap.get(id).embeddingScore = doc.embeddingScore || 0;
      } else {
        idMap.set(id, { ...doc });
      }
    }
    return Array.from(idMap.values());
  }

  /**
   * Score and rank documents using 4-signal NLP pipeline:
   * 1. TF-IDF cosine similarity
   * 2. Fuse.js fuzzy matching
   * 3. String-similarity dice coefficient
   * 4. Pre-built embedding index similarity (when available)
   * Combined score + engagement signals (for artifacts)
   */
  _rankDocuments(query, documents, textFields, useEngagement) {
    if (!documents.length) return [];

    // Build text blobs for TF-IDF
    const documentTexts = documents.map(doc => buildDocumentText(doc, textFields));

    // Signal 1: TF-IDF cosine similarity
    const tfidfScores = computeTfIdfSimilarity(query, documentTexts);

    // Signal 2: Fuse.js fuzzy matching
    const fuseKeys = textFields.map(f => ({ name: f, weight: 1 / textFields.length }));
    const fuse = new Fuse(documents, {
      keys: fuseKeys,
      threshold: 0.5,
      includeScore: true,
    });
    const fuseResults = fuse.search(query);
    const fuseScoreMap = new Map();
    fuseResults.forEach(r => {
      fuseScoreMap.set(r.refIndex, 1 - (r.score || 0));
    });

    // Score each document with combined multi-signal similarity
    const scored = documents.map((doc, i) => {
      const tfidfScore = tfidfScores[i]?.score || 0;
      const fuseScore = fuseScoreMap.get(i) || 0;
      const fuzzyScore = fuzzySimilarity(query, documentTexts[i]);
      const embeddingScore = doc.embeddingScore || 0;

      const similarity = combineSimilarity(tfidfScore, fuseScore, fuzzyScore, embeddingScore);

      const searchScore = useEngagement
        ? rankResults(doc.likesCount || 0, doc.commentsCount || 0, similarity)
        : similarity;

      return {
        ...doc,
        searchScore,
        type: useEngagement ? 'artifact' : 'museum',
      };
    });

    // Filter out zero-score results when we have enough results, sort descending
    const meaningful = scored.filter(d => d.searchScore > 0.01);
    const results = meaningful.length > 0 ? meaningful : scored;
    return results.sort((a, b) => b.searchScore - a.searchScore);
  }
}

module.exports = new SearchService();
