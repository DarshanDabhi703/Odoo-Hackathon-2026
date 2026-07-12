const express = require('express');
const cors = require('cors');
const { errorResponse } = require('./shared/response');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Stub routers for Modules 1 & 2 (Fleet & Operations) so the app boots successfully
app.use('/api/auth', express.Router().post('/login', (req, res) => res.json({ success: true, data: { token: 'stub-jwt-token' } })));
app.use('/api/vehicles', express.Router());
app.use('/api/drivers', express.Router());
app.use('/api/trips', express.Router());
app.use('/api/maintenance', express.Router());
app.use('/api/fuel-logs', express.Router());
app.use('/api/expenses', express.Router());

// Module 3: Analytics Routes
const dashboardRoutes = require('./dashboard/dashboard.routes');
const reportsRoutes = require('./reports/reports.routes');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  return errorResponse(res, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred.', 500);
});

module.exports = app;
