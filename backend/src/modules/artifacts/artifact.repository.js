const Artifact = require('./artifact.model');

class ArtifactRepository {
  async create(data) {
    return Artifact.create(data);
  }

  async findById(id) {
    return Artifact.findById(id).populate('museumId', 'name location');
  }

  async findAll(filter = {}, options = {}) {
    const { page, limit = 20, sort = '-createdAt', cursor } = options;

    // Cursor-based pagination
    if (cursor) {
      const cursorFilter = { ...filter, _id: { $lt: cursor } };
      const artifacts = await Artifact.find(cursorFilter)
        .populate('museumId', 'name location')
        .limit(Number(limit) + 1)
        .sort(sort);
      const hasMore = artifacts.length > Number(limit);
      if (hasMore) artifacts.pop();
      const nextCursor = hasMore ? artifacts[artifacts.length - 1]._id : null;
      return { artifacts, hasMore, nextCursor };
    }

    // Offset-based pagination (backwards compatible)
    const pg = Number(page) || 1;
    const lim = Number(limit);
    const skip = (pg - 1) * lim;
    const [artifacts, total] = await Promise.all([
      Artifact.find(filter)
        .populate('museumId', 'name location')
        .skip(skip)
        .limit(lim)
        .sort(sort),
      Artifact.countDocuments(filter),
    ]);
    return {
      data: artifacts,
      pagination: { totalItems: total, currentPage: pg, totalPages: Math.ceil(total / lim), limit: lim },
    };
  }

  async updateById(id, data) {
    return Artifact.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Artifact.findByIdAndDelete(id);
  }

  async softDelete(id, deletedBy) {
    return Artifact.softDeleteById(id, deletedBy);
  }

  async restore(id) {
    return Artifact.restoreById(id);
  }

  async textSearch(query) {
    return Artifact.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .populate('museumId', 'name location')
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);
  }

  async incrementEngagement(id, field, value = 1, session) {
    const opts = { new: true };
    if (session) opts.session = session;
    return Artifact.findByIdAndUpdate(id, { $inc: { [field]: value } }, opts);
  }

  async getAll() {
    return Artifact.find({}).lean();
  }
}

module.exports = new ArtifactRepository();
