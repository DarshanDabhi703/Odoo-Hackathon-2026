import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCreateTrip, type CreateTripInput } from '@/hooks/useTrips';
import { useAuth } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api';
import { apiGet } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Lightweight vehicle/driver types for the available lists
interface AvailableVehicle {
  id: string;
  name: string;
  regNumber: string;
  maxLoadKg: number;
  type: string;
}

interface AvailableDriver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
}

export function CreateTripPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const createTrip = useCreateTrip();

  const [form, setForm] = useState<CreateTripInput>({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: 0,
    plannedDistance: 0,
    revenue: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch available vehicles and drivers for the dropdowns
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: () => apiGet<AvailableVehicle[]>('/vehicles/available'),
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: () => apiGet<AvailableDriver[]>('/drivers/available'),
  });

  if (!hasRole('FleetManager', 'Driver')) {
    return (
      <div className="text-sm text-muted-foreground">
        You don't have permission to create trips.
      </div>
    );
  }

  const set = (field: keyof CreateTripInput, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const trip = await createTrip.mutateAsync(form);
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <Link
        to="/trips"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Trips
      </Link>

      <PageHeader
        title="Create New Trip"
        description="A Draft trip is created. Dispatch it once ready."
      />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Source */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Source *
              </label>
              <input
                required
                id="trip-source"
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
                placeholder="e.g. Mumbai Warehouse"
                className="input-field"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Destination *
              </label>
              <input
                required
                id="trip-destination"
                value={form.destination}
                onChange={(e) => set('destination', e.target.value)}
                placeholder="e.g. Pune Depot"
                className="input-field"
              />
            </div>

            {/* Vehicle */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Vehicle *
              </label>
              {vehiclesLoading ? (
                <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading vehicles…
                </div>
              ) : (
                <select
                  required
                  id="trip-vehicle"
                  value={form.vehicleId}
                  onChange={(e) => set('vehicleId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select available vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.regNumber}) — max {v.maxLoadKg} kg
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Driver */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Driver *
              </label>
              {driversLoading ? (
                <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading drivers…
                </div>
              ) : (
                <select
                  required
                  id="trip-driver"
                  value={form.driverId}
                  onChange={(e) => set('driverId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select available driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cargo Weight */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Cargo Weight (kg) *
              </label>
              <input
                required
                type="number"
                id="trip-cargo"
                min={0.1}
                step={0.1}
                value={form.cargoWeight || ''}
                onChange={(e) => set('cargoWeight', parseFloat(e.target.value) || 0)}
                placeholder="e.g. 450"
                className="input-field"
              />
            </div>

            {/* Planned Distance */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Planned Distance (km) *
              </label>
              <input
                required
                type="number"
                id="trip-distance"
                min={0.1}
                step={0.1}
                value={form.plannedDistance || ''}
                onChange={(e) => set('plannedDistance', parseFloat(e.target.value) || 0)}
                placeholder="e.g. 180"
                className="input-field"
              />
            </div>

            {/* Revenue */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Revenue (₹) — optional
              </label>
              <input
                type="number"
                id="trip-revenue"
                min={0}
                step={0.01}
                value={form.revenue || ''}
                onChange={(e) => set('revenue', parseFloat(e.target.value) || 0)}
                placeholder="e.g. 12000"
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              id="create-trip-submit"
              disabled={createTrip.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {createTrip.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Trip'
              )}
            </button>
            <Link
              to="/trips"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Inline input styles via a style tag since @apply would need a component layer */}
      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          transition: border-color 0.15s;
          outline: none;
        }
        .input-field:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
        }
        .input-field::placeholder {
          color: hsl(var(--muted-foreground) / 0.6);
        }
        select.input-field option {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
}
