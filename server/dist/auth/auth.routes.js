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
const validate_1 = require("../shared/validate");
const response_1 = require("../shared/response");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const auth_schema_1 = require("./auth.schema");
const authService = __importStar(require("./auth.service"));
const router = (0, express_1.Router)();
// POST /api/auth/login — public
router.post('/login', (0, validate_1.validate)(auth_schema_1.loginSchema), async (req, res) => {
    try {
        const result = await authService.login(req.body);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// POST /api/auth/register — FleetManager or SafetyOfficer only
router.post('/register', requireAuth_1.requireAuth, (0, requireRole_1.requireRole)(['FleetManager', 'SafetyOfficer']), (0, validate_1.validate)(auth_schema_1.registerSchema), async (req, res) => {
    try {
        const result = await authService.register(req.body);
        (0, response_1.sendCreated)(res, result);
    }
    catch (err) {
        (0, response_1.sendError)(res, err);
    }
});
// GET /api/auth/me — any authenticated user
router.get('/me', requireAuth_1.requireAuth, (req, res) => {
    (0, response_1.sendSuccess)(res, req.user);
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map