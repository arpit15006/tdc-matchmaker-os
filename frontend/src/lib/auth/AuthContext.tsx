import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/axios';
import type { Matchmaker } from '@/types';
import { AUTH_LOGOUT_EVENT, clearToken, getToken, setToken } from './token';

interface AuthState {
  matchmaker: Matchmaker | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (token: string, matchmaker: Matchmaker) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [matchmaker, setMatchmaker] = useState<Matchmaker | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setMatchmaker(null);
  }, []);

  const login = useCallback((token: string, mm: Matchmaker) => {
    setToken(token);
    setMatchmaker(mm);
  }, []);

  // On mount, if a token exists, fetch the current matchmaker.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsBootstrapping(false);
      return;
    }
    api
      .get<{ matchmaker: Matchmaker }>('/auth/me')
      .then((res) => setMatchmaker(res.data.matchmaker))
      .catch(() => clearToken())
      .finally(() => setIsBootstrapping(false));
  }, []);

  // React to global 401 logout events from the axios interceptor.
  useEffect(() => {
    const handler = () => setMatchmaker(null);
    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      matchmaker,
      isAuthenticated: Boolean(matchmaker),
      isBootstrapping,
      login,
      logout,
    }),
    [matchmaker, isBootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
