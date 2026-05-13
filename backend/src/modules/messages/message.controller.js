const Message = require('./message.model');

class MessageController {
  /**
   * POST /api/messages — Public: submit a contact message
   */
  async create(req, res, next) {
    try {
      const { name, email, subject, content } = req.body;
      const message = await Message.create({ name, email, subject, content });
      res.status(201).json({ success: true, data: { id: message._id } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/messages — Admin: paginated list, newest first
   */
  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status) filter.status = req.query.status;

      const [messages, total] = await Promise.all([
        Message.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Message.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: messages,
        pagination: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/messages/unread-count — Admin: quick badge count
   */
  async unreadCount(req, res, next) {
    try {
      const count = await Message.countDocuments({ status: 'unread' });
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/messages/:id — Admin: single message detail
   */
  async getById(req, res, next) {
    try {
      const message = await Message.findById(req.params.id).lean();
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      res.json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/messages/:id/status — Admin: update status
   */
  async updateStatus(req, res, next) {
    try {
      const message = await Message.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true },
      ).lean();
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      res.json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/messages/:id — Admin: permanently delete message
   */
  async remove(req, res, next) {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
