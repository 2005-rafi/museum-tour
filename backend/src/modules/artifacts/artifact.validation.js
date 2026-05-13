const Joi = require('joi');

// Only allow http(s) URLs for images — blocks javascript: / data: XSS vectors
const safeImageUrl = Joi.string().uri({ scheme: ['http', 'https'] });

const safeUrl = Joi.string().uri({ scheme: ['http', 'https'] }).allow('');

const dimensionsSchema = Joi.object({
  height: Joi.string().trim().max(50).allow(''),
  width:  Joi.string().trim().max(50).allow(''),
  depth:  Joi.string().trim().max(50).allow(''),
  weight: Joi.string().trim().max(50).allow(''),
  unit:   Joi.string().trim().max(20).allow(''),
});

const createArtifactSchema = Joi.object({
  museumId: Joi.string().hex().length(24).required(),
  name: Joi.string().trim().min(2).max(200).required(),
  historicalPeriod: Joi.string().trim().required(),
  origin: Joi.string().trim().required(),
  description: Joi.string().required(),
  // Creation & Origin
  creationDate: Joi.string().trim().max(100).allow(''),
  periodOrEra: Joi.string().trim().max(100).allow(''),
  cultureOrCivilization: Joi.string().trim().max(200).allow(''),
  originLocation: Joi.string().trim().max(200).allow(''),
  // Discovery Data
  discoveryYear: Joi.number().integer().min(-5000).max(new Date().getFullYear()),
  discoveredBy: Joi.string().trim().max(200).allow(''),
  discoveryLocation: Joi.string().trim().max(200).allow(''),
  // Physical Attributes
  materials: Joi.array().items(Joi.string().trim().max(100)),
  dimensions: dimensionsSchema,
  // Educational Hooks
  historicalSignificance: Joi.string().allow(''),
  funFacts: Joi.array().items(Joi.string().trim().max(500)),
  threeDModelUrl: safeUrl,
  // Legacy fields
  discoveryStory: Joi.string().allow(''),
  culturalSignificance: Joi.string().allow(''),
  images: Joi.array().items(Joi.object({
    url: safeImageUrl.required(),
    caption: Joi.string().allow(''),
  })),
  tags: Joi.array().items(Joi.string().trim()),
});

const updateArtifactSchema = Joi.object({
  museumId: Joi.string().hex().length(24),
  name: Joi.string().trim().min(2).max(200),
  historicalPeriod: Joi.string().trim(),
  origin: Joi.string().trim(),
  description: Joi.string(),
  creationDate: Joi.string().trim().max(100).allow(''),
  periodOrEra: Joi.string().trim().max(100).allow(''),
  cultureOrCivilization: Joi.string().trim().max(200).allow(''),
  originLocation: Joi.string().trim().max(200).allow(''),
  discoveryYear: Joi.number().integer().min(-5000).max(new Date().getFullYear()),
  discoveredBy: Joi.string().trim().max(200).allow(''),
  discoveryLocation: Joi.string().trim().max(200).allow(''),
  materials: Joi.array().items(Joi.string().trim().max(100)),
  dimensions: dimensionsSchema,
  historicalSignificance: Joi.string().allow(''),
  funFacts: Joi.array().items(Joi.string().trim().max(500)),
  threeDModelUrl: safeUrl,
  discoveryStory: Joi.string().allow(''),
  culturalSignificance: Joi.string().allow(''),
  images: Joi.array().items(Joi.object({
    url: safeImageUrl.required(),
    caption: Joi.string().allow(''),
  })),
  tags: Joi.array().items(Joi.string().trim()),
}).min(1);

// ─── Query param schemas ────────────────────────────────────────────────────

const artifactListQuerySchema = Joi.object({
  page:     Joi.number().integer().min(1).default(1),
  limit:    Joi.number().integer().min(1).max(100).default(20),
  sort:     Joi.string().valid('name', '-name', 'createdAt', '-createdAt', 'likesCount', '-likesCount').default('-createdAt'),
  cursor:   Joi.string().trim().allow(''),
  museumId: Joi.string().hex().length(24),
  period:   Joi.string().trim().max(100),
  tags:     Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().max(50)),
    Joi.string().trim().max(200),
  ),
});

const artifactSearchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(200).required().messages({
    'any.required': 'Search query q is required',
    'string.empty': 'Search query must not be empty',
    'string.min':   'Search query must be at least 1 character',
    'string.max':   'Search query must not exceed 200 characters',
  }),
});

// ─── Batch operation schemas ─────────────────────────────────────────────────

const objectIdList = Joi.array()
  .items(Joi.string().hex().length(24).required())
  .min(1)
  .max(100)
  .required()
  .messages({
    'array.min':  'At least one ID is required',
    'array.max':  'Cannot process more than 100 items in a single batch',
    'any.required': 'ids is required',
  });

const batchDeleteSchema = Joi.object({
  ids: objectIdList,
});

const batchUpdateSchema = Joi.object({
  ids: objectIdList,
  update: Joi.object({
    tags:                  Joi.array().items(Joi.string().trim().max(50)),
    historicalPeriod:      Joi.string().trim().max(100),
    origin:                Joi.string().trim().max(100),
    periodOrEra:           Joi.string().trim().max(100),
    cultureOrCivilization: Joi.string().trim().max(200),
  }).min(1).required().messages({
    'object.min': 'update must contain at least one field',
    'any.required': 'update object is required',
  }),
});

module.exports = {
  createArtifactSchema,
  updateArtifactSchema,
  artifactListQuerySchema,
  artifactSearchQuerySchema,
  batchDeleteSchema,
  batchUpdateSchema,
};
