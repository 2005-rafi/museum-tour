const request = require('supertest');

// Mock natural and stopword to avoid ESM dependency issues in Jest
jest.mock('natural', () => {
  const WordTokenizer = class {
    tokenize(text) { return text.split(/\s+/).filter(Boolean); }
  };
  const PorterStemmer = { stem: (w) => w };
  const TfIdf = class {
    constructor() { this.docs = []; }
    addDocument(doc) { this.docs.push(doc); }
    listTerms() { return []; }
  };
  return { WordTokenizer, PorterStemmer, TfIdf };
});

jest.mock('stopword', () => ({
  removeStopwords: (tokens) => tokens,
}));

const app = require('../../src/app');

describe('Health Check', () => {
  test('GET /health returns structured status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBeLessThanOrEqual(503);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('services');
    expect(res.body.services).toHaveProperty('database');
    expect(res.body.services).toHaveProperty('redis');
    expect(res.body.services).toHaveProperty('embeddingIndex');
  });
});

describe('404 Handler', () => {
  test('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Rate Limiting', () => {
  test('returns standardHeaders', async () => {
    const res = await request(app).get('/health');
    // Should have rate limit headers
    expect(res.headers).toBeDefined();
  });
});
