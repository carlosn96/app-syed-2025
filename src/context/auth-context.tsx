"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'administrator' | 'coordinator' | 'teacher' | 'student';

interface User {
  id: number;
  name: string;
  role: Role;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'admin',
    user: { id: 1, name: 'Admin User', role: 'administrator', email: 'admin@example.com' }
  },
  'coordinador@example.com': {
    password: 'coordinador',
    user: { id: 2, name: 'Coordinator User', role: 'coordinator', email: 'coordinador@example.com' }
  },
  'docente@example.com': {
    password: 'docente',
    user: { id: 3, name: 'Teacher User', role: 'teacher', email: 'docente@example.com' }
  },
  'alumno@example.com': {
    password: 'alumno',
    user: { id: 4, name: 'Student User', role: 'student', email: 'alumno@example.com' }
  },
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
        if (!user && pathname !== '/login') {
            router.push('/login');
        } else if (user && pathname === '/login') {
            router.push('/dashboard');
        }
    }
  }, [isLoading, user, pathname, router]);

  const login = (email: string, password: string): boolean => {
    const userData = mockUsers[email];
    if (userData && userData.password === password) {
      const userToLogin = userData.user;
      localStorage.setItem('user', JSON.stringify(userToLogin));
      setUser(userToLogin);
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const value = { user, login, logout, isLoading };

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!user && pathname !== '/login') {
    return <div className="flex h-screen w-full items-center justify-center">Redirecting to login...</div>;
  }
  
  if (user && pathname === '/login') {
      return <div className="flex h-screen w-full items-center justify-center">Redirecting to dashboard...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
