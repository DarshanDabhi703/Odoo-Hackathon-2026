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
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const validate_1 = require("../shared/validate");
const response_1 = require("../shared/response");
const maintenance_schema_1 = require("./maintenance.schema");
const maintenanceService = __importStar(require("./maintenance.service"));
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
// GET /api/maintenance — all authenticated users
router.get('/', (0, validate_1.validate)(maintenance_schema_1.listMaintenanceQuerySchema, 'query'), async (req, res) => {
    try {
        const logs = await maintenanceService.list(req.query);
        (0, response_1.sendSuccess)(res, logs);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// GET /api/maintenance/:id
router.get('/:id', async (req, res) => {
    try {
        const log = await maintenanceService.getById(req.params.id);
        (0, response_1.sendSuccess)(res, log);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/maintenance — FleetManager only
router.post('/', (0, requireRole_1.requireRole)(['FleetManager']), (0, validate_1.validate)(maintenance_schema_1.createMaintenanceSchema), async (req, res) => {
    try {
        const log = await maintenanceService.create(req.body);
        (0, response_1.sendCreated)(res, log);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/maintenance/:id/close — FleetManager only
router.post('/:id/close', (0, requireRole_1.requireRole)(['FleetManager']), async (req, res) => {
    try {
        const log = await maintenanceService.close(req.params.id);
        (0, response_1.sendSuccess)(res, log);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=maintenance.routes.js.map