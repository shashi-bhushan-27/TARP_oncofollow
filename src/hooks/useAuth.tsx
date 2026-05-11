'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { demoUsers } from '@/data/demoData';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  role: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('oncofollow_user') : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('oncofollow_user');
      }
    }
  }, []);

  const login = (userId: string) => {
    const found = demoUsers.find(u => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem('oncofollow_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('oncofollow_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      role: user?.role || null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
