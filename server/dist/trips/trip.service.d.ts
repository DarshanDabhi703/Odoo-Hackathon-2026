import { Prisma } from '@prisma/client';
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
export declare function create(input: CreateTripInput): Promise<{
    vehicle: {
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        createdAt: Date;
        regNumber: string;
        maxLoadKg: Prisma.Decimal;
        odometer: Prisma.Decimal;
        acquisitionCost: Prisma.Decimal;
        region: string | null;
    };
    driver: {
        status: import(".prisma/client").$Enums.DriverStatus;
        name: string;
        id: string;
        createdAt: Date;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiry: Date;
        contactNumber: string | null;
        safetyScore: Prisma.Decimal;
    };
} & {
    status: import(".prisma/client").$Enums.TripStatus;
    id: string;
    createdAt: Date;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: Prisma.Decimal;
    plannedDistance: Prisma.Decimal;
    revenue: Prisma.Decimal;
    actualDistance: Prisma.Decimal | null;
    dispatchedAt: Date | null;
    completedAt: Date | null;
}>;
export declare function dispatch(tripId: string): Promise<({
    vehicle: {
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        createdAt: Date;
        regNumber: string;
        maxLoadKg: Prisma.Decimal;
        odometer: Prisma.Decimal;
        acquisitionCost: Prisma.Decimal;
        region: string | null;
    };
    driver: {
        status: import(".prisma/client").$Enums.DriverStatus;
        name: string;
        id: string;
        createdAt: Date;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiry: Date;
        contactNumber: string | null;
        safetyScore: Prisma.Decimal;
    };
} & {
    status: import(".prisma/client").$Enums.TripStatus;
    id: string;
    createdAt: Date;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: Prisma.Decimal;
    plannedDistance: Prisma.Decimal;
    revenue: Prisma.Decimal;
    actualDistance: Prisma.Decimal | null;
    dispatchedAt: Date | null;
    completedAt: Date | null;
}) | null>;
export declare function complete(tripId: string, input: CompleteTripInput): Promise<({
    vehicle: {
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        createdAt: Date;
        regNumber: string;
        maxLoadKg: Prisma.Decimal;
        odometer: Prisma.Decimal;
        acquisitionCost: Prisma.Decimal;
        region: string | null;
    };
    driver: {
        status: import(".prisma/client").$Enums.DriverStatus;
        name: string;
        id: string;
        createdAt: Date;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiry: Date;
        contactNumber: string | null;
        safetyScore: Prisma.Decimal;
    };
} & {
    status: import(".prisma/client").$Enums.TripStatus;
    id: string;
    createdAt: Date;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: Prisma.Decimal;
    plannedDistance: Prisma.Decimal;
    revenue: Prisma.Decimal;
    actualDistance: Prisma.Decimal | null;
    dispatchedAt: Date | null;
    completedAt: Date | null;
}) | null>;
export declare function cancel(tripId: string): Promise<({
    vehicle: {
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        createdAt: Date;
        regNumber: string;
        maxLoadKg: Prisma.Decimal;
        odometer: Prisma.Decimal;
        acquisitionCost: Prisma.Decimal;
        region: string | null;
    };
    driver: {
        status: import(".prisma/client").$Enums.DriverStatus;
        name: string;
        id: string;
        createdAt: Date;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiry: Date;
        contactNumber: string | null;
        safetyScore: Prisma.Decimal;
    };
} & {
    status: import(".prisma/client").$Enums.TripStatus;
    id: string;
    createdAt: Date;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: Prisma.Decimal;
    plannedDistance: Prisma.Decimal;
    revenue: Prisma.Decimal;
    actualDistance: Prisma.Decimal | null;
    dispatchedAt: Date | null;
    completedAt: Date | null;
}) | null>;
export declare function list(filters: ListTripsQuery): Promise<({
    vehicle: {
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        regNumber: string;
    };
    driver: {
        status: import(".prisma/client").$Enums.DriverStatus;
        name: string;
        id: string;
        licenseNumber: string;
    };
} & {
    status: import(".prisma/client").$Enums.TripStatus;
    id: string;
    createdAt: Date;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: Prisma.Decimal;
    plannedDistance: Prisma.Decimal;
    revenue: Prisma.Decimal;
    actualDistance: Prisma.Decimal | null;
    dispatchedAt: Date | null;
    completedAt: Date | null;
})[]>;
export declare function getById(tripId: string): Promise<{
    vehicle: {
        type: string;
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        createdAt: Date;
        regNumber: string;
        maxLoadKg: Prisma.Decimal;
        odometer: Prisma.Decimal;
        acquisitionCost: Prisma.Decimal;
        region: string | null;
    };
    driver: {
        status: import(".prisma/client").$Enums.DriverStatus;
        name: string;
        id: string;
        createdAt: Date;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiry: Date;
        contactNumber: string | null;
        safetyScore: Prisma.Decimal;
    };
    fuelLogs: {
        id: string;
        vehicleId: string;
        liters: Prisma.Decimal;
        cost: Prisma.Decimal;
        logDate: Date;
        tripId: string | null;
    }[];
} & {
    status: import(".prisma/client").$Enums.TripStatus;
    id: string;
    createdAt: Date;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: Prisma.Decimal;
    plannedDistance: Prisma.Decimal;
    revenue: Prisma.Decimal;
    actualDistance: Prisma.Decimal | null;
    dispatchedAt: Date | null;
    completedAt: Date | null;
}>;
//# sourceMappingURL=trip.service.d.ts.map