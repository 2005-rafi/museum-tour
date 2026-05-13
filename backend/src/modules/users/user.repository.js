const User = require('./user.model');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findByEmail(email, userId) {
    if (userId) {
      return User.findById(userId).select('+password');
    }
    return User.findOne({ email }).select('+password');
  }

  async findById(id) {
    return User.findById(id);
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    return {
      data: users,
      pagination: { totalItems: total, currentPage: page, totalPages: Math.ceil(total / limit), limit },
    };
  }

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
