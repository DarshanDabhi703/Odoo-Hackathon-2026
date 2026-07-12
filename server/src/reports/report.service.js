/**
 * ReportService — all analytics aggregation logic via Prisma.
 *
 * Computed fields (from TRD §3.3):
 *  fuel_efficiency        = SUM(trips.actual_distance) / SUM(fuel_logs.liters)  per vehicle
 *  total_operational_cost = SUM(fuel_logs.cost) + SUM(maintenance_logs.cost)    per vehicle
 *  roi                    = (SUM(trips.revenue) − total_operational_cost) / acquisition_cost
 *  fleet_utilization_pct  = COUNT(On Trip) / COUNT(non-Retired) × 100
 */

const prisma = require('../shared/prisma');

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build Prisma date-range filter from query params.
 * @param {string} [from] – ISO date string
 * @param {string} [to]   – ISO date string
 */
const buildDateFilter = (from, to) => {
  const filter = {};
  if (from) filter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    filter.lte = toDate;
  }
  return Object.keys(filter).length ? filter : undefined;
};

/**
 * Build Prisma vehicle WHERE clause from type / region filters.
 */
const buildVehicleFilter = (type, region) => {
  const where = {};
  if (type) where.type = type;
  if (region) where.region = region;
  return where;
};

const toNumber = (val) => (val === null || val === undefined ? 0 : Number(val));

// ─── KPIs ───────────────────────────────────────────────────────────────────

/**
 * GET /api/dashboard/kpis
 * Query params: type, region (vehicle filters)
 */
const getKPIs = async ({ type, region } = {}) => {
  const vehicleWhere = buildVehicleFilter(type, region);

  const [vehicles, activeTrips, pendingTrips, driversOnDuty] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ['status'],
      where: vehicleWhere,
      _count: { status: true },
    }),
    prisma.trip.count({ where: { status: 'Dispatched' } }),
    prisma.trip.count({ where: { status: 'Draft' } }),
    prisma.driver.count({ where: { status: 'On_Trip' } }),
  ]);

  const statusMap = {};
  vehicles.forEach((v) => {
    statusMap[v.status] = v._count.status;
  });

  const onTrip = statusMap['On_Trip'] || 0;
  const available = statusMap['Available'] || 0;
  const inShop = statusMap['In_Shop'] || 0;
  const retired = statusMap['Retired'] || 0;
  const totalVehicles = onTrip + available + inShop + retired;
  const nonRetired = totalVehicles - retired;
  const fleetUtilizationPct = nonRetired > 0 ? Math.round((onTrip / nonRetired) * 10000) / 100 : 0;

  return {
    totalVehicles,
    activeVehicles: onTrip,
    availableVehicles: available,
    vehiclesInMaintenance: inShop,
    retiredVehicles: retired,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilizationPct,
    vehicleStatusBreakdown: {
      Available: available,
      'On Trip': onTrip,
      'In Shop': inShop,
      Retired: retired,
    },
  };
};

// ─── Fuel Efficiency ────────────────────────────────────────────────────────

/**
 * GET /api/reports/fuel-efficiency
 * Query params: type, region, from, to
 */
const getFuelEfficiency = async ({ type, region, from, to } = {}) => {
  const vehicleWhere = buildVehicleFilter(type, region);
  const dateFilter = buildDateFilter(from, to);

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: {
      id: true,
      regNumber: true,
      name: true,
      type: true,
      fuelLogs: {
        where: dateFilter ? { logDate: dateFilter } : undefined,
        select: { liters: true },
      },
      trips: {
        where: {
          status: 'Completed',
          actualDistance: { not: null },
          ...(dateFilter ? { completedAt: dateFilter } : {}),
        },
        select: { actualDistance: true },
      },
    },
    orderBy: { regNumber: 'asc' },
  });

  return vehicles.map((v) => {
    const totalLiters = v.fuelLogs.reduce((sum, f) => sum + toNumber(f.liters), 0);
    const totalDistance = v.trips.reduce((sum, t) => sum + toNumber(t.actualDistance), 0);
    const efficiency = totalLiters > 0 ? Math.round((totalDistance / totalLiters) * 100) / 100 : 0;

    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      name: v.name,
      type: v.type,
      totalDistance,
      totalLiters,
      efficiency, // km per litre
    };
  });
};

// ─── Fleet Utilization ──────────────────────────────────────────────────────

/**
 * GET /api/reports/utilization
 * Query params: type, region, from, to
 */
const getUtilization = async ({ type, region, from, to } = {}) => {
  const vehicleWhere = buildVehicleFilter(type, region);
  const dateFilter = buildDateFilter(from, to);

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: {
      id: true,
      regNumber: true,
      name: true,
      type: true,
      status: true,
      trips: {
        where: dateFilter ? { createdAt: dateFilter } : undefined,
        select: { status: true, dispatchedAt: true, completedAt: true },
      },
    },
    orderBy: { regNumber: 'asc' },
  });

  return vehicles.map((v) => {
    const totalTrips = v.trips.length;
    const completedTrips = v.trips.filter((t) => t.status === 'Completed').length;
    const cancelledTrips = v.trips.filter((t) => t.status === 'Cancelled').length;
    const activeTrips = v.trips.filter((t) => t.status === 'Dispatched').length;

    // Utilization % = completedTrips / totalTrips * 100 (if any trips)
    const utilizationPct = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 10000) / 100 : 0;

    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      name: v.name,
      type: v.type,
      status: v.status,
      totalTrips,
      completedTrips,
      cancelledTrips,
      activeTrips,
      utilizationPct,
    };
  });
};

// ─── Operational Cost ───────────────────────────────────────────────────────

/**
 * GET /api/reports/operational-cost
 * Query params: type, region, from, to
 */
const getOperationalCost = async ({ type, region, from, to } = {}) => {
  const vehicleWhere = buildVehicleFilter(type, region);
  const dateFilter = buildDateFilter(from, to);

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: {
      id: true,
      regNumber: true,
      name: true,
      type: true,
      acquisitionCost: true,
      fuelLogs: {
        where: dateFilter ? { logDate: dateFilter } : undefined,
        select: { cost: true },
      },
      maintenanceLogs: {
        where: dateFilter ? { createdAt: dateFilter } : undefined,
        select: { cost: true },
      },
      expenses: {
        where: dateFilter ? { expenseDate: dateFilter } : undefined,
        select: { amount: true, category: true },
      },
    },
    orderBy: { regNumber: 'asc' },
  });

  return vehicles.map((v) => {
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + toNumber(f.cost), 0);
    const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + toNumber(m.cost), 0);
    const tollCost = v.expenses
      .filter((e) => e.category === 'Toll')
      .reduce((sum, e) => sum + toNumber(e.amount), 0);
    const otherExpenses = v.expenses
      .filter((e) => e.category !== 'Toll' && e.category !== 'Maintenance')
      .reduce((sum, e) => sum + toNumber(e.amount), 0);
    const expenseMaintenanceCost = v.expenses
      .filter((e) => e.category === 'Maintenance')
      .reduce((sum, e) => sum + toNumber(e.amount), 0);

    const totalCost =
      Math.round((fuelCost + maintenanceCost + tollCost + otherExpenses + expenseMaintenanceCost) * 100) / 100;

    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      name: v.name,
      type: v.type,
      acquisitionCost: toNumber(v.acquisitionCost),
      fuelCost: Math.round(fuelCost * 100) / 100,
      maintenanceCost: Math.round((maintenanceCost + expenseMaintenanceCost) * 100) / 100,
      tollCost: Math.round(tollCost * 100) / 100,
      otherExpenses: Math.round(otherExpenses * 100) / 100,
      totalCost,
    };
  });
};

// ─── ROI ────────────────────────────────────────────────────────────────────

/**
 * GET /api/reports/roi
 * Query params: type, region, from, to
 */
const getROI = async ({ type, region, from, to } = {}) => {
  const vehicleWhere = buildVehicleFilter(type, region);
  const dateFilter = buildDateFilter(from, to);

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: {
      id: true,
      regNumber: true,
      name: true,
      type: true,
      acquisitionCost: true,
      fuelLogs: {
        where: dateFilter ? { logDate: dateFilter } : undefined,
        select: { cost: true },
      },
      maintenanceLogs: {
        where: dateFilter ? { createdAt: dateFilter } : undefined,
        select: { cost: true },
      },
      expenses: {
        where: dateFilter ? { expenseDate: dateFilter } : undefined,
        select: { amount: true, category: true },
      },
      trips: {
        where: {
          status: 'Completed',
          ...(dateFilter ? { completedAt: dateFilter } : {}),
        },
        select: { revenue: true },
      },
    },
    orderBy: { regNumber: 'asc' },
  });

  return vehicles.map((v) => {
    const acquisitionCost = toNumber(v.acquisitionCost);
    const revenue = v.trips.reduce((sum, t) => sum + toNumber(t.revenue), 0);
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + toNumber(f.cost), 0);
    
    const dbMaintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + toNumber(m.cost), 0);
    const expenseMaintenanceCost = v.expenses
      .filter((e) => e.category === 'Maintenance')
      .reduce((sum, e) => sum + toNumber(e.amount), 0);
    const maintenanceCost = dbMaintenanceCost + expenseMaintenanceCost;

    const otherExpenses = v.expenses
      .filter((e) => e.category !== 'Maintenance')
      .reduce((sum, e) => sum + toNumber(e.amount), 0);
    const operationalCost = Math.round((fuelCost + maintenanceCost + otherExpenses) * 100) / 100;

    // ROI Formula: (Revenue - (Maintenance Cost + Fuel Cost)) / Acquisition Cost
    const roiNumerator = revenue - (maintenanceCost + fuelCost);
    const roi =
      acquisitionCost > 0
        ? Math.round((roiNumerator / acquisitionCost) * 10000) / 10000
        : 0;

    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      name: v.name,
      type: v.type,
      acquisitionCost,
      revenue: Math.round(revenue * 100) / 100,
      operationalCost,
      netProfit: Math.round((revenue - operationalCost) * 100) / 100,
      roi,
      roiPct: Math.round(roi * 10000) / 100, // as percentage
    };
  });
};

// ─── CSV Export ─────────────────────────────────────────────────────────────

/**
 * GET /api/reports/export.csv
 * Combines all four report datasets into a single CSV.
 */
const exportCSV = async ({ type, region, from, to } = {}) => {
  const filters = { type, region, from, to };

  const [fuelData, utilizationData, costData, roiData] = await Promise.all([
    getFuelEfficiency(filters),
    getUtilization(filters),
    getOperationalCost(filters),
    getROI(filters),
  ]);

  // Build a map of vehicleId → merged row
  const vehicleMap = {};

  fuelData.forEach((v) => {
    vehicleMap[v.vehicleId] = {
      vehicleId: v.vehicleId,
      regNumber: v.regNumber,
      name: v.name,
      type: v.type,
      totalDistance: v.totalDistance,
      totalLiters: v.totalLiters,
      fuelEfficiency: v.efficiency,
    };
  });

  utilizationData.forEach((v) => {
    if (!vehicleMap[v.vehicleId]) vehicleMap[v.vehicleId] = { vehicleId: v.vehicleId, regNumber: v.regNumber, name: v.name, type: v.type };
    vehicleMap[v.vehicleId] = {
      ...vehicleMap[v.vehicleId],
      status: v.status,
      totalTrips: v.totalTrips,
      completedTrips: v.completedTrips,
      cancelledTrips: v.cancelledTrips,
      utilizationPct: v.utilizationPct,
    };
  });

  costData.forEach((v) => {
    if (!vehicleMap[v.vehicleId]) vehicleMap[v.vehicleId] = { vehicleId: v.vehicleId, regNumber: v.regNumber, name: v.name, type: v.type };
    vehicleMap[v.vehicleId] = {
      ...vehicleMap[v.vehicleId],
      acquisitionCost: v.acquisitionCost,
      fuelCost: v.fuelCost,
      maintenanceCost: v.maintenanceCost,
      tollCost: v.tollCost,
      otherExpenses: v.otherExpenses,
      totalCost: v.totalCost,
    };
  });

  roiData.forEach((v) => {
    if (!vehicleMap[v.vehicleId]) vehicleMap[v.vehicleId] = { vehicleId: v.vehicleId, regNumber: v.regNumber, name: v.name, type: v.type };
    vehicleMap[v.vehicleId] = {
      ...vehicleMap[v.vehicleId],
      revenue: v.revenue,
      netProfit: v.netProfit,
      roi: v.roi,
      roiPct: v.roiPct,
    };
  });

  const rows = Object.values(vehicleMap);

  if (rows.length === 0) {
    return 'No data available for the selected filters.\n';
  }

  const headers = [
    'Vehicle ID',
    'Reg Number',
    'Name',
    'Type',
    'Status',
    'Total Trips',
    'Completed Trips',
    'Cancelled Trips',
    'Utilization %',
    'Total Distance (km)',
    'Total Fuel (L)',
    'Fuel Efficiency (km/L)',
    'Fuel Cost',
    'Maintenance Cost',
    'Toll Cost',
    'Other Expenses',
    'Total Operational Cost',
    'Acquisition Cost',
    'Revenue',
    'Net Profit',
    'ROI',
    'ROI %',
  ];

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const csvLines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.vehicleId,
        r.regNumber,
        r.name,
        r.type,
        r.status || '',
        r.totalTrips ?? 0,
        r.completedTrips ?? 0,
        r.cancelledTrips ?? 0,
        r.utilizationPct ?? 0,
        r.totalDistance ?? 0,
        r.totalLiters ?? 0,
        r.fuelEfficiency ?? 0,
        r.fuelCost ?? 0,
        r.maintenanceCost ?? 0,
        r.tollCost ?? 0,
        r.otherExpenses ?? 0,
        r.totalCost ?? 0,
        r.acquisitionCost ?? 0,
        r.revenue ?? 0,
        r.netProfit ?? 0,
        r.roi ?? 0,
        r.roiPct ?? 0,
      ]
        .map(escape)
        .join(',')
    ),
  ];

  return csvLines.join('\r\n');
};

// ─── exports ─────────────────────────────────────────────────────────────────

module.exports = {
  getKPIs,
  getFuelEfficiency,
  getUtilization,
  getOperationalCost,
  getROI,
  exportCSV,
};
