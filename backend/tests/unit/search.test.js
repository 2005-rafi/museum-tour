// Mock natural and stopword to avoid ESM dependency issues in Jest
jest.mock('natural', () => {
  const WordTokenizer = class {
    tokenize(text) { return text.split(/\s+/).filter(Boolean); }
  };
  const PorterStemmer = { stem: (w) => w.replace(/(ing|ed|s)$/, '') };
  const TfIdf = class {
    constructor() { this.docs = []; }
    addDocument(doc) { this.docs.push(doc); }
    listTerms(i) {
      if (!this.docs[i]) return [];
      const words = this.docs[i].split(/\s+/).filter(Boolean);
      const freq = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      return Object.entries(freq).map(([term, count]) => ({ term, tfidf: count / words.length }));
    }
  };
  return { WordTokenizer, PorterStemmer, TfIdf };
});

jest.mock('stopword', () => ({
  removeStopwords: (tokens) => tokens.filter(t => !['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of'].includes(t)),
}));

const {
  tokenize,
  buildDocumentText,
  computeTfIdfSimilarity,
  fuzzySimilarity,
  expandQuery,
  cosineSimilarity,
} = require('../../src/utils/textProcessing');
const { rankResults, combineSimilarity } = require('../../src/utils/ranking');

describe('Text Processing', () => {
  test('tokenize produces stemmed tokens without stopwords', () => {
    const tokens = tokenize('The ancient Egyptian pyramids are amazing');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('are');
    expect(tokens.length).toBeGreaterThan(0);
  });

  test('tokenize handles empty/null input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize(null)).toEqual([]);
    expect(tokenize(undefined)).toEqual([]);
  });

  test('buildDocumentText combines fields into searchable blob', () => {
    const doc = { name: 'Gold Mask', description: 'Ancient artifact', tags: ['gold', 'egypt'] };
    const text = buildDocumentText(doc, ['name', 'description', 'tags']);
    expect(text).toContain('Gold Mask');
    expect(text).toContain('Ancient artifact');
    expect(text).toContain('gold egypt');
  });

  test('expandQuery expands and stems query', () => {
    const expanded = expandQuery('Egyptian museums');
    expect(expanded).toBeTruthy();
    expect(expanded.length).toBeGreaterThan(0);
  });

  test('fuzzySimilarity returns score between 0 and 1', () => {
    const score = fuzzySimilarity('egyptian mask', 'egypt golden mask');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('fuzzySimilarity handles empty input', () => {
    expect(fuzzySimilarity('', 'text')).toBe(0);
    expect(fuzzySimilarity('text', '')).toBe(0);
    expect(fuzzySimilarity(null, null)).toBe(0);
  });

  test('cosineSimilarity of identical vectors is 1', () => {
    const vec = { a: 1, b: 2, c: 3 };
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1);
  });

  test('cosineSimilarity of orthogonal vectors is 0', () => {
    const vecA = { a: 1 };
    const vecB = { b: 1 };
    expect(cosineSimilarity(vecA, vecB)).toBe(0);
  });
});

describe('Ranking', () => {
  test('rankResults produces a positive score', () => {
    const score = rankResults(10, 5, 0.8);
    expect(score).toBeGreaterThan(0);
  });

  test('rankResults handles zero engagement', () => {
    const score = rankResults(0, 0, 0.5);
    expect(score).toBeGreaterThan(0);
  });

  test('combineSimilarity without embedding', () => {
    const score = combineSimilarity(0.8, 0.6, 0.4);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('combineSimilarity with embedding signal', () => {
    const withoutEmbed = combineSimilarity(0.8, 0.6, 0.4);
    const withEmbed = combineSimilarity(0.8, 0.6, 0.4, 0.9);
    // Both should return positive scores
    expect(withoutEmbed).toBeGreaterThan(0);
    expect(withEmbed).toBeGreaterThan(0);
  });
});
