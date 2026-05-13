const Comment  = require('../engagement/comment.model');
const Like     = require('../engagement/like.model');
const Artifact = require('../artifacts/artifact.model');
const Museum   = require('../museums/museum.model');
const User     = require('../users/user.model');

// ── Lightweight keyword-based sentiment ──────────────────────────────────────
const POSITIVE = new Set([
  'amazing','beautiful','wonderful','excellent','fantastic','love','great',
  'impressive','stunning','remarkable','fascinating','incredible','brilliant',
  'extraordinary','magnificent','superb','outstanding','awesome','perfect',
  'delightful','gorgeous','breathtaking','exquisite','captivating','inspiring',
  'masterpiece','treasure','elegant','charming','enchanting','splendid',
  'glorious','sublime','spectacular','phenomenal','majestic','lovely',
  'appreciate','admire','enjoy','cool','nice','good','best','favorite',
  'favourite','wow','interesting',
]);

const NEGATIVE = new Set([
  'terrible','awful','bad','poor','disappointing','boring','ugly','worst',
  'hate','dull','overrated','mediocre','unimpressive','waste','horrible',
  'hideous','disgusting','annoying','useless','pointless','pathetic',
  'rubbish','trash','damaged','broken','neglected','meh','sucks','dislike',
  'lame',
]);

function scoreSentiment(text) {
  const words = (text || '').toLowerCase().match(/[a-z']+/g) || [];
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE.has(w)) pos++;
    if (NEGATIVE.has(w)) neg++;
  }
  if (pos + neg === 0) return 'neutral';
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

// ── Helper: range → Date boundaries ──────────────────────────────────────────
function getRangeDates(rangeDays) {
  const now = new Date();
  if (!rangeDays || rangeDays === 'all') return { rangeStart: null, prevStart: null };
  const days = Number(rangeDays) || 30;
  const rangeStart = new Date(now.getTime() - days * 86400000);
  const prevStart  = new Date(rangeStart.getTime() - days * 86400000);
  return { rangeStart, prevStart, days };
}

// ── Helper: count docs in a date range ───────────────────────────────────────
async function countInRange(Model, start, end, extraFilter = {}) {
  const filter = { ...extraFilter };
  if (start || end) {
    filter.createdAt = {};
    if (start) filter.createdAt.$gte = start;
    if (end)   filter.createdAt.$lt  = end;
  }
  return Model.countDocuments(filter);
}

// ── Main analytics handler ───────────────────────────────────────────────────
async function getAnalytics(req, res, next) {
  try {
    const { range } = req.query;
    const { rangeStart, prevStart, days } = getRangeDates(range);
    const now = new Date();
    const weekAgo  = new Date(now.getTime() - 7  * 86400000);
    const twoDayAgo = new Date(now.getTime() - 48 * 3600000);

    const softDeleteFilter = { isDeleted: { $ne: true } };

    // ── 1. KPI totals + deltas (parallel) ────────────────────────────────────
    const [
      totalUsers, totalMuseums, totalArtifacts, totalComments, totalLikes,
      deltaUsers, deltaMuseums, deltaArtifacts, deltaComments, deltaLikes,
      prevUsers, prevMuseums, prevArtifacts, prevComments, prevLikes,
    ] = await Promise.all([
      // Totals
      User.countDocuments({}),
      Museum.countDocuments(softDeleteFilter),
      Artifact.countDocuments(softDeleteFilter),
      Comment.countDocuments(softDeleteFilter),
      Like.countDocuments({}),
      // Current range counts
      ...(rangeStart ? [
        countInRange(User,     rangeStart, now),
        countInRange(Museum,   rangeStart, now, softDeleteFilter),
        countInRange(Artifact, rangeStart, now, softDeleteFilter),
        countInRange(Comment,  rangeStart, now, softDeleteFilter),
        countInRange(Like,     rangeStart, now),
      ] : [0, 0, 0, 0, 0].map(v => Promise.resolve(v))),
      // Previous range counts
      ...(prevStart ? [
        countInRange(User,     prevStart, rangeStart),
        countInRange(Museum,   prevStart, rangeStart, softDeleteFilter),
        countInRange(Artifact, prevStart, rangeStart, softDeleteFilter),
        countInRange(Comment,  prevStart, rangeStart, softDeleteFilter),
        countInRange(Like,     prevStart, rangeStart),
      ] : [0, 0, 0, 0, 0].map(v => Promise.resolve(v))),
    ]);

    const engagementRate = totalArtifacts > 0
      ? +((totalComments + totalLikes) / totalArtifacts).toFixed(2)
      : 0;

    // ── 2. Weekly active users ───────────────────────────────────────────────
    const [activeLikeUsers, activeCommentUsers] = await Promise.all([
      Like.distinct('userId', { createdAt: { $gte: weekAgo } }),
      Comment.distinct('userId', { createdAt: { $gte: weekAgo }, ...softDeleteFilter }),
    ]);
    const weeklyActiveUsers = new Set([
      ...activeLikeUsers.map(String),
      ...activeCommentUsers.map(String),
    ]).size;

    // ── 3. Time-series (likes & comments per day) ────────────────────────────
    const tsStart = rangeStart || new Date(now.getTime() - 30 * 86400000);
    const [likesByDay, commentsByDay] = await Promise.all([
      Like.aggregate([
        { $match: { createdAt: { $gte: tsStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Comment.aggregate([
        { $match: { createdAt: { $gte: tsStart }, ...softDeleteFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge into a filled-date array (every day even with 0)
    const likesMap    = Object.fromEntries(likesByDay.map(d => [d._id, d.count]));
    const commentsMap = Object.fromEntries(commentsByDay.map(d => [d._id, d.count]));
    const timeSeries = [];
    const numDays = days || 30;
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      timeSeries.push({ date: key, likes: likesMap[key] || 0, comments: commentsMap[key] || 0 });
    }

    // ── 4. Top artifacts (by interactions) ───────────────────────────────────
    const topArtifacts = await Artifact.find(softDeleteFilter)
      .populate('museumId', 'name')
      .select('name likesCount commentsCount historicalPeriod')
      .sort({ likesCount: -1 })
      .limit(10)
      .lean();

    const topArtifactsMapped = topArtifacts.map(a => ({
      _id: a._id,
      name: a.name,
      likes: a.likesCount || 0,
      comments: a.commentsCount || 0,
      interactions: (a.likesCount || 0) + (a.commentsCount || 0),
      museum: a.museumId?.name || 'Unknown',
      era: a.historicalPeriod,
    }));

    // ── 5. Top museums (by total engagement across artifacts) ─────────────────
    const topMuseums = await Artifact.aggregate([
      { $match: softDeleteFilter },
      { $group: {
        _id: '$museumId',
        artifactCount:  { $sum: 1 },
        totalLikes:     { $sum: '$likesCount' },
        totalComments:  { $sum: '$commentsCount' },
      }},
      { $sort: { totalLikes: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'museums', localField: '_id', foreignField: '_id', as: 'museum' } },
      { $unwind: { path: '$museum', preserveNullAndEmptyArrays: true } },
      { $project: {
        _id: 1,
        name: { $ifNull: ['$museum.name', 'Unknown'] },
        artifactCount: 1,
        totalLikes: 1,
        totalComments: 1,
        interactions: { $add: ['$totalLikes', '$totalComments'] },
      }},
    ]);

    // ── 6. Era distribution ──────────────────────────────────────────────────
    const eraDistribution = await Artifact.aggregate([
      { $match: softDeleteFilter },
      { $group: { _id: '$historicalPeriod', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).then(docs => docs.map(d => ({ era: d._id || 'Unspecified', count: d.count })));

    // ── 7. Sentiment analysis ────────────────────────────────────────────────
    const sentimentComments = await Comment.find({
      ...softDeleteFilter,
      ...(rangeStart ? { createdAt: { $gte: rangeStart } } : {}),
    })
      .select('commentText artifactId')
      .populate('artifactId', 'name')
      .lean();

    let posCount = 0, neutCount = 0, negCount = 0;
    const artifactSentiments = {};

    for (const c of sentimentComments) {
      const s = scoreSentiment(c.commentText);
      if (s === 'positive') posCount++;
      else if (s === 'negative') negCount++;
      else neutCount++;

      const aid = c.artifactId?._id?.toString();
      if (aid) {
        if (!artifactSentiments[aid]) {
          artifactSentiments[aid] = { name: c.artifactId?.name || 'Unknown', pos: 0, neg: 0, total: 0 };
        }
        artifactSentiments[aid].total++;
        if (s === 'positive') artifactSentiments[aid].pos++;
        if (s === 'negative') artifactSentiments[aid].neg++;
      }
    }

    const totalSentiment = posCount + neutCount + negCount;
    const sentimentScore = totalSentiment > 0
      ? +((posCount - negCount) / totalSentiment).toFixed(2)
      : 0;

    // Controversial = high neg ratio with enough comments
    const controversialArtifacts = Object.values(artifactSentiments)
      .filter(a => a.total >= 3 && a.neg / a.total >= 0.3)
      .sort((a, b) => (b.neg / b.total) - (a.neg / a.total))
      .slice(0, 5)
      .map(a => ({ name: a.name, commentCount: a.total, negativeRatio: +(a.neg / a.total).toFixed(2) }));

    // ── 8. Trending (velocity in last 48h) ───────────────────────────────────
    const [trendLikes, trendComments] = await Promise.all([
      Like.aggregate([
        { $match: { createdAt: { $gte: twoDayAgo } } },
        { $group: { _id: '$artifactId', count: { $sum: 1 } } },
      ]),
      Comment.aggregate([
        { $match: { createdAt: { $gte: twoDayAgo }, ...softDeleteFilter } },
        { $group: { _id: '$artifactId', count: { $sum: 1 } } },
      ]),
    ]);

    const trendMap = {};
    for (const t of trendLikes)    trendMap[t._id] = { likes: t.count, comments: 0 };
    for (const t of trendComments) {
      if (!trendMap[t._id]) trendMap[t._id] = { likes: 0, comments: 0 };
      trendMap[t._id].comments = t.count;
    }

    const trendIds = Object.keys(trendMap);
    let trending = [];
    if (trendIds.length > 0) {
      const mongoose = require('mongoose');
      const trendArtifacts = await Artifact.find({ _id: { $in: trendIds.map(id => new mongoose.Types.ObjectId(id)) } })
        .populate('museumId', 'name')
        .select('name museumId')
        .lean();

      const artifactMap = Object.fromEntries(trendArtifacts.map(a => [a._id.toString(), a]));
      trending = trendIds.map(id => {
        const t = trendMap[id];
        const a = artifactMap[id];
        return {
          _id: id,
          name: a?.name || 'Unknown',
          museum: a?.museumId?.name || 'Unknown',
          recentLikes: t.likes,
          recentComments: t.comments,
          velocity: +(t.likes * 1.5 + t.comments).toFixed(1),
        };
      })
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 10);
    }

    // ── 9. Orphaned artifacts (0 interactions) ───────────────────────────────
    const orphaned = await Artifact.find({
      ...softDeleteFilter,
      likesCount: { $lte: 0 },
      commentsCount: { $lte: 0 },
    })
      .populate('museumId', 'name')
      .select('name historicalPeriod createdAt museumId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .then(docs => docs.map(a => ({
        _id: a._id,
        name: a.name,
        museum: a.museumId?.name || 'Unknown',
        era: a.historicalPeriod,
        createdAt: a.createdAt,
      })));

    // ── 10. Recent activity ──────────────────────────────────────────────────
    const [recentComments, recentLikes] = await Promise.all([
      Comment.find(softDeleteFilter)
        .populate('userId', 'name email')
        .populate('artifactId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Like.find({})
        .populate('userId', 'name email')
        .populate('artifactId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // ── 11. Engagement Heatmap (day of week × hour) ──────────────────────────
    const heatmapQuery = rangeStart ? { createdAt: { $gte: rangeStart } } : {};
    const [heatmapLikes, heatmapComments] = await Promise.all([
      Like.aggregate([
        { $match: heatmapQuery },
        { $group: {
          _id: { dayOfWeek: { $dayOfWeek: '$createdAt' }, hour: { $hour: '$createdAt' } },
          count: { $sum: 1 },
        }},
      ]),
      Comment.aggregate([
        { $match: { ...heatmapQuery, ...softDeleteFilter } },
        { $group: {
          _id: { dayOfWeek: { $dayOfWeek: '$createdAt' }, hour: { $hour: '$createdAt' } },
          count: { $sum: 1 },
        }},
      ]),
    ]);

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmap = [];
    for (let d = 1; d <= 7; d++) {
      for (let h = 0; h < 24; h++) {
        const likes = heatmapLikes.find(x => x._id.dayOfWeek === d && x._id.hour === h)?.count || 0;
        const comments = heatmapComments.find(x => x._id.dayOfWeek === d && x._id.hour === h)?.count || 0;
        heatmap.push({ day: DAYS[d - 1], dayIndex: d - 1, hour: h, count: likes + comments });
      }
    }

    // ── Response ─────────────────────────────────────────────────────────────
    res.json({
      success: true,
      data: {
        kpis: {
          users:     { total: totalUsers,     delta: deltaUsers,     prev: prevUsers },
          museums:   { total: totalMuseums,   delta: deltaMuseums,   prev: prevMuseums },
          artifacts: { total: totalArtifacts, delta: deltaArtifacts, prev: prevArtifacts },
          comments:  { total: totalComments,  delta: deltaComments,  prev: prevComments },
          likes:     { total: totalLikes,     delta: deltaLikes,     prev: prevLikes },
          engagementRate,
          weeklyActiveUsers,
        },
        timeSeries,
        topArtifacts: topArtifactsMapped,
        topMuseums,
        eraDistribution,
        sentiment: {
          positive: posCount,
          neutral: neutCount,
          negative: negCount,
          score: sentimentScore,
          controversialArtifacts,
        },
        trending,
        orphaned,
        heatmap,
        recentActivity: {
          comments: recentComments,
          likes: recentLikes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAnalytics };
