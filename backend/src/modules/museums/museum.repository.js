const Museum = require('./museum.model');

class MuseumRepository {
  async create(data) {
    return Museum.create(data);
  }

  async findById(id) {
    return Museum.findById(id);
  }

  async findAll(filter = {}, options = {}) {
    const { page, limit = 20, sort = '-createdAt', cursor } = options;

    if (cursor) {
      const cursorFilter = { ...filter, _id: { $lt: cursor } };
      const museums = await Museum.find(cursorFilter).limit(Number(limit) + 1).sort(sort);
      const hasMore = museums.length > Number(limit);
      if (hasMore) museums.pop();
      const nextCursor = hasMore ? museums[museums.length - 1]._id : null;
      return { museums, hasMore, nextCursor };
    }

    const pg = Number(page) || 1;
    const lim = Number(limit);
    const skip = (pg - 1) * lim;
    const [museums, total] = await Promise.all([
      Museum.find(filter).skip(skip).limit(lim).sort(sort),
      Museum.countDocuments(filter),
    ]);
    return {
      data: museums,
      pagination: { totalItems: total, currentPage: pg, totalPages: Math.ceil(total / lim), limit: lim },
    };
  }

  async updateById(id, data) {
    return Museum.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Museum.findByIdAndDelete(id);
  }

  async softDelete(id, deletedBy) {
    return Museum.softDeleteById(id, deletedBy);
  }

  async restore(id) {
    return Museum.restoreById(id);
  }

  async textSearch(query) {
    return Museum.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);
  }

  async getAll() {
    return Museum.find({}).lean();
  }
}

module.exports = new MuseumRepository();
