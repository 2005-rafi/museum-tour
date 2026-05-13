const natural = require('natural');
const { removeStopwords } = require('stopword');
const stringSimilarity = require('string-similarity');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const tfidfInstance = new natural.TfIdf();

/**
 * Tokenize, remove stopwords, and stem text
 */
const tokenize = (text) => {
  if (!text || typeof text !== 'string') return [];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = removeStopwords(tokens);
  return filtered.map(token => stemmer.stem(token));
};

/**
 * Build a searchable text blob from a document's key fields
 */
const buildDocumentText = (doc, fields) => {
  return fields
    .map(f => {
      const val = doc[f];
      if (Array.isArray(val)) return val.join(' ');
      if (val && typeof val === 'object') return Object.values(val).filter(Boolean).join(' ');
      return val || '';
    })
    .join(' ');
};

/**
 * Build TF-IDF vectors for a corpus and return a scoring function
 */
const buildTfIdfIndex = (documents) => {
  const tfidf = new natural.TfIdf();
  documents.forEach(doc => tfidf.addDocument(doc));
  return tfidf;
};

/**
 * Get TF-IDF vector for a document at given index
 */
const getTfIdfVector = (tfidf, docIndex) => {
  const vector = {};
  tfidf.listTerms(docIndex).forEach(item => {
    vector[item.term] = item.tfidf;
  });
  return vector;
};

/**
 * Compute cosine similarity between two term-frequency vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};

/**
 * Compute TF-IDF similarity between a query and a corpus of documents.
 * Returns an array of { index, score } sorted descending.
 */
const computeTfIdfSimilarity = (query, documentTexts) => {
  // Build index: documents + query as last entry
  const tfidf = buildTfIdfIndex([...documentTexts, query]);
  const queryIndex = documentTexts.length;
  const queryVector = getTfIdfVector(tfidf, queryIndex);

  const scores = documentTexts.map((_, i) => {
    const docVector = getTfIdfVector(tfidf, i);
    return { index: i, score: cosineSimilarity(queryVector, docVector) };
  });

  return scores;
};

/**
 * Compute fuzzy string similarity between query and a text
 */
const fuzzySimilarity = (query, text) => {
  if (!query || !text) return 0;
  return stringSimilarity.compareTwoStrings(
    query.toLowerCase(),
    text.toLowerCase().substring(0, 500)
  );
};

/**
 * Query expansion: generate stemmed variants of query tokens.
 * Reconstructs a broader search string.
 */
const expandQuery = (query) => {
  const original = tokenizer.tokenize(query.toLowerCase());
  const cleaned = removeStopwords(original);
  const stemmed = cleaned.map(t => stemmer.stem(t));
  // Combine original + stemmed for broader matching
  const expanded = [...new Set([...cleaned, ...stemmed])];
  return expanded.join(' ');
};

module.exports = {
  tokenize,
  buildDocumentText,
  buildTfIdfIndex,
  getTfIdfVector,
  cosineSimilarity,
  computeTfIdfSimilarity,
  fuzzySimilarity,
  expandQuery,
};
