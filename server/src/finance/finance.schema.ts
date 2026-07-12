import { z } from 'zod';

export const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  tripId: z.string().uuid('Invalid trip ID').optional(),
  liters: z.number().positive('Liters must be positive'),
  cost: z.number().min(0, 'Cost must be non-negative'),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  category: z.enum(['Toll', 'Maintenance', 'Other'], {
    errorMap: () => ({ message: 'Category must be Toll, Maintenance, or Other' }),
  }),
  amount: z.number().min(0, 'Amount must be non-negative'),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  notes: z.string().max(500).optional(),
});

export const listFuelLogsQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
});

export const listExpensesQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  category: z.enum(['Toll', 'Maintenance', 'Other']).optional(),
});

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ListFuelLogsQuery = z.infer<typeof listFuelLogsQuerySchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
