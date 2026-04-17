"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/login-form";
import { HomeScreen } from "@/components/home-screen";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Restaurando sessão...</p>
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}