const { errorResponse } = require('../shared/response');

/**
 * requireRole — checks req.user.role against allowed roles array
 * Must be used AFTER requireAuth middleware
 * @param {string[]} allowedRoles
 */
const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication required.', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return errorResponse(
      res,
      'UNAUTHORIZED_ROLE',
      `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      403
    );
  }

  next();
};

module.exports = requireRole;
