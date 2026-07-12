"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFuelLog = addFuelLog;
exports.listFuelLogs = listFuelLogs;
exports.addExpense = addExpense;
exports.listExpenses = listExpenses;
exports.getVehicleCostSummary = getVehicleCostSummary;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../shared/prisma"));
const errors_1 = require("../shared/errors");
/**
 * FinanceService — fuel log and expense logging with cost aggregation.
 * No business rule side-effects; these are purely additive financial records.
 */
// ─── Fuel Logs ────────────────────────────────────────────────────────────────
async function addFuelLog(input) {
    // Validate vehicle exists
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: input.vehicleId } });
    if (!vehicle)
        throw new errors_1.NotFoundError('Vehicle', input.vehicleId);
    // Validate trip exists if provided
    if (input.tripId) {
        const trip = await prisma_1.default.trip.findUnique({ where: { id: input.tripId } });
        if (!trip)
            throw new errors_1.NotFoundError('Trip', input.tripId);
    }
    return await prisma_1.default.fuelLog.create({
        data: {
            vehicleId: input.vehicleId,
            tripId: input.tripId ?? null,
            liters: new client_1.Prisma.Decimal(input.liters),
            cost: new client_1.Prisma.Decimal(input.cost),
            logDate: new Date(input.logDate),
        },
        include: {
            vehicle: { select: { id: true, name: true, regNumber: true } },
            trip: { select: { id: true, source: true, destination: true } },
        },
    });
}
async function listFuelLogs(filters) {
    return await prisma_1.default.fuelLog.findMany({
        where: {
            ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
            ...(filters.tripId && { tripId: filters.tripId }),
        },
        include: {
            vehicle: { select: { id: true, name: true, regNumber: true } },
            trip: { select: { id: true, source: true, destination: true } },
        },
        orderBy: { logDate: 'desc' },
    });
}
// ─── Expenses ─────────────────────────────────────────────────────────────────
async function addExpense(input) {
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: input.vehicleId } });
    if (!vehicle)
        throw new errors_1.NotFoundError('Vehicle', input.vehicleId);
    return await prisma_1.default.expense.create({
        data: {
            vehicleId: input.vehicleId,
            category: input.category,
            amount: new client_1.Prisma.Decimal(input.amount),
            expenseDate: new Date(input.expenseDate),
            notes: input.notes ?? null,
        },
        include: {
            vehicle: { select: { id: true, name: true, regNumber: true } },
        },
    });
}
async function listExpenses(filters) {
    return await prisma_1.default.expense.findMany({
        where: {
            ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
            ...(filters.category && { category: filters.category }),
        },
        include: {
            vehicle: { select: { id: true, name: true, regNumber: true } },
        },
        orderBy: { expenseDate: 'desc' },
    });
}
// ─── Cost Aggregation (per vehicle) ──────────────────────────────────────────
async function getVehicleCostSummary(vehicleId) {
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle)
        throw new errors_1.NotFoundError('Vehicle', vehicleId);
    const [fuelAgg, maintenanceAgg, expenseAgg, revenueAgg] = await Promise.all([
        prisma_1.default.fuelLog.aggregate({
            where: { vehicleId },
            _sum: { cost: true, liters: true },
        }),
        prisma_1.default.maintenanceLog.aggregate({
            where: { vehicleId },
            _sum: { cost: true },
        }),
        prisma_1.default.expense.aggregate({
            where: { vehicleId },
            _sum: { amount: true },
        }),
        prisma_1.default.trip.aggregate({
            where: { vehicleId, status: 'Completed' },
            _sum: { revenue: true, actualDistance: true },
        }),
    ]);
    const fuelCost = Number(fuelAgg._sum.cost ?? 0);
    const maintenanceCost = Number(maintenanceAgg._sum.cost ?? 0);
    const expenseCost = Number(expenseAgg._sum.amount ?? 0);
    const totalOpsCost = fuelCost + maintenanceCost + expenseCost;
    const totalRevenue = Number(revenueAgg._sum.revenue ?? 0);
    const totalDistance = Number(revenueAgg._sum.actualDistance ?? 0);
    const totalLiters = Number(fuelAgg._sum.liters ?? 0);
    const acquisitionCost = Number(vehicle.acquisitionCost);
    return {
        vehicleId,
        fuelCost,
        maintenanceCost,
        expenseCost,
        totalOperationalCost: totalOpsCost,
        totalRevenue,
        totalDistance,
        fuelEfficiency: totalLiters > 0 ? totalDistance / totalLiters : null,
        roi: acquisitionCost > 0 ? (totalRevenue - totalOpsCost) / acquisitionCost : null,
    };
}
//# sourceMappingURL=finance.service.js.map