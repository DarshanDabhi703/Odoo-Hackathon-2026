import { Response } from 'express';
import { AppError } from './errors';

/**
 * Response envelope helpers — enforce the TRD §4.1 contract:
 *   Success: { data: T, error: null }
 *   Failure: { data: null, error: { code: string, message: string } }
 */

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ data, error: null });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendError(
  res: Response,
  error: AppError | Error,
  status?: number
): void {
  if (error instanceof AppError) {
    res.status(status ?? error.httpStatus).json({
      data: null,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  } else {
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
