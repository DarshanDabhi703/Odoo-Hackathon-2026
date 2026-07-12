/**
 * Typed domain error classes for TransitOps.
 * These are thrown by service-layer functions and mapped to HTTP responses
 * in the global error handler. Error codes are stable API contracts — do not rename.
 */

// ─── Error Codes (stable API contract) ───────────────────────────────────────

export type ErrorCode =
  | 'DUPLICATE_REG_NUMBER'
  | 'VEHICLE_NOT_AVAILABLE'
  | 'DRIVER_NOT_AVAILABLE'
  | 'DRIVER_LICENSE_EXPIRED'
  | 'DRIVER_SUSPENDED'
  | 'CARGO_EXCEEDS_CAPACITY'
  | 'INVALID_STATUS_TRANSITION'
  | 'UNAUTHORIZED_ROLE'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

// ─── Base Application Error ───────────────────────────────────────────────────

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;

  constructor(code: ErrorCode, message: string, httpStatus = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Business Rule Errors (HTTP 422 Unprocessable Entity) ────────────────────

export class BusinessRuleError extends AppError {
  constructor(code: ErrorCode, message: string) {
    super(code, message, 422);
    this.name = 'BusinessRuleError';
  }
}

// ─── Auth Errors ──────────────────────────────────────────────────────────────

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED_ROLE', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('UNAUTHORIZED_ROLE', message, 403);
    this.name = 'ForbiddenError';
  }
}

// ─── Not Found Error ──────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', id ? `${resource} '${id}' not found` : `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// ─── Validation Error ─────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  public readonly issues: unknown;

  constructor(message: string, issues?: unknown) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
