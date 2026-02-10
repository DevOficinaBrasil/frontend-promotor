"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Promotor } from "./types";
import { mockPromotor } from "./mock-data";
import { loginService } from "@/service/auth.service";

interface AuthContextType {
  promotor: Promotor | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [promotor, setPromotor] = useState<Promotor | null>(null);

  const login = useCallback(async (email: string, senha: string) => {
    // If API URL is configured, call the real backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const response = await loginService(email, senha);
        setPromotor(response.promotor);
        return true;
      } catch {
        return false;
      }
    }

    // Fallback mock for development without backend
    if (email.replace(/\D/g, "").length >= 11) {
      setPromotor(mockPromotor);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setPromotor(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        promotor,
        isAuthenticated: !!promotor,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
