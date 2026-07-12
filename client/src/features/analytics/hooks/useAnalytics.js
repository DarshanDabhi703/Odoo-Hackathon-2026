import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export const useKPIs = (filters) => {
  return useQuery({
    queryKey: ['kpis', filters],
    queryFn: () => analyticsService.getKPIs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFuelEfficiency = (filters) => {
  return useQuery({
    queryKey: ['fuelEfficiency', filters],
    queryFn: () => analyticsService.getFuelEfficiency(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUtilization = (filters) => {
  return useQuery({
    queryKey: ['utilization', filters],
    queryFn: () => analyticsService.getUtilization(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOperationalCost = (filters) => {
  return useQuery({
    queryKey: ['operationalCost', filters],
    queryFn: () => analyticsService.getOperationalCost(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useROI = (filters) => {
  return useQuery({
    queryKey: ['roi', filters],
    queryFn: () => analyticsService.getROI(filters),
    staleTime: 5 * 60 * 1000,
  });
};
