import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripVehicle {
  id: string;
  name: string;
  regNumber: string;
  status: string;
}

export interface TripDriver {
  id: string;
  name: string;
  licenseNumber: string;
  status: string;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance: number | null;
  revenue: number;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  createdAt: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  vehicle: TripVehicle;
  driver: TripDriver;
}

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue?: number;
}

export interface CompleteTripInput {
  actualDistance: number;
  fuelLiters: number;
  fuelCost: number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tripKeys = {
  all: ['trips'] as const,
  list: (filters?: Record<string, string>) => ['trips', 'list', filters] as const,
  detail: (id: string) => ['trips', 'detail', id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTrips(filters?: { status?: string }) {
  return useQuery({
    queryKey: tripKeys.list(filters as Record<string, string>),
    queryFn: () => apiGet<Trip[]>('/trips', filters),
  });
}

export function useTripDetail(id: string) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => apiGet<Trip>(`/trips/${id}`),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTripInput) => apiPost<Trip>('/trips', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useDispatchTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => apiPost<Trip>(`/trips/${tripId}/dispatch`),
    onSuccess: (_, tripId) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useCompleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, input }: { tripId: string; input: CompleteTripInput }) =>
      apiPost<Trip>(`/trips/${tripId}/complete`, input),
    onSuccess: (_, { tripId }) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useCancelTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => apiPost<Trip>(`/trips/${tripId}/cancel`),
    onSuccess: (_, tripId) => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}
