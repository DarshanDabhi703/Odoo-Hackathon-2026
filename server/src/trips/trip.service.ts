import { Prisma } from '@prisma/client';
import prisma from '../shared/prisma';
import { BusinessRuleError, NotFoundError } from '../shared/errors';
import type { CreateTripInput, CompleteTripInput, ListTripsQuery } from './trip.schema';

/**
 * TripService — implements the full trip state machine with all business rules.
 *
 * Business Rules enforced here:
 *   BR-2  Retired/In Shop vehicles unavailable for dispatch
 *   BR-3  Expired or suspended drivers cannot be assigned
 *   BR-4  No double-booking (SELECT FOR UPDATE row locks)
 *   BR-5  Cargo weight <= vehicle max_load_kg
 *   BR-6  Dispatch => vehicle & driver become On Trip
 *   BR-7  Complete => vehicle & driver become Available
 *   BR-8  Cancel => restore Available (only from Dispatched)
 */

// ─── Create (Draft) ───────────────────────────────────────────────────────────

export async function create(input: CreateTripInput) {
  // Validate vehicle exists (availability checked at dispatch, not create)
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: input.vehicleId } }),
    prisma.driver.findUnique({ where: { id: input.driverId } }),
  ]);

  if (!vehicle) throw new NotFoundError('Vehicle', input.vehicleId);
  if (!driver) throw new NotFoundError('Driver', input.driverId);

  const trip = await prisma.trip.create({
    data: {
      source: input.source,
      destination: input.destination,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      cargoWeight: new Prisma.Decimal(input.cargoWeight),
      plannedDistance: new Prisma.Decimal(input.plannedDistance),
      revenue: new Prisma.Decimal(input.revenue ?? 0),
      status: 'Draft',
    },
    include: { vehicle: true, driver: true },
  });

  return trip;
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export async function dispatch(tripId: string) {
  /**
   * Uses a Prisma interactive transaction so we can:
   *   1. SELECT … FOR UPDATE row-lock trip, vehicle, driver
   *   2. Evaluate all business rules (BR-2 through BR-5)
   *   3. Atomically update all three rows (BR-6)
   *   4. Roll back with a typed error if any rule fails
   *
   * Row locking prevents two concurrent dispatch requests from assigning
   * the same vehicle/driver simultaneously (BR-4).
   */
  return await prisma.$transaction(async (tx) => {
    // --- Lock trip row ---
    const trips = await tx.$queryRaw<Array<{
      id: string;
      status: string;
      vehicle_id: string;
      driver_id: string;
      cargo_weight: string;
    }>>`
      SELECT id, status, vehicle_id, driver_id, cargo_weight
      FROM trips
      WHERE id = ${tripId}
      FOR UPDATE
    `;

    if (!trips.length) throw new NotFoundError('Trip', tripId);
    const tripRow = trips[0];

    if (tripRow.status !== 'Draft') {
      throw new BusinessRuleError(
        'INVALID_STATUS_TRANSITION',
        `Trip is '${tripRow.status}', can only dispatch from 'Draft'`
      );
    }

    // --- Lock vehicle row (BR-2, BR-4) ---
    const vehicles = await tx.$queryRaw<Array<{
      id: string;
      status: string;
      max_load_kg: string;
    }>>`
      SELECT id, status, max_load_kg
      FROM vehicles
      WHERE id = ${tripRow.vehicle_id}
      FOR UPDATE
    `;

    if (!vehicles.length) throw new NotFoundError('Vehicle', tripRow.vehicle_id);
    const vehicleRow = vehicles[0];

    if (vehicleRow.status !== 'Available') {
      throw new BusinessRuleError(
        'VEHICLE_NOT_AVAILABLE',
        `Vehicle status is '${vehicleRow.status}'. Only 'Available' vehicles can be dispatched.`
      );
    }

    // --- Lock driver row (BR-3, BR-4) ---
    const drivers = await tx.$queryRaw<Array<{
      id: string;
      status: string;
      license_expiry: Date;
    }>>`
      SELECT id, status, license_expiry
      FROM drivers
      WHERE id = ${tripRow.driver_id}
      FOR UPDATE
    `;

    if (!drivers.length) throw new NotFoundError('Driver', tripRow.driver_id);
    const driverRow = drivers[0];

    if (driverRow.status === 'Suspended') {
      throw new BusinessRuleError('DRIVER_SUSPENDED', 'Driver is suspended and cannot be dispatched.');
    }

    if (driverRow.status !== 'Available') {
      throw new BusinessRuleError(
        'DRIVER_NOT_AVAILABLE',
        `Driver status is '${driverRow.status}'. Only 'Available' drivers can be dispatched.`
      );
    }

    // Check license expiry (BR-3)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(driverRow.license_expiry);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      throw new BusinessRuleError(
        'DRIVER_LICENSE_EXPIRED',
        `Driver license expired on ${expiry.toISOString().split('T')[0]}.`
      );
    }

    // Cargo weight check (BR-5)
    const cargoWeight = parseFloat(tripRow.cargo_weight);
    const maxLoad = parseFloat(vehicleRow.max_load_kg);

    if (cargoWeight > maxLoad) {
      throw new BusinessRuleError(
        'CARGO_EXCEEDS_CAPACITY',
        `Cargo weight ${cargoWeight}kg exceeds vehicle max load ${maxLoad}kg.`
      );
    }

    // --- All checks passed: commit atomic update (BR-6) ---
    const now = new Date();

    await tx.$executeRaw`
      UPDATE trips SET status = 'Dispatched', dispatched_at = ${now} WHERE id = ${tripId}
    `;
    await tx.$executeRaw`
      UPDATE vehicles SET status = 'On Trip' WHERE id = ${tripRow.vehicle_id}
    `;
    await tx.$executeRaw`
      UPDATE drivers SET status = 'On Trip' WHERE id = ${tripRow.driver_id}
    `;

    // Return the updated entities
    const updatedTrip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    return updatedTrip;
  });
}

// ─── Complete ─────────────────────────────────────────────────────────────────

export async function complete(tripId: string, input: CompleteTripInput) {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) throw new NotFoundError('Trip', tripId);

    if (trip.status !== 'Dispatched') {
      throw new BusinessRuleError(
        'INVALID_STATUS_TRANSITION',
        `Trip is '${trip.status}', can only complete from 'Dispatched'`
      );
    }

    const now = new Date();

    // Update trip with actual distance and mark completed (BR-7)
    await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'Completed',
        actualDistance: new Prisma.Decimal(input.actualDistance),
        completedAt: now,
      },
    });

    // Increment odometer on vehicle
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        odometer: { increment: new Prisma.Decimal(input.actualDistance) },
        status: 'Available', // BR-7
      },
    });

    // Restore driver status (BR-7)
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'Available' },
    });

    // Record the fuel log for this trip
    await tx.fuelLog.create({
      data: {
        vehicleId: trip.vehicleId,
        tripId,
        liters: new Prisma.Decimal(input.fuelLiters),
        cost: new Prisma.Decimal(input.fuelCost),
        logDate: now,
      },
    });

    return await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });
  });
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

export async function cancel(tripId: string) {
  return await prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) throw new NotFoundError('Trip', tripId);

    // BR-8: Can only cancel from Dispatched
    if (trip.status !== 'Dispatched') {
      throw new BusinessRuleError(
        'INVALID_STATUS_TRANSITION',
        `Trip is '${trip.status}', can only cancel from 'Dispatched'`
      );
    }

    await tx.trip.update({
      where: { id: tripId },
      data: { status: 'Cancelled' },
    });

    // Restore vehicle and driver to Available (BR-8)
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'Available' },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'Available' },
    });

    return await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });
  });
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function list(filters: ListTripsQuery) {
  return await prisma.trip.findMany({
    where: {
      ...(filters.status && { status: filters.status }),
      ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
      ...(filters.driverId && { driverId: filters.driverId }),
    },
    include: {
      vehicle: { select: { id: true, name: true, regNumber: true, status: true } },
      driver: { select: { id: true, name: true, licenseNumber: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Get Single ───────────────────────────────────────────────────────────────

export async function getById(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      vehicle: true,
      driver: true,
      fuelLogs: true,
    },
  });

  if (!trip) throw new NotFoundError('Trip', tripId);
  return trip;
}
