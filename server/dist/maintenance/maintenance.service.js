"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.close = close;
exports.list = list;
exports.getById = getById;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../shared/prisma"));
const errors_1 = require("../shared/errors");
/**
 * MaintenanceService — maintenance workflow with vehicle status side-effects.
 *
 * Business Rules enforced here:
 *   BR-9  Creating an active maintenance record => vehicle status becomes 'In Shop'
 *   BR-10 Closing maintenance => vehicle becomes 'Available' (unless 'Retired')
 */
// ─── Create (Open a new maintenance log) ─────────────────────────────────────
async function create(input) {
    return await prisma_1.default.$transaction(async (tx) => {
        // Verify the vehicle exists
        const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } });
        if (!vehicle)
            throw new errors_1.NotFoundError('Vehicle', input.vehicleId);
        // Prevent opening maintenance on a Retired vehicle
        if (vehicle.status === 'Retired') {
            throw new errors_1.BusinessRuleError('VEHICLE_NOT_AVAILABLE', 'Cannot open a maintenance record for a Retired vehicle.');
        }
        // Create the maintenance log
        const log = await tx.maintenanceLog.create({
            data: {
                vehicleId: input.vehicleId,
                type: input.type,
                description: input.description,
                cost: new client_1.Prisma.Decimal(input.cost ?? 0),
                status: 'Open',
            },
            include: { vehicle: true },
        });
        // BR-9: Set vehicle to In Shop
        await tx.vehicle.update({
            where: { id: input.vehicleId },
            data: { status: 'InShop' },
        });
        return log;
    });
}
// ─── Close a maintenance log ──────────────────────────────────────────────────
async function close(logId) {
    return await prisma_1.default.$transaction(async (tx) => {
        const log = await tx.maintenanceLog.findUnique({
            where: { id: logId },
            include: { vehicle: true },
        });
        if (!log)
            throw new errors_1.NotFoundError('MaintenanceLog', logId);
        if (log.status === 'Closed') {
            throw new errors_1.BusinessRuleError('INVALID_STATUS_TRANSITION', 'Maintenance log is already closed.');
        }
        const now = new Date();
        // Close the maintenance log
        const updatedLog = await tx.maintenanceLog.update({
            where: { id: logId },
            data: { status: 'Closed', closedAt: now },
            include: { vehicle: true },
        });
        // BR-10: Restore vehicle to Available unless it's Retired
        const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
        if (vehicle && vehicle.status !== 'Retired') {
            await tx.vehicle.update({
                where: { id: log.vehicleId },
                data: { status: 'Available' },
            });
        }
        return updatedLog;
    });
}
// ─── List ─────────────────────────────────────────────────────────────────────
async function list(filters) {
    return await prisma_1.default.maintenanceLog.findMany({
        where: {
            ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
            ...(filters.status && { status: filters.status }),
        },
        include: {
            vehicle: { select: { id: true, name: true, regNumber: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
}
// ─── Get Single ───────────────────────────────────────────────────────────────
async function getById(logId) {
    const log = await prisma_1.default.maintenanceLog.findUnique({
        where: { id: logId },
        include: { vehicle: true },
    });
    if (!log)
        throw new errors_1.NotFoundError('MaintenanceLog', logId);
    return log;
}
//# sourceMappingURL=maintenance.service.js.map