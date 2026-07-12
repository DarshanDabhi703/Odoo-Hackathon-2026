import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../shared/prisma';
import { AppError, UnauthorizedError, ValidationError } from '../shared/errors';
import { JwtPayload } from '../middleware/requireAuth';
import type { LoginInput, RegisterInput } from './auth.schema';

const BCRYPT_ROUNDS = 10;

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    // Use the same message to avoid user enumeration
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return { token, user: toSafeUser(user) };
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<{ token: string; user: SafeUser }> {
  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ValidationError('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return { token, user: toSafeUser(user) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET;
  const expiry = process.env.JWT_EXPIRY ?? '8h';

  if (!secret) throw new AppError('INTERNAL_ERROR', 'JWT_SECRET not configured', 500);

  return jwt.sign(payload, secret, { expiresIn: expiry } as jwt.SignOptions);
}

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
