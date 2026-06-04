'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '@/types';
import { API_ENDPOINTS, fetchApi } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ error?: string }>;
  register: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
  });

  const checkAuth = async () => {
    const { data } = await fetchApi<AuthState>(API_ENDPOINTS.STATUS);
    if (data) {
      setAuthState(data);
    }
  };

  const login = async (username: string, password: string) => {
    const { error } = await fetchApi(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (error) {
      return { error };
    }

    await checkAuth();
    return {};
  };

  const register = async (username: string, password: string) => {
    const { error } = await fetchApi(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (error) {
      return { error };
    }

    return {};
  };

  const logout = async () => {
    await fetchApi(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    setAuthState({ isAuthenticated: false });
  };

  useEffect(() => {
    // Intentionally check auth status on mount
    void checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, checkAuth }}>
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
