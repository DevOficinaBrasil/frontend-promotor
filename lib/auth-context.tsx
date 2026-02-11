"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Promotor } from "./types";
import { mockPromotor } from "./mock-data";
import { loginService } from "@/service/auth.service";

interface AuthContextType {
  promotor: Promotor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [promotor, setPromotor] = useState<Promotor | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento inicial

  // Verifica se já existe um usuário salvo no localStorage ao carregar a aplicação
  useEffect(() => {
    const storedPromotor = localStorage.getItem("ofbr_promotor");
    if (storedPromotor) {
      try {
        setPromotor(JSON.parse(storedPromotor));
      } catch (error) {
        console.error("Erro ao recuperar os dados de login", error);
        localStorage.removeItem("ofbr_promotor");
      }
    }
    setIsLoading(false); // Finalizou a checagem
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const response = await loginService(email, senha);
        setPromotor(response.promotor);
        // Salva os dados do promotor no localStorage
        localStorage.setItem("ofbr_promotor", JSON.stringify(response.promotor));
        
        // Se a API retornar um token JWT, é bom salvar também para enviar nas requisições:
        if (response.token) {
          localStorage.setItem("ofbr_token", response.token);
        }
        return true;
      } catch {
        return false;
      }
    }

    // Fallback mock
    if (email.replace(/\D/g, "").length >= 11) {
      setPromotor(mockPromotor);
      localStorage.setItem("ofbr_promotor", JSON.stringify(mockPromotor));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setPromotor(null);
    // Remove os dados do armazenamento ao sair
    localStorage.removeItem("ofbr_promotor");
    localStorage.removeItem("ofbr_token");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        promotor,
        isAuthenticated: !!promotor,
        isLoading,
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