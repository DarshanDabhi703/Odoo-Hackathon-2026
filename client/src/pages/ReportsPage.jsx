import React, { useState } from 'react';
import { Download, TrendingUp, DollarSign, Fuel } from 'lucide-react';
import ReportFilters from '../features/analytics/components/ReportFilters';
import FuelEfficiencyChart from '../features/analytics/components/FuelEfficiencyChart';
import OperationalCostChart from '../features/analytics/components/OperationalCostChart';
import ExpenseBreakdownChart from '../features/analytics/components/ExpenseBreakdownChart';
import { useFuelEfficiency, useOperationalCost, useROI } from '../features/analytics/hooks/useAnalytics';
import { analyticsService } from '../features/analytics/services/analytics.service';

/* ── Spinner ─────────────────────────────────────────────── */
const Spinner = ({ label }) => (
  <div
    style={{
      padding: '3rem',
      textAlign: 'center',
      color: 'var(--on-surface-muted)',
      fontSize: '0.875rem',
    }}
  >
    {label}
  </div>
);

/* ── Reports Page ────────────────────────────────────────── */
const ReportsPage = () => {
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('fuel');

  const { data: fuelData,  isLoading: loadingFuel } = useFuelEfficiency(filters);
  const { data: costData,  isLoading: loadingCost } = useOperationalCost(filters);
  const { data: roiData,   isLoading: loadingROI  } = useROI(filters);

  const handleExport = async () => {
    try {
      const blob = await analyticsService.downloadCSV(filters);
      const url  = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute(
        'download',
        `transitops-report-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to export CSV. Please try again.');
    }
  };

  const tabs = [
    { id: 'fuel', label: 'Fuel Efficiency', icon: Fuel },
    { id: 'cost', label: 'Operational Cost', icon: DollarSign },
    { id: 'roi',  label: 'ROI Analysis',    icon: TrendingUp },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <ReportFilters onFilterChange={setFilters} />
        <button className="btn-cyan" onClick={handleExport} style={{ marginTop: 'auto' }}>
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Main glass card with tabs */}
      <div className="glass-card animate-fade-up" style={{ overflow: 'hidden' }}>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(34,211,238,0.12)',
            padding: '0 1.25rem',
          }}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon   = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--secondary)' : 'var(--on-surface-muted)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--secondary)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginBottom: '-1px',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--on-surface)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--on-surface-muted)'; }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '1.5rem' }}>

          {/* ── Fuel Efficiency ── */}
          {activeTab === 'fuel' && (
            <div>
              {loadingFuel ? <Spinner label="Loading fuel efficiency data…" /> : <FuelEfficiencyChart data={fuelData} />}
            </div>
          )}

          {/* ── Operational Cost ── */}
          {activeTab === 'cost' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {loadingCost ? <Spinner label="Loading cost data…" /> : (
                <>
                  <OperationalCostChart data={costData} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <ExpenseBreakdownChart data={costData} />

                    {/* Summary */}
                    <div
                      className="glass-card"
                      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}
                    >
                      <p style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Cost Summary
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', lineHeight: 1.6 }}>
                        Includes all fuel logs, maintenance records, and manually logged expenses for the selected period.
                      </p>
                      {costData && costData.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginBottom: 4 }}>
                            Total Fleet OpCost
                          </p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                            ${costData.reduce((s, v) => s + (v.totalCost || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ROI Analysis ── */}
          {activeTab === 'roi' && (
            <div>
              {loadingROI ? <Spinner label="Loading ROI data…" /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    className="glass-table"
                    style={{ width: '100%', borderCollapse: 'collapse' }}
                  >
                    <thead>
                      <tr>
                        {['Vehicle', 'Type', 'Revenue', 'Op Cost', 'Net Profit', 'Acquisition', 'ROI %'].map((h) => (
                          <th key={h} style={{ textAlign: h === 'Vehicle' || h === 'Type' ? 'left' : 'right' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roiData && roiData.map((v) => (
                        <tr key={v.vehicleId}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{v.regNumber}</td>
                          <td style={{ color: 'var(--on-surface-muted)' }}>{v.type}</td>
                          <td style={{ textAlign: 'right' }}>${v.revenue.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>${v.operationalCost.toLocaleString()}</td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 600,
                              color: v.netProfit >= 0 ? '#10b981' : '#ef4444',
                            }}
                          >
                            ${v.netProfit.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>${v.acquisitionCost.toLocaleString()}</td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 800,
                              color: v.roiPct >= 0 ? 'var(--secondary)' : '#ef4444',
                            }}
                          >
                            {v.roiPct}%
                          </td>
                        </tr>
                      ))}
                      {(!roiData || roiData.length === 0) && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-muted)' }}>
                            No ROI data available for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
