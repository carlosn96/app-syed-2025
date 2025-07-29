
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role, users as initialUsers } from '@/lib/data';

interface NewUserData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  rol: 'coordinator' | 'teacher' | 'student';
  grupo?: string;
  password?: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
  addUser: (userData: NewUserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize mock users with the admin user
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'admin',
    user: { id: 1, nombre: 'Usuario', apellido_paterno: 'Administrador', apellido_materno: '', correo: 'admin@example.com', rol: 'administrator', fecha_registro: '2023-01-01T00:00:00Z', ultimo_acceso: null }
  },
  'coordinator@example.com': {
    password: 'coordinador',
    user: initialUsers.find(u => u.correo === 'coordinator@example.com')!
  },
};

// Populate mockUsers from the initialUsers data
initialUsers.forEach(user => {
    if (!mockUsers[user.correo]) {
        mockUsers[user.correo] = {
            password: 'password', // Default password for sample users
            user: user
        };
    }
});


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
  
  const addUser = (userData: NewUserData) => {
    if (mockUsers[userData.correo]) {
        throw new Error("El correo electrónico ya está en uso.");
    }
    
    const newId = Math.max(...Object.values(mockUsers).map(u => u.user.id), 0) + 1;
    const newUser: User = {
        id: newId,
        nombre: userData.nombre,
        apellido_paterno: userData.apellido_paterno,
        apellido_materno: userData.apellido_materno,
        correo: userData.correo,
        rol: userData.rol,
        grupo: userData.grupo,
        fecha_registro: new Date().toISOString(),
        ultimo_acceso: null,
    };

    initialUsers.push(newUser); // Add to the data array for the users page
    mockUsers[userData.correo] = {
        password: userData.password || 'password', // Store password for mock login
        user: newUser,
    };
  };

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

  const value = { user, login, logout, isLoading, addUser };
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }
  
  if (!user && pathname !== '/login') {
    return <div className="flex h-screen w-full items-center justify-center">Redirigiendo al inicio de sesión...</div>;
  }
  
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
