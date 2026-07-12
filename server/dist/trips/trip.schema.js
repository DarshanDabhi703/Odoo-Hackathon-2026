"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTripsQuerySchema = exports.completeTripSchema = exports.createTripSchema = void 0;
const zod_1 = require("zod");
exports.createTripSchema = zod_1.z.object({
    source: zod_1.z.string().min(1, 'Source is required').max(200),
    destination: zod_1.z.string().min(1, 'Destination is required').max(200),
    vehicleId: zod_1.z.string().uuid('Invalid vehicle ID'),
    driverId: zod_1.z.string().uuid('Invalid driver ID'),
    cargoWeight: zod_1.z.number().positive('Cargo weight must be positive'),
    plannedDistance: zod_1.z.number().positive('Planned distance must be positive'),
    revenue: zod_1.z.number().min(0, 'Revenue must be non-negative').default(0),
});
exports.completeTripSchema = zod_1.z.object({
    actualDistance: zod_1.z.number().positive('Actual distance must be positive'),
    fuelLiters: zod_1.z.number().positive('Fuel liters must be positive'),
    fuelCost: zod_1.z.number().min(0, 'Fuel cost must be non-negative'),
});
exports.listTripsQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['Draft', 'Dispatched', 'Completed', 'Cancelled']).optional(),
    vehicleId: zod_1.z.string().uuid().optional(),
    driverId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=trip.schema.js.map