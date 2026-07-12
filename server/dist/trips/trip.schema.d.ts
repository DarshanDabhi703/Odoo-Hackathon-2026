import { z } from 'zod';
export declare const createTripSchema: z.ZodObject<{
    source: z.ZodString;
    destination: z.ZodString;
    vehicleId: z.ZodString;
    driverId: z.ZodString;
    cargoWeight: z.ZodNumber;
    plannedDistance: z.ZodNumber;
    revenue: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
    revenue: number;
}, {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
    revenue?: number | undefined;
}>;
export declare const completeTripSchema: z.ZodObject<{
    actualDistance: z.ZodNumber;
    fuelLiters: z.ZodNumber;
    fuelCost: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    actualDistance: number;
    fuelLiters: number;
    fuelCost: number;
}, {
    actualDistance: number;
    fuelLiters: number;
    fuelCost: number;
}>;
export declare const listTripsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["Draft", "Dispatched", "Completed", "Cancelled"]>>;
    vehicleId: z.ZodOptional<z.ZodString>;
    driverId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "Draft" | "Dispatched" | "Completed" | "Cancelled" | undefined;
    vehicleId?: string | undefined;
    driverId?: string | undefined;
}, {
    status?: "Draft" | "Dispatched" | "Completed" | "Cancelled" | undefined;
    vehicleId?: string | undefined;
    driverId?: string | undefined;
}>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
//# sourceMappingURL=trip.schema.d.ts.map