import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: string;
  description: string | null;
  cost: number;
  status: 'Open' | 'Closed';
  createdAt: string;
  closedAt: string | null;
  vehicle: {
    id: string;
    name: string;
    regNumber: string;
    status: string;
  };
}

export interface CreateMaintenanceInput {
  vehicleId: string;
  type: string;
  description?: string;
  cost?: number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const maintenanceKeys = {
  all: ['maintenance'] as const,
  list: (filters?: Record<string, string>) => ['maintenance', 'list', filters] as const,
  detail: (id: string) => ['maintenance', 'detail', id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMaintenance(filters?: { vehicleId?: string; status?: string }) {
  return useQuery({
    queryKey: maintenanceKeys.list(filters as Record<string, string>),
    queryFn: () => apiGet<MaintenanceLog[]>('/maintenance', filters),
  });
}

export function useMaintenanceDetail(id: string) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id),
    queryFn: () => apiGet<MaintenanceLog>(`/maintenance/${id}`),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMaintenanceInput) =>
      apiPost<MaintenanceLog>('/maintenance', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: maintenanceKeys.all }),
  });
}

export function useCloseMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => apiPost<MaintenanceLog>(`/maintenance/${logId}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey: maintenanceKeys.all }),
  });
}
