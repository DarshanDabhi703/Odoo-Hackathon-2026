import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
type RequestTarget = 'body' | 'query' | 'params';
/**
 * Factory that returns an Express middleware validating the specified part
 * of the request against a Zod schema. Attaches the parsed, typed value back
 * to req[target] so downstream handlers receive clean data.
 */
export declare function validate(schema: ZodSchema, target?: RequestTarget): RequestHandler;
export {};
//# sourceMappingURL=validate.d.ts.map