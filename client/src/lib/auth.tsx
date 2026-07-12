import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiPost, getApiErrorMessage } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'FleetManager' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'transitops_token';
const USER_KEY = 'transitops_user';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Hydrate from localStorage on first render
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      const user = userStr ? (JSON.parse(userStr) as AuthUser) : null;
      return { user, token, isLoading: false, isAuthenticated: !!(token && user) };
    } catch {
      return { user: null, token: null, isLoading: false, isAuthenticated: false };
    }
  });

  // Listen for the 401 event dispatched by the Axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    };
    window.addEventListener('transitops:logout', handleLogout);
    return () => window.removeEventListener('transitops:logout', handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const result = await apiPost<{ token: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      });
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setState({ user: result.user, token: result.token, isLoading: false, isAuthenticated: true });
    } catch (err) {
      setState((s) => ({ ...s, isLoading: false }));
      throw new Error(getApiErrorMessage(err));
    }
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      return state.user ? roles.includes(state.user.role) : false;
    },
    [state.user]
  );

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
