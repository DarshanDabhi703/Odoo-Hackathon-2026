import { Prisma } from '@prisma/client';
import prisma from '../shared/prisma';
import { NotFoundError } from '../shared/errors';
import type {
  CreateFuelLogInput,
  CreateExpenseInput,
  ListFuelLogsQuery,
  ListExpensesQuery,
} from './finance.schema';

/**
 * FinanceService — fuel log and expense logging with cost aggregation.
 * No business rule side-effects; these are purely additive financial records.
 */

// ─── Fuel Logs ────────────────────────────────────────────────────────────────

export async function addFuelLog(input: CreateFuelLogInput) {
  // Validate vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) throw new NotFoundError('Vehicle', input.vehicleId);

  // Validate trip exists if provided
  if (input.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: input.tripId } });
    if (!trip) throw new NotFoundError('Trip', input.tripId);
  }

  return await prisma.fuelLog.create({
    data: {
      vehicleId: input.vehicleId,
      tripId: input.tripId ?? null,
      liters: new Prisma.Decimal(input.liters),
      cost: new Prisma.Decimal(input.cost),
      logDate: new Date(input.logDate),
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
      trip: { select: { id: true, source: true, destination: true } },
    },
  });
}

export async function listFuelLogs(filters: ListFuelLogsQuery) {
  return await prisma.fuelLog.findMany({
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

export async function addExpense(input: CreateExpenseInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) throw new NotFoundError('Vehicle', input.vehicleId);

  return await prisma.expense.create({
    data: {
      vehicleId: input.vehicleId,
      category: input.category,
      amount: new Prisma.Decimal(input.amount),
      expenseDate: new Date(input.expenseDate),
      notes: input.notes ?? null,
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true } },
    },
  });
}

export async function listExpenses(filters: ListExpensesQuery) {
  return await prisma.expense.findMany({
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

export async function getVehicleCostSummary(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new NotFoundError('Vehicle', vehicleId);

  const [fuelAgg, maintenanceAgg, expenseAgg, revenueAgg] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true, liters: true },
    }),
    prisma.maintenanceLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    }),
    prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true },
    }),
    prisma.trip.aggregate({
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
