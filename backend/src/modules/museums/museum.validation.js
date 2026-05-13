const Joi = require('joi');

// Only allow http(s) URLs for images — blocks javascript: / data: XSS vectors
const safeImageUrl = Joi.string().uri({ scheme: ['http', 'https'] });

const locationSchema = Joi.object({
  address: Joi.string().trim().allow('').default(''),
  city:    Joi.string().trim().required(),
  state:   Joi.string().trim().allow('').default(''),
  country: Joi.string().trim().required(),
  zipCode: Joi.string().trim().allow('').default(''),
});

const safeUrl = Joi.string().uri({ scheme: ['http', 'https'] }).allow('');

const createMuseumSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  location: locationSchema.required(),
  description: Joi.string().required(),
  // Core Historical Context
  establishedYear: Joi.number().integer().min(0).max(new Date().getFullYear()),
  founder: Joi.string().trim().max(200).allow(''),
  originalPurpose: Joi.string().trim().max(500).allow(''),
  // Architectural History
  architecturalStyle: Joi.string().trim().max(200).allow(''),
  architect: Joi.string().trim().max(200).allow(''),
  historicalDesignations: Joi.array().items(Joi.string().trim().max(200)),
  // Educational Scope
  museumType: Joi.string().trim().max(100).allow(''),
  erasCovered: Joi.array().items(Joi.string().trim().max(100)),
  collectionSize: Joi.number().integer().min(0),
  // Interactive Links
  websiteUrl: safeUrl,
  virtualTourUrl: safeUrl,
  images: Joi.array().items(Joi.object({
    url: safeImageUrl.required(),
    caption: Joi.string().allow(''),
  })),
  tags: Joi.array().items(Joi.string().trim()),
});

const updateMuseumSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  location: locationSchema,
  description: Joi.string(),
  establishedYear: Joi.number().integer().min(0).max(new Date().getFullYear()),
  founder: Joi.string().trim().max(200).allow(''),
  originalPurpose: Joi.string().trim().max(500).allow(''),
  architecturalStyle: Joi.string().trim().max(200).allow(''),
  architect: Joi.string().trim().max(200).allow(''),
  historicalDesignations: Joi.array().items(Joi.string().trim().max(200)),
  museumType: Joi.string().trim().max(100).allow(''),
  erasCovered: Joi.array().items(Joi.string().trim().max(100)),
  collectionSize: Joi.number().integer().min(0),
  websiteUrl: safeUrl,
  virtualTourUrl: safeUrl,
  images: Joi.array().items(Joi.object({
    url: safeImageUrl.required(),
    caption: Joi.string().allow(''),
  })),
  tags: Joi.array().items(Joi.string().trim()),
}).min(1);

// ─── Query param schemas ────────────────────────────────────────────────────

const museumListQuerySchema = Joi.object({
  page:   Joi.number().integer().min(1).default(1),
  limit:  Joi.number().integer().min(1).max(100).default(20),
  sort:   Joi.string().valid('name', '-name', 'createdAt', '-createdAt', 'establishedYear', '-establishedYear').default('-createdAt'),
  cursor: Joi.string().trim().allow(''),
});

const museumSearchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(200).required().messages({
    'any.required': 'Search query q is required',
    'string.empty': 'Search query must not be empty',
    'string.min':   'Search query must be at least 1 character',
    'string.max':   'Search query must not exceed 200 characters',
  }),
});

module.exports = { createMuseumSchema, updateMuseumSchema, museumListQuerySchema, museumSearchQuerySchema };
