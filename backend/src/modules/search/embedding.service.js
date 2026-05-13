/**
 * Embedding Search Service
 * Pre-builds TF-IDF vector index at startup for fast semantic-like search.
 * Index is held in memory and rebuilt when documents change.
 */

const natural = require('natural');
const { buildDocumentText, cosineSimilarity } = require('../../utils/textProcessing');
const logger = require('../../middleware/logger');

const ARTIFACT_FIELDS = ['name', 'description', 'tags', 'historicalPeriod', 'origin'];
const MUSEUM_FIELDS = ['name', 'description', 'tags', 'location'];

class EmbeddingService {
  constructor() {
    this.artifactDocs = [];
    this.museumDocs = [];
    this.artifactTexts = [];
    this.museumTexts = [];
    this.isReady = false;
    this._rebuildTimer = null;
  }

  /**
   * Build the complete embedding index from all documents in the database.
   */
  async buildIndex() {
    try {
      const Artifact = require('../artifacts/artifact.model');
      const Museum = require('../museums/museum.model');

      const [artifacts, museums] = await Promise.all([
        Artifact.find({}).lean(),
        Museum.find({}).lean(),
      ]);

      this.artifactDocs = artifacts;
      this.museumDocs = museums;
      this.artifactTexts = artifacts.map((doc) => buildDocumentText(doc, ARTIFACT_FIELDS));
      this.museumTexts = museums.map((doc) => buildDocumentText(doc, MUSEUM_FIELDS));
      this.isReady = true;

      logger.info({
        message: 'Embedding index built successfully',
        artifactCount: artifacts.length,
        museumCount: museums.length,
      });
    } catch (err) {
      logger.error({ message: 'Failed to build embedding index', error: err.message });
    }
  }

  /**
   * Compute TF-IDF vectors for documents + query, then rank by cosine similarity.
   */
  _vectorSearch(docTexts, documents, query, limit) {
    if (docTexts.length === 0) return [];

    const tfidf = new natural.TfIdf();
    docTexts.forEach((text) => tfidf.addDocument(text));
    tfidf.addDocument(query); // query is the last document

    const queryIdx = docTexts.length;
    const queryVector = this._getVector(tfidf, queryIdx);

    const scored = documents.map((doc, i) => {
      const docVector = this._getVector(tfidf, i);
      const score = cosineSimilarity(queryVector, docVector);
      return { ...doc, embeddingScore: score };
    });

    return scored
      .filter((d) => d.embeddingScore > 0.01)
      .sort((a, b) => b.embeddingScore - a.embeddingScore)
      .slice(0, limit);
  }

  _getVector(tfidf, docIndex) {
    const vector = {};
    tfidf.listTerms(docIndex).forEach((item) => {
      vector[item.term] = item.tfidf;
    });
    return vector;
  }

  /**
   * Search artifacts using pre-built embedding index.
   */
  searchArtifacts(query, limit = 30) {
    if (!this.isReady || this.artifactDocs.length === 0) return [];
    return this._vectorSearch(this.artifactTexts, this.artifactDocs, query, limit);
  }

  /**
   * Search museums using pre-built embedding index.
   */
  searchMuseums(query, limit = 30) {
    if (!this.isReady || this.museumDocs.length === 0) return [];
    return this._vectorSearch(this.museumTexts, this.museumDocs, query, limit);
  }

  /**
   * Mark index as stale and schedule a rebuild.
   * Debounced to avoid redundant rebuilds during batch operations.
   */
  invalidate() {
    if (this._rebuildTimer) clearTimeout(this._rebuildTimer);
    this._rebuildTimer = setTimeout(() => {
      this.isReady = false;
      this.buildIndex();
    }, 2000);
  }
}

module.exports = new EmbeddingService();
