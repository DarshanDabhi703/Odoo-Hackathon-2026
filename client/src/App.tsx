import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

import { LoginPage } from '@/pages/LoginPage';
import { TripsPage } from '@/pages/trips/TripsPage';
import { TripDetailPage } from '@/pages/trips/TripDetailPage';
import { CreateTripPage } from '@/pages/trips/CreateTripPage';
import { MaintenancePage } from '@/pages/maintenance/MaintenancePage';
import { CreateMaintenancePage } from '@/pages/maintenance/CreateMaintenancePage';
import { FinancePage } from '@/pages/finance/FinancePage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                {/* Default redirect */}
                <Route index element={<Navigate to="/trips" replace />} />

                {/* ── Operations: Trips ─────────────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute roles={['FleetManager', 'Driver']} />
                  }
                >
                  <Route path="trips" element={<TripsPage />} />
                  <Route path="trips/new" element={<CreateTripPage />} />
                  <Route path="trips/:id" element={<TripDetailPage />} />
                </Route>

                {/* ── Operations: Maintenance ───────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute roles={['FleetManager', 'SafetyOfficer']} />
                  }
                >
                  <Route path="maintenance" element={<MaintenancePage />} />
                  <Route path="maintenance/new" element={<CreateMaintenancePage />} />
                </Route>

                {/* ── Operations: Finance ───────────────────────────────── */}
                <Route
                  element={
                    <ProtectedRoute
                      roles={['FleetManager', 'Driver', 'FinancialAnalyst']}
                    />
                  }
                >
                  <Route path="finance" element={<FinancePage />} />
                </Route>

                {/* Unauthorized fallback */}
                <Route
                  path="unauthorized"
                  element={
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <p className="text-4xl">🔒</p>
                      <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
                      <p className="text-sm text-muted-foreground">
                        You don't have permission to view this page.
                      </p>
                    </div>
                  }
                />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>

      {(import.meta as any).env?.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
