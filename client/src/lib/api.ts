import axios from 'axios';

/**
 * Shared Axios instance for all TransitOps API calls.
 * - Base URL from VITE_API_BASE_URL env var (falls back to /api for dev proxy)
 * - Request interceptor: attaches JWT from localStorage
 * - Response interceptor: handles 401 → clears token (actual logout handled by AuthContext)
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

// ─── Request interceptor: attach JWT ──────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      // The AuthContext will detect the missing token on next render
      window.dispatchEvent(new Event('transitops:logout'));
    }
    return Promise.reject(error);
  }
);

// ─── Typed API helper ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code: string;
    message: string;
  };
}

/** Extract the .data field from the TRD response envelope */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<ApiResponse<T>>(url, body);
  return res.data.data;
}

/** Extract the error message from an Axios error thrown by the API */
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    return data?.error?.message ?? err.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

export function getApiErrorCode(err: unknown): string | null {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    return data?.error?.code ?? null;
  }
  return null;
}
