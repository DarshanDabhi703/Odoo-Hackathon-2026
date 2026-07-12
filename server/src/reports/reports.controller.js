const reportService = require('./report.service');
const { successResponse, errorResponse } = require('../shared/response');

/**
 * GET /api/reports/fuel-efficiency
 * Roles: FleetManager, FinancialAnalyst
 */
const getFuelEfficiency = async (req, res, next) => {
  try {
    const { type, region, from, to } = req.query;
    const data = await reportService.getFuelEfficiency({ type, region, from, to });
    return successResponse(res, data, 'Fuel efficiency report retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/utilization
 * Roles: FleetManager, FinancialAnalyst
 */
const getUtilization = async (req, res, next) => {
  try {
    const { type, region, from, to } = req.query;
    const data = await reportService.getUtilization({ type, region, from, to });
    return successResponse(res, data, 'Fleet utilization report retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/operational-cost
 * Roles: FleetManager, FinancialAnalyst
 */
const getOperationalCost = async (req, res, next) => {
  try {
    const { type, region, from, to } = req.query;
    const data = await reportService.getOperationalCost({ type, region, from, to });
    return successResponse(res, data, 'Operational cost report retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/roi
 * Roles: FleetManager, FinancialAnalyst
 */
const getROI = async (req, res, next) => {
  try {
    const { type, region, from, to } = req.query;
    const data = await reportService.getROI({ type, region, from, to });
    return successResponse(res, data, 'ROI report retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/export.csv
 * Roles: FleetManager, FinancialAnalyst
 */
const exportCSV = async (req, res, next) => {
  try {
    const { type, region, from, to } = req.query;
    const csv = await reportService.exportCSV({ type, region, from, to });

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transitops-report-${timestamp}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { getFuelEfficiency, getUtilization, getOperationalCost, getROI, exportCSV };
