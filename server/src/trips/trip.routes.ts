import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../shared/validate';
import { sendSuccess, sendCreated, sendError } from '../shared/response';
import { createTripSchema, completeTripSchema, listTripsQuerySchema } from './trip.schema';
import * as tripService from './trip.service';

const router = Router();

// All trip routes require authentication
router.use(requireAuth);

// GET /api/trips — all authenticated users (read-scoped by role on service level)
router.get('/', validate(listTripsQuerySchema, 'query'), async (req: Request, res: Response) => {
  try {
    const trips = await tripService.list(req.query as any);
    sendSuccess(res, trips);
  } catch (err) {
    sendError(res, err as Error);
  }
});

// GET /api/trips/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trip = await tripService.getById(req.params.id);
    sendSuccess(res, trip);
  } catch (err) {
    sendError(res, err as Error);
  }
});

// POST /api/trips — FleetManager | Driver
router.post(
  '/',
  requireRole(['FleetManager', 'Driver']),
  validate(createTripSchema),
  async (req: Request, res: Response) => {
    try {
      const trip = await tripService.create(req.body);
      sendCreated(res, trip);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// POST /api/trips/:id/dispatch — FleetManager | Driver
router.post(
  '/:id/dispatch',
  requireRole(['FleetManager', 'Driver']),
  async (req: Request, res: Response) => {
    try {
      const trip = await tripService.dispatch(req.params.id);
      sendSuccess(res, trip);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// POST /api/trips/:id/complete — FleetManager | Driver
router.post(
  '/:id/complete',
  requireRole(['FleetManager', 'Driver']),
  validate(completeTripSchema),
  async (req: Request, res: Response) => {
    try {
      const trip = await tripService.complete(req.params.id, req.body);
      sendSuccess(res, trip);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// POST /api/trips/:id/cancel — FleetManager | Driver
router.post(
  '/:id/cancel',
  requireRole(['FleetManager', 'Driver']),
  async (req: Request, res: Response) => {
    try {
      const trip = await tripService.cancel(req.params.id);
      sendSuccess(res, trip);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

export default router;
