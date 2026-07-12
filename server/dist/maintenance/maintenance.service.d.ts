import { Prisma } from '@prisma/client';
import type { CreateMaintenanceInput, ListMaintenanceQuery } from './maintenance.schema';
/**
 * MaintenanceService — maintenance workflow with vehicle status side-effects.
 *
 * Business Rules enforced here:
 *   BR-9  Creating an active maintenance record => vehicle status becomes 'In Shop'
 *   BR-10 Closing maintenance => vehicle becomes 'Available' (unless 'Retired')
 */
export declare function create(input: CreateMaintenanceInput): Promise<{
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
} & {
    type: string;
    status: import(".prisma/client").$Enums.MaintenanceStatus;
    id: string;
    createdAt: Date;
    vehicleId: string;
    cost: Prisma.Decimal;
    description: string | null;
    closedAt: Date | null;
}>;
export declare function close(logId: string): Promise<{
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
} & {
    type: string;
    status: import(".prisma/client").$Enums.MaintenanceStatus;
    id: string;
    createdAt: Date;
    vehicleId: string;
    cost: Prisma.Decimal;
    description: string | null;
    closedAt: Date | null;
}>;
export declare function list(filters: ListMaintenanceQuery): Promise<({
    vehicle: {
        status: import(".prisma/client").$Enums.VehicleStatus;
        name: string;
        id: string;
        regNumber: string;
    };
} & {
    type: string;
    status: import(".prisma/client").$Enums.MaintenanceStatus;
    id: string;
    createdAt: Date;
    vehicleId: string;
    cost: Prisma.Decimal;
    description: string | null;
    closedAt: Date | null;
})[]>;
export declare function getById(logId: string): Promise<{
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
} & {
    type: string;
    status: import(".prisma/client").$Enums.MaintenanceStatus;
    id: string;
    createdAt: Date;
    vehicleId: string;
    cost: Prisma.Decimal;
    description: string | null;
    closedAt: Date | null;
}>;
//# sourceMappingURL=maintenance.service.d.ts.map