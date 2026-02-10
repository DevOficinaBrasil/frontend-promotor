"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/components/login-form";
import { HomeScreen } from "@/components/home-screen";

function AppContent() {
  const { isAuthenticated } = useAuth();

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
