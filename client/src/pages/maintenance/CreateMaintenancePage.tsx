import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCreateMaintenance, type CreateMaintenanceInput } from '@/hooks/useMaintenance';
import { useAuth } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api';
import { apiGet } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
  status: string;
}

export function CreateMaintenancePage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const createMaintenance = useCreateMaintenance();

  const [form, setForm] = useState<CreateMaintenanceInput>({
    vehicleId: '',
    type: '',
    description: '',
    cost: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch all vehicles (not just available — maintenance can be opened on Available)
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiGet<Vehicle[]>('/vehicles'),
  });

  if (!hasRole('FleetManager')) {
    return (
      <div className="text-sm text-muted-foreground">
        Only Fleet Managers can create maintenance records.
      </div>
    );
  }

  const set = (field: keyof CreateMaintenanceInput, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createMaintenance.mutateAsync(form);
      navigate('/maintenance');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const maintenanceTypes = [
    'Oil Change',
    'Tire Replacement',
    'Brake Service',
    'Engine Repair',
    'Transmission Service',
    'Electrical Repair',
    'Body Repair',
    'Routine Inspection',
    'Other',
  ];

  return (
    <div>
      <Link
        to="/maintenance"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Maintenance
      </Link>

      <PageHeader
        title="New Maintenance Record"
        description="Opening this record will set the vehicle status to In Shop (BR-9)"
      />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {/* Vehicle */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Vehicle *
            </label>
            {vehiclesLoading ? (
              <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : (
              <select
                required
                id="maintenance-vehicle"
                value={form.vehicleId}
                onChange={(e) => set('vehicleId', e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select vehicle</option>
                {vehicles
                  .filter((v) => v.status !== 'Retired')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.regNumber}) — {v.status}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Maintenance Type *
            </label>
            <select
              required
              id="maintenance-type"
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select type</option>
              {maintenanceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Description
            </label>
            <textarea
              id="maintenance-description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the work to be performed…"
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Estimated Cost (₹)
            </label>
            <input
              type="number"
              id="maintenance-cost"
              min={0}
              step={0.01}
              value={form.cost || ''}
              onChange={(e) => set('cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
            ⚠️ Creating this record will automatically set the vehicle status to{' '}
            <strong>In Shop</strong>, removing it from the dispatch pool.
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              id="create-maintenance-submit"
              disabled={createMaintenance.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {createMaintenance.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Record'
              )}
            </button>
            <Link
              to="/maintenance"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
