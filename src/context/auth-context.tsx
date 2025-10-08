
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Roles, getRedirectPath } from '@/lib/modelos';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Role = 'administrador' | 'coordinador' | 'docente' | 'alumno';

const roleIdToName = (id: number): Role => {
    switch (id) {
        case Roles.Administrador: return 'administrador';
        case Roles.Coordinador: return 'coordinador';
        case Roles.Docente: return 'docente';
        case Roles.Alumno: return 'alumno';
        default: throw new Error(`Unknown role ID: ${id}`);
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
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
    if (isLoading) return;

    const isAuthPage = pathname === '/login';

    if (user && isAuthPage) {
      const redirectPath = getRedirectPath(user.id_rol);
      router.replace(redirectPath);
    }
  }, [isLoading, user, pathname, router]);
  
  const addUser = (userData: any) => {
    console.log("Adding user (mock):", userData);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
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
            const internalRole = roleIdToName(apiUser.id_rol);
            const loggedInUser: User = {
                id: apiUser.id,
                nombre: apiUser.nombre,
                apellido_paterno: apiUser.apellido_paterno,
                apellido_materno: apiUser.apellido_materno,
                correo: apiUser.email,
                id_rol: apiUser.id_rol,
                rol: internalRole,
                rol_nombre: apiUser.rol,
                fecha_registro: apiUser.fecha_registro,
                ultimo_acceso: apiUser.ultimo_acceso,
            };
            
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            localStorage.setItem('access_token', result.datos.access_token);
            setUser(loggedInUser);
            
            toast({
              variant: "success",
              title: "Inicio de Sesión Exitoso",
              description: `¡Bienvenido de nuevo, ${loggedInUser.nombre}!`,
            });
            
            const redirectPath = getRedirectPath(loggedInUser.id_rol);
            router.replace(redirectPath);
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
    setIsLoading(true);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setUser(null);
    router.replace('/login');
    // We can set isLoading to false after a short delay to allow the redirect to happen smoothly.
    setTimeout(() => setIsLoading(false), 50);
  };

  const value = { user, login, logout, isLoading, addUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
