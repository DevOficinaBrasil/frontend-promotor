"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/login-form";
import { HomeScreen } from "@/components/home-screen";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Exibe o loader até que o AuthProvider confirme se há um usuário no localStorage
  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Restaurando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <HomeScreen />;
}

export default function Page() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background shadow-lg">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}