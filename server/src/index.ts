import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { sendError } from './shared/response';
import { AppError } from './shared/errors';

import authRouter from './auth/auth.routes';
import tripsRouter from './trips/trip.routes';
import maintenanceRouter from './maintenance/maintenance.routes';
import { fuelLogsRouter, expensesRouter, vehicleCostRouter } from './finance/finance.routes';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

// CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);

// JSON body parsing
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (unauthenticated)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() }, error: null });
});

// Shared Core — Auth
app.use('/api/auth', authRouter);

// Operations Module — Trips
app.use('/api/trips', tripsRouter);

// Operations Module — Maintenance
app.use('/api/maintenance', maintenanceRouter);

// Operations Module — Finance
app.use('/api/fuel-logs', fuelLogsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/vehicles', vehicleCostRouter); // /api/vehicles/:vehicleId/cost-summary

// ─── Global Error Handler ─────────────────────────────────────────────────────

// Must be the last middleware registered
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[TransitOps] Unhandled error:', err);

  if (err instanceof AppError) {
    sendError(res, err);
  } else {
    sendError(res, new AppError('INTERNAL_ERROR', 'An unexpected error occurred', 500));
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.listen(PORT, () => {
  console.log(`✅ TransitOps server running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
});

export default app;
