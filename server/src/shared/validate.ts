import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errors';
import { sendError } from './response';

type RequestTarget = 'body' | 'query' | 'params';

/**
 * Factory that returns an Express middleware validating the specified part
 * of the request against a Zod schema. Attaches the parsed, typed value back
 * to req[target] so downstream handlers receive clean data.
 */
export function validate(schema: ZodSchema, target: RequestTarget = 'body'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const err = new ValidationError(
        'Request validation failed',
        (result.error as ZodError).flatten()
      );
      sendError(res, err);
      return;
    }

    // Replace with the parsed, coerced value (e.g. Zod strips unknown keys)
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
