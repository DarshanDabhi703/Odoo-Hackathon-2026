import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({
      message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
    }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
