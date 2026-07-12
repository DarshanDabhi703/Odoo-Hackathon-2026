/**
 * Typed domain error classes for TransitOps.
 * These are thrown by service-layer functions and mapped to HTTP responses
 * in the global error handler. Error codes are stable API contracts — do not rename.
 */
export type ErrorCode = 'DUPLICATE_REG_NUMBER' | 'VEHICLE_NOT_AVAILABLE' | 'DRIVER_NOT_AVAILABLE' | 'DRIVER_LICENSE_EXPIRED' | 'DRIVER_SUSPENDED' | 'CARGO_EXCEEDS_CAPACITY' | 'INVALID_STATUS_TRANSITION' | 'UNAUTHORIZED_ROLE' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly httpStatus: number;
    constructor(code: ErrorCode, message: string, httpStatus?: number);
}
export declare class BusinessRuleError extends AppError {
    constructor(code: ErrorCode, message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, id?: string);
}
export declare class ValidationError extends AppError {
    readonly issues: unknown;
    constructor(message: string, issues?: unknown);
}
//# sourceMappingURL=errors.d.ts.map