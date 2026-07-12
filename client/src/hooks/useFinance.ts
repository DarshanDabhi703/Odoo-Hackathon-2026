import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  liters: number;
  cost: number;
  logDate: string;
  vehicle: { id: string; name: string; regNumber: string };
  trip: { id: string; source: string; destination: string } | null;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: 'Toll' | 'Maintenance' | 'Other';
  amount: number;
  expenseDate: string;
  notes: string | null;
  vehicle: { id: string; name: string; regNumber: string };
}

export interface VehicleCostSummary {
  vehicleId: string;
  fuelCost: number;
  maintenanceCost: number;
  expenseCost: number;
  totalOperationalCost: number;
  totalRevenue: number;
  totalDistance: number;
  fuelEfficiency: number | null;
  roi: number | null;
}

export interface CreateFuelLogInput {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  logDate: string;
}

export interface CreateExpenseInput {
  vehicleId: string;
  category: 'Toll' | 'Maintenance' | 'Other';
  amount: number;
  expenseDate: string;
  notes?: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const financeKeys = {
  fuelLogs: (filters?: Record<string, string>) => ['fuel-logs', filters] as const,
  expenses: (filters?: Record<string, string>) => ['expenses', filters] as const,
  costSummary: (vehicleId: string) => ['vehicles', vehicleId, 'cost-summary'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useFuelLogs(filters?: { vehicleId?: string; tripId?: string }) {
  return useQuery({
    queryKey: financeKeys.fuelLogs(filters as Record<string, string>),
    queryFn: () => apiGet<FuelLog[]>('/fuel-logs', filters),
  });
}

export function useExpenses(filters?: { vehicleId?: string; category?: string }) {
  return useQuery({
    queryKey: financeKeys.expenses(filters as Record<string, string>),
    queryFn: () => apiGet<Expense[]>('/expenses', filters),
  });
}

export function useVehicleCostSummary(vehicleId: string) {
  return useQuery({
    queryKey: financeKeys.costSummary(vehicleId),
    queryFn: () => apiGet<VehicleCostSummary>(`/vehicles/${vehicleId}/cost-summary`),
    enabled: !!vehicleId,
  });
}

export function useAddFuelLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFuelLogInput) => apiPost<FuelLog>('/fuel-logs', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fuel-logs'] }),
  });
}

export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => apiPost<Expense>('/expenses', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
