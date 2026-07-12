import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import { LayoutDashboard, FileText, Settings, Truck, Users } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Reports', path: '/reports', icon: FileText },
    // Stubs for Modules 1 & 2
    { name: 'Fleet', path: '/fleet', icon: Truck },
    { name: 'Operations', path: '/operations', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen">
      <div className="p-4 bg-slate-950 flex items-center justify-center h-16">
        <h1 className="text-xl font-bold text-white tracking-wide">TransitOps</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 bg-slate-950 text-sm text-center text-slate-500">
        User: Admin (Role: FleetManager)
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b flex items-center px-8 shrink-0 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            {/* Simple dynamic header based on route */}
            {window.location.pathname.includes('/reports') ? 'Reports' : 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            {/* Catch-all for stub routes */}
            <Route path="*" element={<div className="p-8 text-slate-500 text-center">Module pending implementation</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
