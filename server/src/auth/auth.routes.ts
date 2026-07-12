import { Router, Request, Response } from 'express';
import { validate } from '../shared/validate';
import { sendSuccess, sendCreated, sendError } from '../shared/response';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { loginSchema, registerSchema } from './auth.schema';
import * as authService from './auth.service';

const router = Router();

// POST /api/auth/login — public
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, err as Error);
  }
});

// POST /api/auth/register — FleetManager or SafetyOfficer only
router.post(
  '/register',
  requireAuth,
  requireRole(['FleetManager', 'SafetyOfficer']),
  validate(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// GET /api/auth/me — any authenticated user
router.get('/me', requireAuth, (req: Request, res: Response) => {
  sendSuccess(res, req.user);
});

export default router;
