import React, { useState } from 'react';
import { useKPIs } from '../features/analytics/hooks/useAnalytics';
import FleetUtilizationChart from '../features/analytics/components/FleetUtilizationChart';
import ReportFilters from '../features/analytics/components/ReportFilters';
import {
  Truck,
  Activity,
  Wrench,
  CheckCircle,
  Navigation,
  Clock,
  Users,
  Archive,
} from 'lucide-react';

/* ── KPI Card ────────────────────────────────────────────── */
const KPICard = ({ title, value, icon: Icon, trend, description, delay = 0 }) => (
  <div
    className="kpi-card animate-fade-up"
    style={{ animationDelay: `${delay}s` }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <p
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--on-surface-muted)',
        }}
      >
        {title}
      </p>
      {Icon && (
        <div className="icon-badge">
          <Icon size={16} />
        </div>
      )}
    </div>

    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {trend && (
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: trend.value >= 0 ? '#10b981' : '#ef4444',
          }}
        >
          {trend.value >= 0 ? '+' : ''}{trend.value}%
        </span>
      )}
    </div>

    {description && (
      <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: '0.375rem' }}>
        {description}
      </p>
    )}

    {/* Subtle bottom accent line */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, var(--secondary) 0%, transparent 100%)',
        borderRadius: '0 0 0.75rem 0.75rem',
        opacity: 0.5,
      }}
    />
  </div>
);

/* ── Quick Stat item ─────────────────────────────────────── */
const QuickStat = ({ label, value, icon: Icon, color = 'var(--secondary)' }) => (
  <div
    style={{
      padding: '1rem',
      borderRadius: '0.5rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.25)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Icon && <Icon size={14} style={{ color }} />}
      <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
        {label}
      </p>
    </div>
    <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
  </div>
);

/* ── Dashboard Page ──────────────────────────────────────── */
const DashboardPage = () => {
  const [filters, setFilters] = useState({});
  const { data: kpiData, isLoading, isError } = useKPIs(filters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Filters */}
      <ReportFilters onFilterChange={setFilters} />

      {/* Loading */}
      {isLoading && (
        <div
          className="glass-card animate-fade-up"
          style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)' }}
        >
          <div style={{ fontSize: '0.875rem' }}>Loading fleet intelligence…</div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          className="glass-card animate-fade-up"
          style={{ padding: '1.5rem', borderColor: 'rgba(255,180,171,0.3)', color: '#ffb4ab' }}
        >
          Failed to load dashboard data.
        </div>
      )}

      {!isLoading && !isError && kpiData && (
        <>
          {/* KPI Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <KPICard
              title="Active Vehicles"
              value={kpiData.activeVehicles}
              icon={Truck}
              description={`of ${kpiData.totalVehicles} total`}
              delay={0}
            />
            <KPICard
              title="Fleet Utilization"
              value={`${kpiData.fleetUtilizationPct}%`}
              icon={Activity}
              trend={{ value: 2.4 }}
              delay={0.08}
            />
            <KPICard
              title="Vehicles in Shop"
              value={kpiData.vehiclesInMaintenance}
              icon={Wrench}
              delay={0.16}
            />
            <KPICard
              title="Available Vehicles"
              value={kpiData.availableVehicles}
              icon={CheckCircle}
              delay={0.24}
            />
          </div>

          {/* Charts row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '1rem',
            }}
          >
            {/* Fleet Status Chart */}
            <div className="glass-card animate-fade-up animate-fade-up-2" style={{ padding: '1.25rem' }}>
              <h3
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--secondary)',
                  marginBottom: '1rem',
                }}
              >
                Fleet Status
              </h3>
              <FleetUtilizationChart data={kpiData.vehicleStatusBreakdown} />
            </div>

            {/* Quick Stats */}
            <div className="glass-card animate-fade-up animate-fade-up-3" style={{ padding: '1.25rem' }}>
              <h3
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--secondary)',
                  marginBottom: '1rem',
                }}
              >
                Operational Snapshot
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <QuickStat label="Active Trips"    value={kpiData.activeTrips}    icon={Navigation} />
                <QuickStat label="Pending Trips"   value={kpiData.pendingTrips}   icon={Clock} color="#f59e0b" />
                <QuickStat label="Drivers On Duty" value={kpiData.driversOnDuty}  icon={Users} color="#10b981" />
                <QuickStat label="Retired Vehicles" value={kpiData.retiredVehicles} icon={Archive} color="#94a3b8" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
