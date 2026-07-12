import axios from 'axios';

// Mock token for hackathon since Auth module is a stub
const MOCK_TOKEN = 'stub-jwt-token';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // In a real app, you'd get this from local storage or context
  config.headers.Authorization = `Bearer ${MOCK_TOKEN}`;
  return config;
});

export default apiClient;
