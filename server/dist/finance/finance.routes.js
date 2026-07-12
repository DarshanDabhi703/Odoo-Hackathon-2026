"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleCostRouter = exports.expensesRouter = exports.fuelLogsRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const validate_1 = require("../shared/validate");
const response_1 = require("../shared/response");
const finance_schema_1 = require("./finance.schema");
const financeService = __importStar(require("./finance.service"));
// ─── Fuel Logs Router ─────────────────────────────────────────────────────────
exports.fuelLogsRouter = (0, express_1.Router)();
exports.fuelLogsRouter.use(requireAuth_1.requireAuth);
exports.fuelLogsRouter.get('/', (0, validate_1.validate)(finance_schema_1.listFuelLogsQuerySchema, 'query'), async (req, res) => {
    try {
        const logs = await financeService.listFuelLogs(req.query);
        (0, response_1.sendSuccess)(res, logs);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
exports.fuelLogsRouter.post('/', (0, requireRole_1.requireRole)(['FleetManager', 'Driver']), (0, validate_1.validate)(finance_schema_1.createFuelLogSchema), async (req, res) => {
    try {
        const log = await financeService.addFuelLog(req.body);
        (0, response_1.sendCreated)(res, log);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// ─── Expenses Router ──────────────────────────────────────────────────────────
exports.expensesRouter = (0, express_1.Router)();
exports.expensesRouter.use(requireAuth_1.requireAuth);
exports.expensesRouter.get('/', (0, validate_1.validate)(finance_schema_1.listExpensesQuerySchema, 'query'), async (req, res) => {
    try {
        const expenses = await financeService.listExpenses(req.query);
        (0, response_1.sendSuccess)(res, expenses);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
exports.expensesRouter.post('/', (0, requireRole_1.requireRole)(['FleetManager']), (0, validate_1.validate)(finance_schema_1.createExpenseSchema), async (req, res) => {
    try {
        const expense = await financeService.addExpense(req.body);
        (0, response_1.sendCreated)(res, expense);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// ─── Cost Summary ─────────────────────────────────────────────────────────────
exports.vehicleCostRouter = (0, express_1.Router)();
exports.vehicleCostRouter.use(requireAuth_1.requireAuth);
exports.vehicleCostRouter.get('/:vehicleId/cost-summary', (0, requireRole_1.requireRole)(['FleetManager', 'FinancialAnalyst']), async (req, res) => {
    try {
        const summary = await financeService.getVehicleCostSummary(req.params.vehicleId);
        (0, response_1.sendSuccess)(res, summary);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
//# sourceMappingURL=finance.routes.js.map