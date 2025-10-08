
"use client"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  if (isAuthLoading || user) {
      return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 login-background">
      <Card 
        className="w-full max-w-sm"
        style={{
            background: 'linear-gradient(to bottom right, rgba(32, 45, 93, 0.8), rgba(223, 28, 26, 0.8))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
                <div className="flex justify-center items-center mb-4">
                     <Image src="/UNELOGO.png" alt="UNE Logo" width={160} height={57} className="w-40 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                </div>
              <CardTitle className="text-2xl font-headline text-white">¡Bienvenido de Nuevo!</CardTitle>
              <CardDescription className="text-white/80">
                Ingresa tus credenciales para iniciar sesión.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white/90">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  name="correo"
                  placeholder="m@ejemplo.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 text-white placeholder:text-white/60 border-white/20 focus:ring-white/80"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-white/90">Contraseña</Label>
                <div className="relative">
                   <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    name="contrasena"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-white/10 text-white placeholder:text-white/60 border-white/20 focus:ring-white/80"
                    disabled={isSubmitting}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute inset-y-0 right-0 h-full px-3 text-white/60 hover:text-white rounded-full hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-[#202d5d] text-white hover:bg-[#df1c1a] shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] transition-all duration-300" disabled={isSubmitting}>
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
