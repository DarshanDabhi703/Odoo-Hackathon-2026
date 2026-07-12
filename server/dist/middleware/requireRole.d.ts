import { RequestHandler } from 'express';
import { UserRole } from '@prisma/client';
/**
 * requireRole factory — returns middleware that checks req.user.role
 * against the allowed-roles list. Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.post('/trips', requireAuth, requireRole(['FleetManager', 'Driver']), handler)
 */
export declare function requireRole(allowedRoles: UserRole[]): RequestHandler;
//# sourceMappingURL=requireRole.d.ts.map