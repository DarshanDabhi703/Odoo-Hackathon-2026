import React, { useState } from 'react';
import { useKPIs } from '../features/analytics/hooks/useAnalytics';
import KPICard from '../features/analytics/components/KPICard';
import FleetUtilizationChart from '../features/analytics/components/FleetUtilizationChart';
import ReportFilters from '../features/analytics/components/ReportFilters';
import { Truck, Activity, Wrench, CheckCircle } from 'lucide-react';

const DashboardPage = () => {
  const [filters, setFilters] = useState({});
  const { data: kpiData, isLoading, isError } = useKPIs(filters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <ReportFilters onFilterChange={handleFilterChange} />

      {isLoading && <div className="text-slate-500">Loading dashboard...</div>}
      {isError && <div className="text-red-500">Error loading dashboard data.</div>}

      {!isLoading && !isError && kpiData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Active Vehicles" 
              value={kpiData.activeVehicles} 
              icon={Truck}
              description={`Out of ${kpiData.totalVehicles} total`}
            />
            <KPICard 
              title="Fleet Utilization" 
              value={`${kpiData.fleetUtilizationPct}%`} 
              icon={Activity}
              trend={{ value: 2.4 }} // Mock trend for UI since backend doesn't store history
            />
            <KPICard 
              title="Vehicles in Shop" 
              value={kpiData.vehiclesInMaintenance} 
              icon={Wrench}
            />
            <KPICard 
              title="Available Vehicles" 
              value={kpiData.availableVehicles} 
              icon={CheckCircle}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FleetUtilizationChart data={kpiData.vehicleStatusBreakdown} />
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Active Trips</p>
                  <p className="text-2xl font-bold text-slate-900">{kpiData.activeTrips}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Pending Trips</p>
                  <p className="text-2xl font-bold text-slate-900">{kpiData.pendingTrips}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Drivers On Duty</p>
                  <p className="text-2xl font-bold text-slate-900">{kpiData.driversOnDuty}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500">Retired Vehicles</p>
                  <p className="text-2xl font-bold text-slate-900">{kpiData.retiredVehicles}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
