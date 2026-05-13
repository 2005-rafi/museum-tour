const Joi = require('joi');

const commentSchema = Joi.object({
  commentText: Joi.string().trim().min(1).max(2000).required().messages({
    'any.required': 'commentText is required',
    'string.empty': 'Comment must not be empty',
    'string.min':   'Comment must be at least 1 character',
    'string.max':   'Comment must not exceed 2000 characters',
  }),
});

const commentListQuerySchema = Joi.object({
  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = { commentSchema, commentListQuerySchema };
