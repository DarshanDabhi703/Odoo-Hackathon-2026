import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../shared/validate';
import { sendSuccess, sendCreated, sendError } from '../shared/response';
import { createMaintenanceSchema, listMaintenanceQuerySchema } from './maintenance.schema';
import * as maintenanceService from './maintenance.service';

const router = Router();

router.use(requireAuth);

// GET /api/maintenance — all authenticated users
router.get(
  '/',
  validate(listMaintenanceQuerySchema, 'query'),
  async (req: Request, res: Response) => {
    try {
      const logs = await maintenanceService.list(req.query as any);
      sendSuccess(res, logs);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// GET /api/maintenance/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const log = await maintenanceService.getById(req.params.id);
    sendSuccess(res, log);
  } catch (err) {
    sendError(res, err as Error);
  }
});

// POST /api/maintenance — FleetManager only
router.post(
  '/',
  requireRole(['FleetManager']),
  validate(createMaintenanceSchema),
  async (req: Request, res: Response) => {
    try {
      const log = await maintenanceService.create(req.body);
      sendCreated(res, log);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// POST /api/maintenance/:id/close — FleetManager only
router.post(
  '/:id/close',
  requireRole(['FleetManager']),
  async (req: Request, res: Response) => {
    try {
      const log = await maintenanceService.close(req.params.id);
      sendSuccess(res, log);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

export default router;
