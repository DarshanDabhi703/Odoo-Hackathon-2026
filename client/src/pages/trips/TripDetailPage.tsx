import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Truck,
  User,
  MapPin,
  Package,
  Navigation,
  Fuel,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  useTripDetail,
  useDispatchTrip,
  useCompleteTrip,
  useCancelTrip,
  type CompleteTripInput,
} from '@/hooks/useTrips';
import { useAuth } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api';

export function TripDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const { data: trip, isLoading, error } = useTripDetail(id);
  const dispatch = useDispatchTrip();
  const complete = useCompleteTrip();
  const cancel = useCancelTrip();

  const [actionError, setActionError] = useState<string | null>(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeData, setCompleteData] = useState<CompleteTripInput>({
    actualDistance: 0,
    fuelLiters: 0,
    fuelCost: 0,
  });

  const canAct = hasRole('FleetManager', 'Driver');

  const handleDispatch = async () => {
    setActionError(null);
    try {
      await dispatch.mutateAsync(id);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await complete.mutateAsync({ tripId: id, input: completeData });
      setShowCompleteForm(false);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    setActionError(null);
    try {
      await cancel.mutateAsync(id);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Trip not found.{' '}
        <Link to="/trips" className="underline">
          Back to trips
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back nav */}
      <Link
        to="/trips"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All Trips
      </Link>

      <PageHeader
        title={`${trip.source} → ${trip.destination}`}
        description={`Trip created ${new Date(trip.createdAt).toLocaleString()}`}
        actions={<StatusBadge status={trip.status} />}
      />

      {/* Action error */}
      {actionError && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trip details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Trip Details</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailItem icon={<MapPin className="h-4 w-4" />} label="Source" value={trip.source} />
              <DetailItem icon={<MapPin className="h-4 w-4" />} label="Destination" value={trip.destination} />
              <DetailItem icon={<Package className="h-4 w-4" />} label="Cargo Weight" value={`${Number(trip.cargoWeight).toLocaleString()} kg`} />
              <DetailItem icon={<Navigation className="h-4 w-4" />} label="Planned Dist." value={`${Number(trip.plannedDistance).toLocaleString()} km`} />
              {trip.actualDistance != null && (
                <DetailItem icon={<Navigation className="h-4 w-4" />} label="Actual Dist." value={`${Number(trip.actualDistance).toLocaleString()} km`} />
              )}
              <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Revenue" value={`₹${Number(trip.revenue).toLocaleString()}`} />
            </div>
          </div>

          {/* Vehicle + Driver */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Truck className="h-3.5 w-3.5" />
                Vehicle
              </div>
              <p className="font-semibold text-foreground">{trip.vehicle.name}</p>
              <p className="text-xs text-muted-foreground">{trip.vehicle.regNumber}</p>
              <div className="mt-2">
                <StatusBadge status={trip.vehicle.status} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Driver
              </div>
              <p className="font-semibold text-foreground">{trip.driver.name}</p>
              <p className="text-xs text-muted-foreground">{trip.driver.licenseNumber}</p>
              <div className="mt-2">
                <StatusBadge status={trip.driver.status} />
              </div>
            </div>
          </div>

          {/* Complete form */}
          {showCompleteForm && (
            <form
              onSubmit={handleComplete}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h2 className="mb-4 text-sm font-semibold text-foreground">Complete Trip</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  id="actualDistance"
                  label="Actual Distance (km)"
                  type="number"
                  min={0}
                  step={0.1}
                  value={completeData.actualDistance || ''}
                  onChange={(v) =>
                    setCompleteData((d) => ({ ...d, actualDistance: parseFloat(v) || 0 }))
                  }
                />
                <FormField
                  id="fuelLiters"
                  label="Fuel Consumed (L)"
                  type="number"
                  min={0}
                  step={0.1}
                  value={completeData.fuelLiters || ''}
                  onChange={(v) =>
                    setCompleteData((d) => ({ ...d, fuelLiters: parseFloat(v) || 0 }))
                  }
                />
                <FormField
                  id="fuelCost"
                  label="Fuel Cost (₹)"
                  type="number"
                  min={0}
                  step={0.01}
                  value={completeData.fuelCost || ''}
                  onChange={(v) =>
                    setCompleteData((d) => ({ ...d, fuelCost: parseFloat(v) || 0 }))
                  }
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={complete.isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {complete.isPending ? 'Completing…' : 'Confirm Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompleteForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Action panel */}
        {canAct && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Actions</h2>
            <div className="space-y-2">
              {trip.status === 'Draft' && (
                <ActionButton
                  id="dispatch-btn"
                  icon={<Play className="h-4 w-4" />}
                  label="Dispatch Trip"
                  variant="primary"
                  loading={dispatch.isPending}
                  onClick={handleDispatch}
                />
              )}
              {trip.status === 'Dispatched' && !showCompleteForm && (
                <>
                  <ActionButton
                    id="complete-btn"
                    icon={<CheckCircle className="h-4 w-4" />}
                    label="Complete Trip"
                    variant="success"
                    onClick={() => setShowCompleteForm(true)}
                  />
                  <ActionButton
                    id="cancel-btn"
                    icon={<XCircle className="h-4 w-4" />}
                    label="Cancel Trip"
                    variant="danger"
                    loading={cancel.isPending}
                    onClick={handleCancel}
                  />
                </>
              )}
              {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                <p className="text-xs text-muted-foreground">
                  This trip is {trip.status.toLowerCase()} and cannot be modified.
                </p>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <TimelineItem
                  label="Created"
                  date={trip.createdAt}
                  active
                />
                {trip.dispatchedAt && (
                  <TimelineItem label="Dispatched" date={trip.dispatchedAt} active />
                )}
                {trip.completedAt && (
                  <TimelineItem label="Completed" date={trip.completedAt} active />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ActionButton({
  id,
  icon,
  label,
  variant,
  loading,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  variant: 'primary' | 'success' | 'danger';
  loading?: boolean;
  onClick: () => void;
}) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger:
      'border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20',
  };

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${styles[variant]}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  min,
  step,
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  step?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function TimelineItem({ label, date, active }: { label: string; date: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${active ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      />
      <span className={active ? 'text-foreground' : ''}>
        <span className="font-medium">{label}</span> —{' '}
        {new Date(date).toLocaleString()}
      </span>
    </div>
  );
}
