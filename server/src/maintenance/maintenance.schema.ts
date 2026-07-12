import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  type: z.string().min(1, 'Maintenance type is required').max(100),
  description: z.string().max(1000).optional(),
  cost: z.number().min(0, 'Cost must be non-negative').default(0),
});

export const listMaintenanceQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  status: z.enum(['Open', 'Closed']).optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type ListMaintenanceQuery = z.infer<typeof listMaintenanceQuerySchema>;
