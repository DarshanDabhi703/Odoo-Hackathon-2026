import React from 'react';
import { Truck, MapPin, Wrench, Fuel, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const mockVehicles = [
  { id: 1, reg: 'TRK-001', type: 'Truck',  status: 'On Trip',   driver: 'Raj Mehta',    location: 'Mumbai → Delhi',   fuel: 78 },
  { id: 2, reg: 'VAN-012', type: 'Van',    status: 'Available', driver: '—',             location: 'Mumbai Depot',     fuel: 92 },
  { id: 3, reg: 'TRK-007', type: 'Truck',  status: 'In Shop',   driver: '—',             location: 'Workshop Bay 3',   fuel: 45 },
  { id: 4, reg: 'CAR-003', type: 'Car',    status: 'Available', driver: 'Priya Singh',   location: 'Pune Hub',         fuel: 60 },
  { id: 5, reg: 'TRK-015', type: 'Truck',  status: 'On Trip',   driver: 'Amit Kumar',   location: 'Delhi → Jaipur',   fuel: 55 },
  { id: 6, reg: 'VAN-008', type: 'Van',    status: 'Available', driver: '—',             location: 'Chennai Depot',    fuel: 88 },
  { id: 7, reg: 'TRK-023', type: 'Truck',  status: 'Retired',   driver: '—',             location: 'Yard',             fuel: 0  },
  { id: 8, reg: 'CAR-011', type: 'Car',    status: 'On Trip',   driver: 'Neha Sharma',  location: 'Bangalore → Mysore', fuel: 70 },
];

const STATUS_COLORS = {
  'Available': { color: '#10b981', icon: CheckCircle },
  'On Trip':   { color: 'var(--secondary)', icon: MapPin },
  'In Shop':   { color: '#f59e0b', icon: Wrench },
  'Retired':   { color: '#64748b', icon: AlertCircle },
};

const FuelBar = ({ pct }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      style={{
        flex: 1,
        height: 6,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          background: pct > 60 ? 'var(--secondary)' : pct > 30 ? '#f59e0b' : '#ef4444',
          transition: 'width 0.6s ease',
        }}
      />
    </div>
    <span style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)', width: 28 }}>
      {pct}%
    </span>
  </div>
);

const FleetPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    {/* Summary row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      {[
        { label: 'Total Vehicles',  value: mockVehicles.length,                                         icon: Truck,        color: 'var(--secondary)' },
        { label: 'On Trip',         value: mockVehicles.filter(v => v.status === 'On Trip').length,     icon: MapPin,       color: '#22d3ee' },
        { label: 'In Maintenance',  value: mockVehicles.filter(v => v.status === 'In Shop').length,     icon: Wrench,       color: '#f59e0b' },
        { label: 'Available',       value: mockVehicles.filter(v => v.status === 'Available').length,   icon: CheckCircle,  color: '#10b981' },
      ].map(({ label, value, icon: Icon, color }, i) => (
        <div
          key={label}
          className="kpi-card animate-fade-up"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
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

    {/* Vehicle table */}
    <div className="glass-card animate-fade-up animate-fade-up-2" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(34,211,238,0.12)' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--secondary)' }}>
          Fleet Registry
        </h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Reg Number', 'Type', 'Status', 'Driver', 'Location', 'Fuel Level'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockVehicles.map((v) => {
              const { color, icon: SIcon } = STATUS_COLORS[v.status] || {};
              return (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>{v.reg}</td>
                  <td>{v.type}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, color }}>
                      {SIcon && <SIcon size={12} />}
                      {v.status}
                    </span>
                  </td>
                  <td style={{ color: v.driver === '—' ? 'var(--on-surface-muted)' : 'var(--on-surface)' }}>
                    {v.driver}
                  </td>
                  <td style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>{v.location}</td>
                  <td style={{ minWidth: 120 }}>
                    {v.fuel > 0 ? <FuelBar pct={v.fuel} /> : <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.75rem' }}>N/A</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default FleetPage;
