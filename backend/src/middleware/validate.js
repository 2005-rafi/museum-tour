'use strict';

const mongoose = require('mongoose');

/**
 * Joi-based request validation middleware.
 *
 * Validates and coerces a specific part of the request (body, query, or params).
 * On success the validated + stripped value is written back to req[target] so
 * every downstream handler always receives clean, type-correct data.
 *
 * @param {import('joi').Schema} schema
 * @param {'body'|'query'|'params'} [target='body']
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,   // collect all errors, not just the first
    stripUnknown: true,  // drop undeclared keys (防 mass-assignment attacks on body)
    convert: true,       // coerce strings → numbers / booleans for query params
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({
      success: false,
      errorCode: 'E400_VALIDATION',
      message: 'Validation error',
      errors,
    });
  }

  // Write the sanitised value back so downstream has clean data
  req[target] = value;
  next();
};

/**
 * Validates that req.params[paramName] is a valid MongoDB ObjectId.
 * Short-circuits the request with 400 before it ever reaches the service/DB
 * layer, preventing Mongoose CastErrors and unnecessary DB round-trips.
 *
 * @param {string} [paramName='id']
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return res.status(400).json({
      success: false,
      errorCode: 'E400_INVALID_ID',
      message: `'${paramName}' must be a valid 24-character hex ObjectId`,
    });
  }
  next();
};

module.exports = validate;
module.exports.validateObjectId = validateObjectId;
