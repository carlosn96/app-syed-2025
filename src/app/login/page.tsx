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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Role = 'administrator' | 'coordinator' | 'teacher' | 'student';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
    }
  };
  
  if (isLoading || user) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            Loading...
        </div>
      )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" className="h-12 w-12 text-primary-foreground bg-primary/20 hover:bg-primary/30 rounded-full">
                    <GraduationCap className="h-7 w-7" />
                </Button>
            </div>
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>
            Select a role to simulate login.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Select onValueChange={(value) => setSelectedRole(value as Role)} value={selectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administrator">Administrator</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={!selectedRole}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
