"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../shared/errors");
const response_1 = require("../shared/response");
/**
 * requireAuth middleware — verifies the Bearer JWT in the Authorization header.
 * On success, attaches req.user with { sub, email, role }.
 * On failure, returns 401 with UNAUTHORIZED_ROLE code.
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, response_1.sendError)(res, new errors_1.UnauthorizedError('Missing or malformed Authorization header'));
        return;
    }
    const token = authHeader.slice(7); // strip "Bearer "
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        (0, response_1.sendError)(res, new errors_1.UnauthorizedError('Server misconfiguration: missing JWT_SECRET'));
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = payload;
        next();
    }
    catch {
        (0, response_1.sendError)(res, new errors_1.UnauthorizedError('Invalid or expired token'));
    }
}
//# sourceMappingURL=requireAuth.js.map