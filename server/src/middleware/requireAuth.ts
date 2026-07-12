import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../shared/errors';
import { sendError } from '../shared/response';
import { UserRole } from '@prisma/client';

// Extend Express Request type to carry authenticated user context
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * requireAuth middleware — verifies the Bearer JWT in the Authorization header.
 * On success, attaches req.user with { sub, email, role }.
 * On failure, returns 401 with UNAUTHORIZED_ROLE code.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, new UnauthorizedError('Missing or malformed Authorization header'));
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    sendError(res, new UnauthorizedError('Server misconfiguration: missing JWT_SECRET'));
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    sendError(res, new UnauthorizedError('Invalid or expired token'));
  }
}
