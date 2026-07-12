import apiClient from '@/api/apiClient';

export const analyticsService = {
  getKPIs: async (params) => {
    const response = await apiClient.get('/dashboard/kpis', { params });
    return response.data.data;
  },

  getFuelEfficiency: async (params) => {
    const response = await apiClient.get('/reports/fuel-efficiency', { params });
    return response.data.data;
  },

  getUtilization: async (params) => {
    const response = await apiClient.get('/reports/utilization', { params });
    return response.data.data;
  },

  getOperationalCost: async (params) => {
    const response = await apiClient.get('/reports/operational-cost', { params });
    return response.data.data;
  },

  getROI: async (params) => {
    const response = await apiClient.get('/reports/roi', { params });
    return response.data.data;
  },
  
  exportCSVUrl: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    const token = 'stub-jwt-token'; // Using stub for MVP
    // In a real app with JWT in header, we'd either do a blob download via axios 
    // or pass token in a short-lived query param. We'll use axios blob approach in the component.
    return `/reports/export.csv?${query}`;
  },
  
  downloadCSV: async (params) => {
    const response = await apiClient.get('/reports/export.csv', { 
      params, 
      responseType: 'blob' 
    });
    return response.data;
  }
};
