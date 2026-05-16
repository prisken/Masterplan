import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AUTH_ENABLED } from '../config/auth';

type AuthStatus = 'checking' | 'anonymous' | 'authenticated';

interface AuthContextValue {
  enabled: boolean;
  status: AuthStatus;
  username: string | null;
  checkSession: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (AUTH_ENABLED ? 'checking' : 'authenticated'));
  const [username, setUsername] = useState<string | null>(AUTH_ENABLED ? null : 'local');

  const checkSession = useCallback(async () => {
    if (!AUTH_ENABLED) {
      setStatus('authenticated');
      setUsername('local');
      return;
    }
    setStatus('checking');
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' });
      if (r.status === 401) {
        const j = (await r.json().catch(() => ({}))) as { authenticated?: boolean };
        if (j.authenticated === false) {
          setStatus('anonymous');
          setUsername(null);
          return;
        }
      }
      if (!r.ok) {
        setStatus('anonymous');
        setUsername(null);
        return;
      }
      const j = (await r.json()) as { authenticated?: boolean; username?: string };
      if (j.authenticated && j.username) {
        setUsername(j.username);
        setStatus('authenticated');
      } else {
        setStatus('anonymous');
        setUsername(null);
      }
    } catch {
      setStatus('anonymous');
      setUsername(null);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (user: string, password: string) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password }),
    });
    if (!r.ok) {
      const err = (await r.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || 'Login failed');
    }
    await checkSession();
  }, [checkSession]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUsername(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({
      enabled: AUTH_ENABLED,
      status,
      username,
      checkSession,
      login,
      logout,
    }),
    [status, username, checkSession, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
