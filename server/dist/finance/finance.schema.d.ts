import { z } from 'zod';
export declare const createFuelLogSchema: z.ZodObject<{
    vehicleId: z.ZodString;
    tripId: z.ZodOptional<z.ZodString>;
    liters: z.ZodNumber;
    cost: z.ZodNumber;
    logDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    vehicleId: string;
    liters: number;
    cost: number;
    logDate: string;
    tripId?: string | undefined;
}, {
    vehicleId: string;
    liters: number;
    cost: number;
    logDate: string;
    tripId?: string | undefined;
}>;
export declare const createExpenseSchema: z.ZodObject<{
    vehicleId: z.ZodString;
    category: z.ZodEnum<["Toll", "Maintenance", "Other"]>;
    amount: z.ZodNumber;
    expenseDate: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    vehicleId: string;
    category: "Toll" | "Maintenance" | "Other";
    amount: number;
    expenseDate: string;
    notes?: string | undefined;
}, {
    vehicleId: string;
    category: "Toll" | "Maintenance" | "Other";
    amount: number;
    expenseDate: string;
    notes?: string | undefined;
}>;
export declare const listFuelLogsQuerySchema: z.ZodObject<{
    vehicleId: z.ZodOptional<z.ZodString>;
    tripId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    vehicleId?: string | undefined;
    tripId?: string | undefined;
}, {
    vehicleId?: string | undefined;
    tripId?: string | undefined;
}>;
export declare const listExpensesQuerySchema: z.ZodObject<{
    vehicleId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["Toll", "Maintenance", "Other"]>>;
}, "strip", z.ZodTypeAny, {
    vehicleId?: string | undefined;
    category?: "Toll" | "Maintenance" | "Other" | undefined;
}, {
    vehicleId?: string | undefined;
    category?: "Toll" | "Maintenance" | "Other" | undefined;
}>;
export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ListFuelLogsQuery = z.infer<typeof listFuelLogsQuerySchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
//# sourceMappingURL=finance.schema.d.ts.map