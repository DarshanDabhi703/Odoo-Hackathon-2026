const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/auth.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

const dashboardQuerySchema = z.object({
  type: z.string().optional(),
  region: z.string().optional(),
});

// Dashboard endpoints available to all authenticated users
router.use(requireAuth);

router.get('/kpis', validateQuery(dashboardQuerySchema), dashboardController.getKPIs);

module.exports = router;
