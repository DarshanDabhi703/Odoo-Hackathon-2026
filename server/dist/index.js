"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const response_1 = require("./shared/response");
const errors_1 = require("./shared/errors");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const trip_routes_1 = __importDefault(require("./trips/trip.routes"));
const maintenance_routes_1 = __importDefault(require("./maintenance/maintenance.routes"));
const finance_routes_1 = require("./finance/finance.routes");
// ─── App Setup ────────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
// CORS — allow frontend origin
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
}));
// JSON body parsing
app.use(express_1.default.json());
// ─── Routes ───────────────────────────────────────────────────────────────────
// Health check (unauthenticated)
app.get('/api/health', (_req, res) => {
    res.json({ data: { status: 'ok', timestamp: new Date().toISOString() }, error: null });
});
// Shared Core — Auth
app.use('/api/auth', auth_routes_1.default);
// Operations Module — Trips
app.use('/api/trips', trip_routes_1.default);
// Operations Module — Maintenance
app.use('/api/maintenance', maintenance_routes_1.default);
// Operations Module — Finance
app.use('/api/fuel-logs', finance_routes_1.fuelLogsRouter);
app.use('/api/expenses', finance_routes_1.expensesRouter);
app.use('/api/vehicles', finance_routes_1.vehicleCostRouter); // /api/vehicles/:vehicleId/cost-summary
// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be the last middleware registered
app.use((err, _req, res, _next) => {
    console.error('[TransitOps] Unhandled error:', err);
    if (err instanceof errors_1.AppError) {
        (0, response_1.sendError)(res, err);
    }
    else {
        (0, response_1.sendError)(res, new errors_1.AppError('INTERNAL_ERROR', 'An unexpected error occurred', 500));
    }
});
// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3001', 10);
app.listen(PORT, () => {
    console.log(`✅ TransitOps server running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
});
exports.default = app;
//# sourceMappingURL=index.js.map