const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const reportsController = require('./reports.controller');

const router = express.Router();

const reportQuerySchema = z.object({
  type: z.string().optional(),
  region: z.string().optional(),
  from: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format for 'from'" }).optional(),
  to: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format for 'to'" }).optional(),
});

// All report endpoints require authentication and specific roles
router.use(requireAuth);
router.use(requireRole(['FleetManager', 'FinancialAnalyst']));

router.get('/fuel-efficiency', validateQuery(reportQuerySchema), reportsController.getFuelEfficiency);
router.get('/utilization', validateQuery(reportQuerySchema), reportsController.getUtilization);
router.get('/operational-cost', validateQuery(reportQuerySchema), reportsController.getOperationalCost);
router.get('/roi', validateQuery(reportQuerySchema), reportsController.getROI);
router.get('/export.csv', validateQuery(reportQuerySchema), reportsController.exportCSV);

module.exports = router;
