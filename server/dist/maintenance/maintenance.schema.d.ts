import { z } from 'zod';
export declare const createMaintenanceSchema: z.ZodObject<{
    vehicleId: z.ZodString;
    type: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    cost: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: string;
    vehicleId: string;
    cost: number;
    description?: string | undefined;
}, {
    type: string;
    vehicleId: string;
    cost?: number | undefined;
    description?: string | undefined;
}>;
export declare const listMaintenanceQuerySchema: z.ZodObject<{
    vehicleId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["Open", "Closed"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "Open" | "Closed" | undefined;
    vehicleId?: string | undefined;
}, {
    status?: "Open" | "Closed" | undefined;
    vehicleId?: string | undefined;
}>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type ListMaintenanceQuery = z.infer<typeof listMaintenanceQuerySchema>;
//# sourceMappingURL=maintenance.schema.d.ts.map