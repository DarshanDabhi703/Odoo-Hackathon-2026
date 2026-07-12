"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long'),
    role: zod_1.z.nativeEnum(client_1.UserRole, {
        errorMap: () => ({
            message: `Role must be one of: ${Object.values(client_1.UserRole).join(', ')}`,
        }),
    }),
});
//# sourceMappingURL=auth.schema.js.map