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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('gmt_token');
    if (storedToken) {
      setToken(storedToken);
      api.auth.me(storedToken).then((res) => {
        if (res.success && res.data) {
          const d = res.data as Record<string, unknown>;
          const profile = (d.memberProfile ?? {}) as Record<string, unknown>;
          setUser({
            id: d.id as string,
            email: d.email as string | undefined,
            phone: d.phone as string | undefined,
            isEmailVerified: d.isEmailVerified as boolean | undefined,
            firstName: profile.firstName as string | undefined,
            lastName: profile.lastName as string | undefined,
            isAdmin: d.isAdmin as boolean | undefined,
            role: d.role as string | null | undefined,
          });
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('gmt_token');
          setToken(null);
          setIsLoggedIn(false);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
      setIsLoggedIn(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.auth.login({ identifier, password });
    if (res.success && res.data) {
      const d = res.data as { accessToken: string; user: User };
      localStorage.setItem('gmt_token', d.accessToken);
      setToken(d.accessToken);
      setUser({
        ...d.user,
        isAdmin: (d.user as User & { isAdmin?: boolean }).isAdmin,
        role: (d.user as User & { role?: string | null }).role,
      });
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const logout = () => {
    localStorage.removeItem('gmt_token');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
