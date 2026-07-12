import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export interface JwtPayload {
    sub: string;
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
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=requireAuth.d.ts.map