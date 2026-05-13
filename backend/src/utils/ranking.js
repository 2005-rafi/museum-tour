const WEIGHTS = {
  likes: 0.5,
  comments: 0.3,
  similarity: 0.2,
};

/**
 * Compute a composite ranking score for an artifact.
 * Formula: score = (0.5 * likes) + (0.3 * comments) + (0.2 * similarity)
 * Similarity is expected in range [0, 1].
 * Engagement counts are normalized via log scaling to prevent popular items
 * from completely dominating.
 */
const rankResults = (likesCount, commentsCount, searchSimilarity) => {
  const normalizedLikes = Math.log1p(likesCount);
  const normalizedComments = Math.log1p(commentsCount);
  const similarity = Math.max(0, Math.min(1, searchSimilarity));

  return (
    WEIGHTS.likes * normalizedLikes +
    WEIGHTS.comments * normalizedComments +
    WEIGHTS.similarity * similarity
  );
};

/**
 * Combine multiple similarity signals into a single score.
 * tfidfScore:     cosine similarity from TF-IDF vectors [0,1]
 * fuseScore:      Fuse.js match score (lower = better, inverted here)
 * fuzzyScore:     string-similarity dice coefficient [0,1]
 * embeddingScore: pre-built TF-IDF embedding index similarity [0,1]
 *
 * When embedding signal is available, weights shift to 4-signal mode:
 *   TF-IDF 30% | Fuse 25% | Fuzzy 20% | Embedding 25%
 * Otherwise falls back to 3-signal mode:
 *   TF-IDF 45% | Fuse 30% | Fuzzy 25%
 */
const combineSimilarity = (tfidfScore, fuseScore, fuzzyScore, embeddingScore = 0) => {
  const tfidf = tfidfScore || 0;
  const fuse = fuseScore || 0;
  const fuzzy = fuzzyScore || 0;
  const embedding = embeddingScore || 0;

  if (embedding > 0) {
    return (0.30 * tfidf) + (0.25 * fuse) + (0.20 * fuzzy) + (0.25 * embedding);
  }
  return (0.45 * tfidf) + (0.30 * fuse) + (0.25 * fuzzy);
};

module.exports = { rankResults, combineSimilarity, WEIGHTS };
