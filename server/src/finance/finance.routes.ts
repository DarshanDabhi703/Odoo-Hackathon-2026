import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../shared/validate';
import { sendSuccess, sendCreated, sendError } from '../shared/response';
import {
  createFuelLogSchema,
  createExpenseSchema,
  listFuelLogsQuerySchema,
  listExpensesQuerySchema,
} from './finance.schema';
import * as financeService from './finance.service';

// ─── Fuel Logs Router ─────────────────────────────────────────────────────────

export const fuelLogsRouter = Router();

fuelLogsRouter.use(requireAuth);

fuelLogsRouter.get(
  '/',
  validate(listFuelLogsQuerySchema, 'query'),
  async (req: Request, res: Response) => {
    try {
      const logs = await financeService.listFuelLogs(req.query as any);
      sendSuccess(res, logs);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

fuelLogsRouter.post(
  '/',
  requireRole(['FleetManager', 'Driver']),
  validate(createFuelLogSchema),
  async (req: Request, res: Response) => {
    try {
      const log = await financeService.addFuelLog(req.body);
      sendCreated(res, log);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// ─── Expenses Router ──────────────────────────────────────────────────────────

export const expensesRouter = Router();

expensesRouter.use(requireAuth);

expensesRouter.get(
  '/',
  validate(listExpensesQuerySchema, 'query'),
  async (req: Request, res: Response) => {
    try {
      const expenses = await financeService.listExpenses(req.query as any);
      sendSuccess(res, expenses);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

expensesRouter.post(
  '/',
  requireRole(['FleetManager']),
  validate(createExpenseSchema),
  async (req: Request, res: Response) => {
    try {
      const expense = await financeService.addExpense(req.body);
      sendCreated(res, expense);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);

// ─── Cost Summary ─────────────────────────────────────────────────────────────

export const vehicleCostRouter = Router();

vehicleCostRouter.use(requireAuth);

vehicleCostRouter.get(
  '/:vehicleId/cost-summary',
  requireRole(['FleetManager', 'FinancialAnalyst']),
  async (req: Request, res: Response) => {
    try {
      const summary = await financeService.getVehicleCostSummary(req.params.vehicleId);
      sendSuccess(res, summary);
    } catch (err) {
      sendError(res, err as Error);
    }
  }
);
