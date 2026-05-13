const Joi = require('joi');

const createMessageSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name must not be empty',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().trim().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  subject: Joi.string().trim().min(1).max(200).required().messages({
    'any.required': 'Subject is required',
    'string.empty': 'Subject must not be empty',
    'string.max': 'Subject cannot exceed 200 characters',
  }),
  content: Joi.string().trim().min(1).max(1000).required().messages({
    'any.required': 'Message content is required',
    'string.empty': 'Message must not be empty',
    'string.max': 'Message cannot exceed 1000 characters',
  }),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('unread', 'read', 'resolved').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of: unread, read, resolved',
  }),
});

const messageListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('unread', 'read', 'resolved').optional(),
});

module.exports = { createMessageSchema, updateStatusSchema, messageListQuerySchema };
