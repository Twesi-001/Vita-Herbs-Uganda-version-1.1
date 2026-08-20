import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_URL } from '../lib/api';
import { UNAUTHORIZED_EVENT, clearToken, getToken, setToken } from '../lib/adminAuth';
import { AdminAuthContext, type AuthState } from './adminAuthContext';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => (getToken() ? 'loading' : 'out'));

  // Validate any stored token against a cheap authenticated endpoint. This is a
  // genuine external-system sync, which is what effects are for; the lint rule's
  // heuristic can't tell it apart from a derived-state mistake.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (cancelled) return;
        if (res.ok) {
          setAuthState('in');
        } else {
          clearToken();
          setAuthState('out');
        }
      } catch {
        if (cancelled) return;
        // A network failure isn't proof the token is bad, but nothing is usable
        // without the API, so fall back to the login screen.
        clearToken();
        setAuthState('out');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 from apiFetch drops us back to the login screen.
  useEffect(() => {
    const onUnauthorized = () => setAuthState('out');
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { token?: string; message?: string };
      if (!res.ok || !data.token) return data.message ?? 'Invalid credentials';
      setToken(data.token);
      setAuthState('in');
      return null;
    } catch {
      return 'Connection failed';
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setAuthState('out');
  }, []);

  const value = useMemo(() => ({ authState, login, logout }), [authState, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
