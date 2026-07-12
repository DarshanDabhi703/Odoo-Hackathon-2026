import { NavLink } from 'react-router-dom';
import {
  Route,
  Wrench,
  DollarSign,
  ChevronRight,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Trips',
    to: '/trips',
    icon: Route,
    roles: ['FleetManager', 'Driver'],
  },
  {
    label: 'Maintenance',
    to: '/maintenance',
    icon: Wrench,
    roles: ['FleetManager', 'SafetyOfficer'],
  },
  {
    label: 'Finance',
    to: '/finance',
    icon: DollarSign,
    roles: ['FleetManager', 'Driver', 'FinancialAnalyst'],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.roles.length || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-full flex-col bg-card border-r border-border shadow-sm">
      {/* Logo area */}
      <div className="flex h-14 items-center justify-between px-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            <span className="text-primary">Transit</span>Ops
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-2 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </p>
        </div>

        <ul className="space-y-0.5">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {item.label}
                    </div>
                    <ChevronRight
                      className={cn(
                        'h-3.5 w-3.5 opacity-0 transition-opacity',
                        isActive ? 'opacity-100 text-primary-foreground/70' : 'group-hover:opacity-60'
                      )}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-[10px] text-muted-foreground">
          TransitOps v1.0 · <span className="text-primary">{user?.role}</span>
        </p>
      </div>
    </div>
  );
}
