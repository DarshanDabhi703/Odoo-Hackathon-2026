"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendCreated = sendCreated;
exports.sendError = sendError;
const errors_1 = require("./errors");
/**
 * Response envelope helpers — enforce the TRD §4.1 contract:
 *   Success: { data: T, error: null }
 *   Failure: { data: null, error: { code: string, message: string } }
 */
function sendSuccess(res, data, status = 200) {
    res.status(status).json({ data, error: null });
}
function sendCreated(res, data) {
    sendSuccess(res, data, 201);
}
function sendError(res, error, status) {
    if (error instanceof errors_1.AppError) {
        res.status(status ?? error.httpStatus).json({
            data: null,
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }
    else {
        // Unhandled / unexpected — hide internals from the client
        res.status(status ?? 500).json({
            data: null,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
            },
        });
    }
}
//# sourceMappingURL=response.js.map