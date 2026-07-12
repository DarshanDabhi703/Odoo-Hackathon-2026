import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '../shared/errors';
import { sendError } from '../shared/response';

/**
 * requireRole factory — returns middleware that checks req.user.role
 * against the allowed-roles list. Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.post('/trips', requireAuth, requireRole(['FleetManager', 'Driver']), handler)
 */
export function requireRole(allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, new ForbiddenError('No authenticated user on request'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        new ForbiddenError(
          `Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`
        )
      );
      return;
    }

    next();
  };
}
