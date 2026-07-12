const reportService = require('../reports/report.service');
const { successResponse } = require('../shared/response');

/**
 * GET /api/dashboard/kpis
 * Roles: All authenticated users
 */
const getKPIs = async (req, res, next) => {
  try {
    const { type, region } = req.query;
    const data = await reportService.getKPIs({ type, region });
    return successResponse(res, data, 'Dashboard KPIs retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getKPIs };
