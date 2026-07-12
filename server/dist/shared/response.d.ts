import { Response } from 'express';
import { AppError } from './errors';
/**
 * Response envelope helpers — enforce the TRD §4.1 contract:
 *   Success: { data: T, error: null }
 *   Failure: { data: null, error: { code: string, message: string } }
 */
export declare function sendSuccess<T>(res: Response, data: T, status?: number): void;
export declare function sendCreated<T>(res: Response, data: T): void;
export declare function sendError(res: Response, error: AppError | Error, status?: number): void;
//# sourceMappingURL=response.d.ts.map