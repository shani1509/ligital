'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, LibraryStatus } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isExpired: boolean;
  login: (email: string, password: string, cfTurnstileToken: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  libraryName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  maxCapacity: number;
  cfTurnstileToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isExpired = user?.library.status === 'EXPIRED';

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, cfTurnstileToken: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, cfTurnstileToken }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with client-side logout regardless
    }
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isExpired, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
