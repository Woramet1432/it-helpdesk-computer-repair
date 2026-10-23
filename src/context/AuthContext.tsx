import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, authStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoAccount: (roleKey: 'admin' | 'tech_narin' | 'tech_wichai' | 'user_kanya' | 'user_pricha') => Promise<void>;
  isAdmin: boolean;
  isTechnician: boolean;
  isStaff: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to resolve current user token:', err);
      authStorage.clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      setUser(null);
    }
  };

  const switchDemoAccount = async (roleKey: 'admin' | 'tech_narin' | 'tech_wichai' | 'user_kanya' | 'user_pricha') => {
    const creds: Record<string, { username: string; password: string }> = {
      admin: { username: 'admin', password: 'Admin@123' },
      tech_narin: { username: 'tech.narin', password: 'Tech@123' },
      tech_wichai: { username: 'tech.wichai', password: 'Tech@123' },
      user_kanya: { username: 'user.kanya', password: 'User@123' },
      user_pricha: { username: 'user.pricha', password: 'User@123' },
    };

    const target = creds[roleKey];
    if (target) {
      await login(target);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';
  const isStaff = isAdmin || isTechnician;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoAccount,
        isAdmin,
        isTechnician,
        isStaff,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
