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
const trip_schema_1 = require("./trip.schema");
const tripService = __importStar(require("./trip.service"));
const router = (0, express_1.Router)();
// All trip routes require authentication
router.use(requireAuth_1.requireAuth);
// GET /api/trips — all authenticated users (read-scoped by role on service level)
router.get('/', (0, validate_1.validate)(trip_schema_1.listTripsQuerySchema, 'query'), async (req, res) => {
    try {
        const trips = await tripService.list(req.query);
        (0, response_1.sendSuccess)(res, trips);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// GET /api/trips/:id
router.get('/:id', async (req, res) => {
    try {
        const trip = await tripService.getById(req.params.id);
        (0, response_1.sendSuccess)(res, trip);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/trips — FleetManager | Driver
router.post('/', (0, requireRole_1.requireRole)(['FleetManager', 'Driver']), (0, validate_1.validate)(trip_schema_1.createTripSchema), async (req, res) => {
    try {
        const trip = await tripService.create(req.body);
        (0, response_1.sendCreated)(res, trip);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/trips/:id/dispatch — FleetManager | Driver
router.post('/:id/dispatch', (0, requireRole_1.requireRole)(['FleetManager', 'Driver']), async (req, res) => {
    try {
        const trip = await tripService.dispatch(req.params.id);
        (0, response_1.sendSuccess)(res, trip);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/trips/:id/complete — FleetManager | Driver
router.post('/:id/complete', (0, requireRole_1.requireRole)(['FleetManager', 'Driver']), (0, validate_1.validate)(trip_schema_1.completeTripSchema), async (req, res) => {
    try {
        const trip = await tripService.complete(req.params.id, req.body);
        (0, response_1.sendSuccess)(res, trip);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/trips/:id/cancel — FleetManager | Driver
router.post('/:id/cancel', (0, requireRole_1.requireRole)(['FleetManager', 'Driver']), async (req, res) => {
    try {
        const trip = await tripService.cancel(req.params.id);
        (0, response_1.sendSuccess)(res, trip);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=trip.routes.js.map