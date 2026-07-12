import { z } from 'zod';

export const createTripSchema = z.object({
  source: z.string().min(1, 'Source is required').max(200),
  destination: z.string().min(1, 'Destination is required').max(200),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID'),
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  plannedDistance: z.number().positive('Planned distance must be positive'),
  revenue: z.number().min(0, 'Revenue must be non-negative').default(0),
});

export const completeTripSchema = z.object({
  actualDistance: z.number().positive('Actual distance must be positive'),
  fuelLiters: z.number().positive('Fuel liters must be positive'),
  fuelCost: z.number().min(0, 'Fuel cost must be non-negative'),
});

export const listTripsQuerySchema = z.object({
  status: z.enum(['Draft', 'Dispatched', 'Completed', 'Cancelled']).optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
