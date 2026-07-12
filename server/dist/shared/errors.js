"use strict";
/**
 * Typed domain error classes for TransitOps.
 * These are thrown by service-layer functions and mapped to HTTP responses
 * in the global error handler. Error codes are stable API contracts — do not rename.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BusinessRuleError = exports.AppError = void 0;
// ─── Base Application Error ───────────────────────────────────────────────────
class AppError extends Error {
    code;
    httpStatus;
    constructor(code, message, httpStatus = 400) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.httpStatus = httpStatus;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
// ─── Business Rule Errors (HTTP 422 Unprocessable Entity) ────────────────────
class BusinessRuleError extends AppError {
    constructor(code, message) {
        super(code, message, 422);
        this.name = 'BusinessRuleError';
    }
}
exports.BusinessRuleError = BusinessRuleError;
// ─── Auth Errors ──────────────────────────────────────────────────────────────
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super('UNAUTHORIZED_ROLE', message, 401);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super('UNAUTHORIZED_ROLE', message, 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
// ─── Not Found Error ──────────────────────────────────────────────────────────
class NotFoundError extends AppError {
    constructor(resource, id) {
        super('NOT_FOUND', id ? `${resource} '${id}' not found` : `${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
// ─── Validation Error ─────────────────────────────────────────────────────────
class ValidationError extends AppError {
    issues;
    constructor(message, issues) {
        super('VALIDATION_ERROR', message, 400);
        this.name = 'ValidationError';
        this.issues = issues;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map