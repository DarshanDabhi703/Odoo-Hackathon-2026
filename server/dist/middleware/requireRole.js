"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const errors_1 = require("../shared/errors");
const response_1 = require("../shared/response");
/**
 * requireRole factory — returns middleware that checks req.user.role
 * against the allowed-roles list. Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.post('/trips', requireAuth, requireRole(['FleetManager', 'Driver']), handler)
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, new errors_1.ForbiddenError('No authenticated user on request'));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, response_1.sendError)(res, new errors_1.ForbiddenError(`Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`));
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map