
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Role } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleMapping: { [key: number]: Role } = {
  1: 'administrator',
  2: 'coordinator',
  3: 'teacher',
  4: 'student'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
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
  
  const addUser = (userData: any) => {
    // This is a mock function, in a real app this would be an API call
    console.log("Adding user (mock):", userData);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ correo: email, contrasena: password }),
        });

        const result = await response.json();

        if (result.exito) {
            const apiUser = result.datos.user;
            
            const loggedInUser: User = {
                id: apiUser.id,
                nombre: apiUser.name.split(' ')[0] || '',
                apellido_paterno: apiUser.name.split(' ').slice(1).join(' ') || '',
                apellido_materno: '',
                correo: apiUser.email,
                rol: roleMapping[apiUser.role] || 'student',
                grupo: undefined, 
                fecha_registro: new Date().toISOString(),
                ultimo_acceso: new Date().toISOString(),
            };
            
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            localStorage.setItem('access_token', result.datos.access_token);
            setUser(loggedInUser);
            
            toast({
              variant: "success",
              title: "Inicio de Sesión Exitoso",
              description: `¡Bienvenido de nuevo, ${loggedInUser.nombre}!`,
            });
            
            router.push('/dashboard');
            return true;
        } else {
            const errorMessages = result.datos?.errors 
                ? Object.values(result.datos.errors).flat().join(' ') 
                : result.mensaje || "Ocurrió un error desconocido.";
            toast({
              variant: "destructive",
              title: "Error al iniciar sesión",
              description: errorMessages,
            });
            return false;
        }
    } catch (error) {
        console.error("Error during login request:", error);
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar con el servidor. Por favor, inténtalo de nuevo más tarde.",
        });
        return false;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/login');
  };

  const value = { user, login, logout, isLoading, addUser };
  
  if (isLoading && !user) {
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
