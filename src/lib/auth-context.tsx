'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  isAdmin?: boolean;
  role?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Parse user fields out of the /auth/me response */
function parseUser(d: Record<string, unknown>): User {
  const profile = (d.memberProfile ?? {}) as Record<string, unknown>;
  return {
    id: d.id as string,
    email: d.email as string | undefined,
    phone: d.phone as string | undefined,
    isEmailVerified: d.isEmailVerified as boolean | undefined,
    // memberProfile may be nested OR fields may be top-level on login response
    firstName: ((profile.firstName ?? d.firstName) as string) || undefined,
    lastName: ((profile.lastName ?? d.lastName) as string) || undefined,
    isAdmin: (d.isAdmin as boolean | undefined) ?? false,
    role: d.role as string | null | undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('gmt_token');
    const storedUser = localStorage.getItem('gmt_user');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Immediately restore cached user so header shows name instantly
    if (storedUser) {
      try {
        const cached = JSON.parse(storedUser) as User;
        setUser(cached);
        setToken(storedToken);
        setIsLoggedIn(true);
      } catch {
        // corrupted cache — ignore
      }
    }

    // Then verify token with backend (refresh user data)
    api.auth
      .me(storedToken)
      .then((res) => {
        if (res.success && res.data) {
          const parsed = parseUser(res.data as Record<string, unknown>);
          setUser(parsed);
          setToken(storedToken);
          setIsLoggedIn(true);
          localStorage.setItem('gmt_user', JSON.stringify(parsed));
        } else {
          // Token rejected by server — clear everything
          localStorage.removeItem('gmt_token');
          localStorage.removeItem('gmt_user');
          setToken(null);
          setUser(null);
          setIsLoggedIn(false);
        }
        setLoading(false);
      })
      .catch(() => {
        // Backend unreachable — if we had a cached user, keep the session
        // but do NOT set isLoggedIn=true if there was no cached user
        if (!storedUser) {
          localStorage.removeItem('gmt_token');
          setToken(null);
          setIsLoggedIn(false);
        }
        setLoading(false);
      });
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.auth.login({ identifier, password });
      if (res.success && res.data) {
        const d = res.data as { accessToken: string; user: Record<string, unknown> };
        const parsed = parseUser(d.user);
        localStorage.setItem('gmt_token', d.accessToken);
        localStorage.setItem('gmt_user', JSON.stringify(parsed));
        setToken(d.accessToken);
        setUser(parsed);
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, message: res.message ?? 'Invalid credentials' };
    } catch {
      return { success: false, message: 'Cannot reach server. Check your connection.' };
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('gmt_token');
    if (!currentToken) return;
    try {
      const res = await api.auth.me(currentToken);
      if (res.success && res.data) {
        const parsed = parseUser(res.data as Record<string, unknown>);
        setUser(parsed);
        localStorage.setItem('gmt_user', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  };

  const logout = () => {
    localStorage.removeItem('gmt_token');
    localStorage.removeItem('gmt_user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
