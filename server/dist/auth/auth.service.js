"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../shared/prisma"));
const errors_1 = require("../shared/errors");
const BCRYPT_ROUNDS = 10;
// ─── Login ────────────────────────────────────────────────────────────────────
async function login(input) {
    const user = await prisma_1.default.user.findUnique({ where: { email: input.email } });
    if (!user) {
        // Use the same message to avoid user enumeration
        throw new errors_1.UnauthorizedError('Invalid email or password');
    }
    const passwordValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
    if (!passwordValid) {
        throw new errors_1.UnauthorizedError('Invalid email or password');
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: toSafeUser(user) };
}
// ─── Register ─────────────────────────────────────────────────────────────────
async function register(input) {
    // Check for duplicate email
    const existing = await prisma_1.default.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new errors_1.ValidationError('A user with this email already exists');
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS);
    const user = await prisma_1.default.user.create({
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
function signToken(payload) {
    const secret = process.env.JWT_SECRET;
    const expiry = process.env.JWT_EXPIRY ?? '8h';
    if (!secret)
        throw new errors_1.AppError('INTERNAL_ERROR', 'JWT_SECRET not configured', 500);
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiry });
}
function toSafeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
//# sourceMappingURL=auth.service.js.map