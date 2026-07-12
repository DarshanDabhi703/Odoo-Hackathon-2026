"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExpensesQuerySchema = exports.listFuelLogsQuerySchema = exports.createExpenseSchema = exports.createFuelLogSchema = void 0;
const zod_1 = require("zod");
exports.createFuelLogSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid('Invalid vehicle ID'),
    tripId: zod_1.z.string().uuid('Invalid trip ID').optional(),
    liters: zod_1.z.number().positive('Liters must be positive'),
    cost: zod_1.z.number().min(0, 'Cost must be non-negative'),
    logDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});
exports.createExpenseSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid('Invalid vehicle ID'),
    category: zod_1.z.enum(['Toll', 'Maintenance', 'Other'], {
        errorMap: () => ({ message: 'Category must be Toll, Maintenance, or Other' }),
    }),
    amount: zod_1.z.number().min(0, 'Amount must be non-negative'),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    notes: zod_1.z.string().max(500).optional(),
});
exports.listFuelLogsQuerySchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid().optional(),
    tripId: zod_1.z.string().uuid().optional(),
});
exports.listExpensesQuerySchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid().optional(),
    category: zod_1.z.enum(['Toll', 'Maintenance', 'Other']).optional(),
});
//# sourceMappingURL=finance.schema.js.map