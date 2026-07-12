import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodNativeEnum<{
        FleetManager: "FleetManager";
        Driver: "Driver";
        SafetyOfficer: "SafetyOfficer";
        FinancialAnalyst: "FinancialAnalyst";
    }>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    role: "FleetManager" | "Driver" | "SafetyOfficer" | "FinancialAnalyst";
}, {
    email: string;
    password: string;
    name: string;
    role: "FleetManager" | "Driver" | "SafetyOfficer" | "FinancialAnalyst";
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
//# sourceMappingURL=auth.schema.d.ts.map