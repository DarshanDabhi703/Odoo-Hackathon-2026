const jwt = require('jsonwebtoken');
const { errorResponse } = require('../shared/response');

/**
 * requireAuth — verifies JWT and attaches req.user
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication token required.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'TOKEN_EXPIRED', 'Authentication token has expired.', 401);
    }
    return errorResponse(res, 'INVALID_TOKEN', 'Invalid authentication token.', 401);
  }
};

module.exports = requireAuth;
