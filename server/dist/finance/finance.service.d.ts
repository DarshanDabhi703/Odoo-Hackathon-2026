import { Prisma } from '@prisma/client';
import type { CreateFuelLogInput, CreateExpenseInput, ListFuelLogsQuery, ListExpensesQuery } from './finance.schema';
/**
 * FinanceService — fuel log and expense logging with cost aggregation.
 * No business rule side-effects; these are purely additive financial records.
 */
export declare function addFuelLog(input: CreateFuelLogInput): Promise<{
    vehicle: {
        name: string;
        id: string;
        regNumber: string;
    };
    trip: {
        id: string;
        source: string;
        destination: string;
    } | null;
} & {
    id: string;
    vehicleId: string;
    liters: Prisma.Decimal;
    cost: Prisma.Decimal;
    logDate: Date;
    tripId: string | null;
}>;
export declare function listFuelLogs(filters: ListFuelLogsQuery): Promise<({
    vehicle: {
        name: string;
        id: string;
        regNumber: string;
    };
    trip: {
        id: string;
        source: string;
        destination: string;
    } | null;
} & {
    id: string;
    vehicleId: string;
    liters: Prisma.Decimal;
    cost: Prisma.Decimal;
    logDate: Date;
    tripId: string | null;
})[]>;
export declare function addExpense(input: CreateExpenseInput): Promise<{
    vehicle: {
        name: string;
        id: string;
        regNumber: string;
    };
} & {
    id: string;
    vehicleId: string;
    category: import(".prisma/client").$Enums.ExpenseCategory;
    amount: Prisma.Decimal;
    expenseDate: Date;
    notes: string | null;
}>;
export declare function listExpenses(filters: ListExpensesQuery): Promise<({
    vehicle: {
        name: string;
        id: string;
        regNumber: string;
    };
} & {
    id: string;
    vehicleId: string;
    category: import(".prisma/client").$Enums.ExpenseCategory;
    amount: Prisma.Decimal;
    expenseDate: Date;
    notes: string | null;
})[]>;
export declare function getVehicleCostSummary(vehicleId: string): Promise<{
    vehicleId: string;
    fuelCost: number;
    maintenanceCost: number;
    expenseCost: number;
    totalOperationalCost: number;
    totalRevenue: number;
    totalDistance: number;
    fuelEfficiency: number | null;
    roi: number | null;
}>;
//# sourceMappingURL=finance.service.d.ts.map