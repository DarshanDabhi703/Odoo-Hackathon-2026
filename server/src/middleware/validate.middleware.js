const { errorResponse } = require('../shared/response');

/**
 * Validates req.query against a Zod schema.
 */
const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error.errors && error.errors.length > 0) {
      const issue = error.errors[0];
      return errorResponse(res, 'VALIDATION_ERROR', `${issue.path.join('.')}: ${issue.message}`, 400);
    }
    return errorResponse(res, 'VALIDATION_ERROR', 'Invalid query parameters.', 400);
  }
};

module.exports = { validateQuery };
