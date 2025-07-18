"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'administrator' | 'coordinator' | 'teacher' | 'student';

interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  rol: Role;
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
    user: { id: 1, nombre: 'Usuario', apellido_paterno: 'Administrador', apellido_materno: '', correo: 'admin@example.com', rol: 'administrator' }
  },
  'coordinator@example.com': {
    password: 'coordinador',
    user: { id: 2, nombre: 'Usuario', apellido_paterno: 'Coordinador', apellido_materno: '', correo: 'coordinator@example.com', rol: 'coordinator' }
  },
  'teacher@example.com': {
    password: 'docente',
    user: { id: 3, nombre: 'Usuario', apellido_paterno: 'Docente', apellido_materno: '', correo: 'teacher@example.com', rol: 'teacher' }
  },
  'student@example.com': {
    password: 'alumno',
    user: { id: 4, nombre: 'Usuario', apellido_paterno: 'Alumno', apellido_materno: '', correo: 'student@example.com', rol: 'student' }
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
      console.error("Fallo al analizar el usuario desde localStorage", error);
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
    return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }
  
  // While loading, or if no user is logged in on a protected route,
  // don't render the children. This avoids content flashes.
  if (!user && pathname !== '/login') {
    return <div className="flex h-screen w-full items-center justify-center">Redirigiendo al inicio de sesión...</div>;
  }
  
  // If a user is logged in but on the login page, redirect them.
  if (user && pathname === '/login') {
      return <div className="flex h-screen w-full items-center justify-center">Redirigiendo al panel de control...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
