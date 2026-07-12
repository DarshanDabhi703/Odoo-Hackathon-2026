"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMaintenanceQuerySchema = exports.createMaintenanceSchema = void 0;
const zod_1 = require("zod");
exports.createMaintenanceSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid('Invalid vehicle ID'),
    type: zod_1.z.string().min(1, 'Maintenance type is required').max(100),
    description: zod_1.z.string().max(1000).optional(),
    cost: zod_1.z.number().min(0, 'Cost must be non-negative').default(0),
});
exports.listMaintenanceQuerySchema = zod_1.z.object({
    vehicleId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['Open', 'Closed']).optional(),
});
//# sourceMappingURL=maintenance.schema.js.map