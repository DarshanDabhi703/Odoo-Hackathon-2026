import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wrench, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useMaintenance, useCloseMaintenance, type MaintenanceLog } from '@/hooks/useMaintenance';
import { useAuth } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

export function MaintenancePage() {
  const { hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Closed'>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useMaintenance(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const closeMaintenance = useCloseMaintenance();
  const canManage = hasRole('FleetManager');

  const handleClose = async (logId: string) => {
    setActionError(null);
    setClosingId(logId);
    try {
      await closeMaintenance.mutateAsync(logId);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track vehicle maintenance — opening a record puts the vehicle In Shop"
        actions={
          canManage && (
            <Link
              to="/maintenance/new"
              id="create-maintenance-btn"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Record
            </Link>
          )
        }
      />

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {(['all', 'Open', 'Closed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all capitalize',
              statusFilter === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'all' ? 'All' : tab}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          title="No maintenance records"
          description="Create a maintenance record to track vehicle servicing"
          action={
            canManage && (
              <Link
                to="/maintenance/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Record
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <MaintenanceRow
              key={log.id}
              log={log}
              canClose={canManage && log.status === 'Open'}
              isClosing={closingId === log.id}
              onClose={() => handleClose(log.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MaintenanceRow({
  log,
  canClose,
  isClosing,
  onClose,
}: {
  log: MaintenanceLog;
  canClose: boolean;
  isClosing: boolean;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{log.type}</p>
              <StatusBadge status={log.status} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              🚛 {log.vehicle.name} ({log.vehicle.regNumber})
            </p>
            {log.description && (
              <p className="mt-1 text-xs text-muted-foreground">{log.description}</p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>💰 ₹{Number(log.cost).toLocaleString()}</span>
              <span>📅 {new Date(log.createdAt).toLocaleDateString()}</span>
              {log.closedAt && (
                <span>✅ Closed {new Date(log.closedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>

        {canClose && (
          <button
            id={`close-maintenance-${log.id}`}
            onClick={onClose}
            disabled={isClosing}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            {isClosing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            Close
          </button>
        )}
      </div>
    </div>
  );
}
