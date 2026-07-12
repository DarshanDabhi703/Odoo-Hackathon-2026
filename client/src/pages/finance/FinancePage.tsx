import { useState } from 'react';
import { Plus, Fuel, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  useFuelLogs,
  useExpenses,
  useAddFuelLog,
  useAddExpense,
  type CreateFuelLogInput,
  type CreateExpenseInput,
} from '@/hooks/useFinance';
import { useAuth } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/api';
import { apiGet } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

type Tab = 'fuel' | 'expenses';

interface Vehicle {
  id: string;
  name: string;
  regNumber: string;
}

export function FinancePage() {
  const [tab, setTab] = useState<Tab>('fuel');
  const { hasRole } = useAuth();

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Track fuel consumption and operational expenses per vehicle"
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setTab('fuel')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all',
            tab === 'fuel' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Fuel className="h-3.5 w-3.5" />
          Fuel Logs
        </button>
        <button
          onClick={() => setTab('expenses')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all',
            tab === 'expenses' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <DollarSign className="h-3.5 w-3.5" />
          Expenses
        </button>
      </div>

      {tab === 'fuel' ? (
        <FuelLogsTab canAdd={hasRole('FleetManager', 'Driver')} />
      ) : (
        <ExpensesTab canAdd={hasRole('FleetManager')} />
      )}
    </div>
  );
}

// ─── Fuel Logs Tab ────────────────────────────────────────────────────────────

function FuelLogsTab({ canAdd }: { canAdd: boolean }) {
  const { data: logs = [], isLoading } = useFuelLogs();
  const addFuelLog = useAddFuelLog();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFuelLogInput>({
    vehicleId: '',
    liters: 0,
    cost: 0,
    logDate: new Date().toISOString().split('T')[0],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiGet<Vehicle[]>('/vehicles'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addFuelLog.mutateAsync(form);
      setShowForm(false);
      setForm({ vehicleId: '', liters: 0, cost: 0, logDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      {canAdd && (
        <button
          id="add-fuel-log-btn"
          onClick={() => setShowForm((v) => !v)}
          className="mb-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Fuel Log'}
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-xl border border-border bg-card p-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-foreground">Add Fuel Log</h3>

          {error && (
            <div className="mb-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Vehicle *</label>
              <select
                required
                id="fuel-vehicle"
                value={form.vehicleId}
                onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                className="select-field"
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.regNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Liters *</label>
              <input
                type="number"
                required
                id="fuel-liters"
                min={0.1}
                step={0.1}
                value={form.liters || ''}
                onChange={(e) => setForm((f) => ({ ...f, liters: parseFloat(e.target.value) || 0 }))}
                className="input-sm"
              />
            </div>
            <div>
              <label className="label">Cost (₹) *</label>
              <input
                type="number"
                required
                id="fuel-cost"
                min={0}
                step={0.01}
                value={form.cost || ''}
                onChange={(e) => setForm((f) => ({ ...f, cost: parseFloat(e.target.value) || 0 }))}
                className="input-sm"
              />
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                required
                id="fuel-date"
                value={form.logDate}
                onChange={(e) => setForm((f) => ({ ...f, logDate: e.target.value }))}
                className="input-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={addFuelLog.isPending}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {addFuelLog.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Fuel className="h-6 w-6" />}
          title="No fuel logs"
          description="Start tracking fuel consumption per vehicle"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['Vehicle', 'Date', 'Liters', 'Cost (₹)', 'Trip'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {log.vehicle.name} <span className="text-xs text-muted-foreground">({log.vehicle.regNumber})</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.logDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{Number(log.liters).toFixed(1)} L</td>
                  <td className="px-4 py-3">₹{Number(log.cost).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.trip ? `${log.trip.source} → ${log.trip.destination}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

function ExpensesTab({ canAdd }: { canAdd: boolean }) {
  const { data: expenses = [], isLoading } = useExpenses();
  const addExpense = useAddExpense();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateExpenseInput>({
    vehicleId: '',
    category: 'Toll',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => apiGet<Vehicle[]>('/vehicles'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addExpense.mutateAsync(form);
      setShowForm(false);
      setForm({ vehicleId: '', category: 'Toll', amount: 0, expenseDate: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      {canAdd && (
        <button
          id="add-expense-btn"
          onClick={() => setShowForm((v) => !v)}
          className="mb-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Add Expense</h3>

          {error && (
            <div className="mb-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Vehicle *</label>
              <select
                required
                id="expense-vehicle"
                value={form.vehicleId}
                onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                className="select-field"
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.regNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                required
                id="expense-category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as CreateExpenseInput['category'],
                  }))
                }
                className="select-field"
              >
                <option value="Toll">Toll</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Amount (₹) *</label>
              <input
                type="number"
                required
                id="expense-amount"
                min={0}
                step={0.01}
                value={form.amount || ''}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                className="input-sm"
              />
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                required
                id="expense-date"
                value={form.expenseDate}
                onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))}
                className="input-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <input
                type="text"
                id="expense-notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes"
                className="input-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={addExpense.isPending}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {addExpense.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="h-6 w-6" />}
          title="No expenses recorded"
          description="Log toll fees, maintenance costs, and other expenses"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['Vehicle', 'Category', 'Date', 'Amount (₹)', 'Notes'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {exp.vehicle.name} <span className="text-xs text-muted-foreground">({exp.vehicle.regNumber})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{exp.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(exp.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">₹{Number(exp.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{exp.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .label { display: block; margin-bottom: 0.375rem; font-size: 0.75rem; font-weight: 500; color: hsl(var(--foreground)); }
        .input-sm, .select-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color 0.15s;
        }
        .input-sm:focus, .select-field:focus { border-color: hsl(var(--primary)); box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2); }
      `}</style>
    </div>
  );
}
