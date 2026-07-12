import React, { useState } from 'react';
import { Navigation, Clock, CheckCircle2, XCircle, Users, MapPin, TrendingUp } from 'lucide-react';

const mockTrips = [
  { id: 'T-1021', vehicle: 'TRK-001', driver: 'Raj Mehta',    from: 'Mumbai',     to: 'Delhi',     status: 'Active',    km: 1420, eta: '18:30' },
  { id: 'T-1022', vehicle: 'TRK-015', driver: 'Amit Kumar',   from: 'Delhi',      to: 'Jaipur',    status: 'Active',    km: 280,  eta: '15:45' },
  { id: 'T-1023', vehicle: 'CAR-011', driver: 'Neha Sharma',  from: 'Bangalore',  to: 'Mysore',    status: 'Active',    km: 145,  eta: '14:00' },
  { id: 'T-1018', vehicle: 'VAN-012', driver: 'Suresh Patil', from: 'Pune',       to: 'Mumbai',    status: 'Completed', km: 149,  eta: '—'     },
  { id: 'T-1019', vehicle: 'CAR-003', driver: 'Priya Singh',  from: 'Chennai',    to: 'Hyderabad', status: 'Pending',   km: 630,  eta: '—'     },
  { id: 'T-1020', vehicle: 'VAN-008', driver: '—',            from: 'Kolkata',    to: 'Patna',     status: 'Pending',   km: 570,  eta: '—'     },
  { id: 'T-1017', vehicle: 'TRK-007', driver: 'Deepak Roy',   from: 'Ahmedabad',  to: 'Surat',     status: 'Cancelled', km: 265,  eta: '—'     },
];

const STATUS_MAP = {
  Active:    { color: 'var(--secondary)', icon: Navigation },
  Completed: { color: '#10b981',          icon: CheckCircle2 },
  Pending:   { color: '#f59e0b',          icon: Clock },
  Cancelled: { color: '#ef4444',          icon: XCircle },
};

const OperationsPage = () => {
  const [filter, setFilter] = useState('All');
  const tabs = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];

  const visible = filter === 'All' ? mockTrips : mockTrips.filter(t => t.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Active Trips',    value: mockTrips.filter(t => t.status === 'Active').length,    icon: Navigation,  color: 'var(--secondary)' },
          { label: 'Pending',         value: mockTrips.filter(t => t.status === 'Pending').length,   icon: Clock,       color: '#f59e0b' },
          { label: 'Completed Today', value: mockTrips.filter(t => t.status === 'Completed').length, icon: CheckCircle2,color: '#10b981' },
          { label: 'Drivers Active',  value: mockTrips.filter(t => t.status === 'Active').length,    icon: Users,       color: '#a78bfa' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="kpi-card animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
                {label}
              </p>
              <div className="icon-badge" style={{ background: `${color}18`, borderColor: `${color}30` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Trips table */}
      <div className="glass-card animate-fade-up animate-fade-up-2" style={{ overflow: 'hidden' }}>
        {/* Tab filters */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(34,211,238,0.12)', padding: '0 1.25rem' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '0.7rem 1rem',
                fontSize: '0.8rem',
                fontWeight: filter === t ? 600 : 400,
                color: filter === t ? 'var(--secondary)' : 'var(--on-surface-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: filter === t ? '2px solid var(--secondary)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Trip ID', 'Vehicle', 'Driver', 'Route', 'Distance (km)', 'Status', 'ETA'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((trip) => {
                const { color, icon: SIcon } = STATUS_MAP[trip.status] || {};
                return (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace', fontSize: '0.8rem' }}>{trip.id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{trip.vehicle}</td>
                    <td style={{ color: trip.driver === '—' ? 'var(--on-surface-muted)' : 'var(--on-surface)' }}>{trip.driver}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                        <MapPin size={11} style={{ color: 'var(--on-surface-muted)' }} />
                        <span style={{ color: 'var(--on-surface-muted)' }}>{trip.from}</span>
                        <span style={{ color: 'var(--outline)' }}>→</span>
                        <span>{trip.to}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{trip.km.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, color }}>
                        {SIcon && <SIcon size={12} />}
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ color: trip.eta === '—' ? 'var(--on-surface-muted)' : 'var(--secondary)', fontWeight: 500 }}>
                      {trip.eta}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--on-surface-muted)' }}>
                    No trips in this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationsPage;
