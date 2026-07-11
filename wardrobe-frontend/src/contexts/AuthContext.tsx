import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { AuthUser, LoginResponse } from '../types';
import { AUTH_LOGOUT_EVENT, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/auth';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<LoginResponse>('/api/login/', { username, password });
    const newToken = response.data.access;
    const nextUser: AuthUser = { username };

    setToken(newToken);
    setUser(nextUser);
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }, []);

  useEffect(() => {
    const onForcedLogout = () => logout();
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
  }, [logout]);

  const value: AuthState = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
