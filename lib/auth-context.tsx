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

interface AuthContextType {
  promotor: Promotor | null;
  isAuthenticated: boolean;
  login: (cpf: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [promotor, setPromotor] = useState<Promotor | null>(null);

  const login = useCallback(async (cpf: string, _senha: string) => {
    // Mock: accept any CPF with password "123456"
    // In production, this would call your backend API
    if (cpf.replace(/\D/g, "").length >= 11) {
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
