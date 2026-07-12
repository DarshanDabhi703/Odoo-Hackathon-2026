import React, { useRef } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import FleetPage from './pages/FleetPage';
import OperationsPage from './pages/OperationsPage';
import SettingsPage from './pages/SettingsPage';
import FrameBackground from './components/FrameBackground';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Truck,
  Users,
  Zap,
} from 'lucide-react';

/* ── Navigation items ──────────────────────────────────── */
const navItems = [
  { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
  { name: 'Reports',     path: '/reports',     icon: FileText },
  { name: 'Fleet',       path: '/fleet',       icon: Truck },
  { name: 'Operations',  path: '/operations',  icon: Users },
  { name: 'Settings',    path: '/settings',    icon: Settings },
];

/* ── Sidebar ────────────────────────────────────────────── */
const Sidebar = () => {
  const location = useLocation();

  return (
    <aside
      className="sidebar-glass flex flex-col h-screen shrink-0"
      style={{ width: 'var(--sidebar-w)', zIndex: 10 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(34,211,238,0.12)' }}
      >
        <div
          className="icon-badge animate-cyan-pulse"
          style={{ width: 36, height: 36, borderRadius: '0.5rem' }}
        >
          <Zap size={18} />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight tracking-wide">
            TransitOps
          </p>
          <p style={{ fontSize: '0.65rem', color: 'var(--secondary)', letterSpacing: '0.08em' }}>
            FLEET COMMAND
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.6rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--secondary)' : 'var(--on-surface-muted)',
                background: isActive ? 'rgba(34,211,238,0.1)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--secondary)' : '2px solid transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
                boxShadow: isActive ? '0 0 12px rgba(34,211,238,0.1)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(34,211,238,0.06)';
                  e.currentTarget.style.color = 'var(--on-surface)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--on-surface-muted)';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid rgba(34,211,238,0.12)' }}
      >
        <div className="glass-card p-3 flex items-center gap-2">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--secondary) 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            A
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--on-surface)' }}>
              Admin
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--secondary)' }}>Fleet Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ── Page title map ─────────────────────────────────────── */
const pageTitles = [
  { path: '/dashboard',  label: 'Fleet Overview',   sub: 'Real-time fleet intelligence' },
  { path: '/reports',    label: 'Analytics Reports', sub: 'Fuel, cost & ROI analysis' },
  { path: '/fleet',      label: 'Fleet Management',  sub: 'Vehicle registry & status' },
  { path: '/operations', label: 'Operations',        sub: 'Trips, drivers & dispatch' },
  { path: '/settings',   label: 'Settings',          sub: 'System configuration' },
];

/* ── App Layout ─────────────────────────────────────────── */
function AppLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  const pageInfo = pageTitles.find((p) => location.pathname.startsWith(p.path)) ?? {
    label: 'TransitOps',
    sub: '',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Animated frame background (scroll-driven via main panel) */}
      <FrameBackground mode="scroll" scrollContainerRef={mainRef} />

      {/* Darkening overlay so glassmorphism cards remain readable */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 22, 0.58)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main scrollable area */}
      <div
        ref={mainRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Top header */}
        <header
          className="glass-card"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid rgba(34,211,238,0.15)',
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {pageInfo.label}
            </h1>
            {pageInfo.sub && (
              <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: 2 }}>
                {pageInfo.sub}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Live pulse indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--secondary)',
                  animation: 'cyanPulse 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500 }}>
                LIVE
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.75rem 2rem' }}>
          <Routes>
            <Route path="/"            element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/reports"     element={<ReportsPage />} />
            <Route path="/fleet"       element={<FleetPage />} />
            <Route path="/operations"  element={<OperationsPage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="*"            element={<StubPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ── Stub page ──────────────────────────────────────────── */
function StubPage() {
  return (
    <div
      className="glass-card animate-fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: '1rem',
        padding: '3rem',
      }}
    >
      <div className="icon-badge" style={{ width: 56, height: 56, borderRadius: '1rem', fontSize: '1.5rem' }}>
        🚧
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>Module Coming Soon</h2>
      <p style={{ color: 'var(--on-surface-muted)', textAlign: 'center' }}>
        This module is currently under development.
      </p>
    </div>
  );
}

function App() {
  return <AppLayout />;
}

export default App;
