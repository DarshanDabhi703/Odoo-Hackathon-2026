import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Route, ChevronRight, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTrips, type Trip } from '@/hooks/useTrips';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type TabStatus = 'all' | 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

const TABS: { label: string; value: TabStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export function TripsPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const { hasRole } = useAuth();

  const { data: trips = [], isLoading, error } = useTrips(
    activeTab !== 'all' ? { status: activeTab } : undefined
  );

  const canCreate = hasRole('FleetManager', 'Driver');

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Manage trip lifecycle — create, dispatch, complete, or cancel trips"
        actions={
          canCreate && (
            <Link
              to="/trips/new"
              id="create-trip-btn"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              New Trip
            </Link>
          )
        }
      />

      {/* Status filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              activeTab === tab.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load trips. Please refresh.
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={<Route className="h-6 w-6" />}
          title="No trips found"
          description={
            activeTab !== 'all'
              ? `No ${activeTab.toLowerCase()} trips at the moment`
              : 'Create your first trip to get started'
          }
          action={
            canCreate && (
              <Link
                to="/trips/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Trip
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {trips.map((trip) => (
            <TripRow key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Route className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {trip.source} → {trip.destination}
            </p>
            <StatusBadge status={trip.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              🚛 {trip.vehicle.name} ({trip.vehicle.regNumber})
            </span>
            <span>👤 {trip.driver.name}</span>
            <span>📦 {Number(trip.cargoWeight).toLocaleString()} kg</span>
            <span>📏 {Number(trip.plannedDistance).toLocaleString()} km planned</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:block">
          {new Date(trip.createdAt).toLocaleDateString()}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
