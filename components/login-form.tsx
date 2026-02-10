"use client";

import React from "react";
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequestFeedback } from "@/components/request-feedback";
import { useAsyncAction } from "@/hooks/use-async-action";
import { MapPin, Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Validador de E-mail
 * Utiliza uma expressão regular simples para verificar o formato do e-mail.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function LoginForm() {
  const { login } = useAuth();
  
  // Alterado de cpf para email
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginAction = useCallback(
    async (emailInput: string, password: string) => {
      const success = await login(emailInput, password);
      // Mensagem genérica por segurança
      if (!success) throw new Error("E-mail ou senha incorretos");
      return success;
    },
    [login]
  );

  const {
    feedbackState,
    execute: executeLogin,
    retry: retryLogin,
    reset: resetFeedback,
  } = useAsyncAction(loginAction, { delay: 1500, errorChance: 0.15 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Nova lógica de validação de e-mail
    if (!email) {
      setError("Informe seu e-mail");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido");
      return;
    }

    if (!senha) {
      setError("Informe sua senha");
      return;
    }

    // Executa o login com o e-mail validado
    const { ok } = await executeLogin(email, senha);
    if (!ok && feedbackState !== "error") {
      setError("E-mail ou senha incorretos");
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-primary px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">
            RotaCheck
          </h1>
          <p className="text-sm text-primary-foreground/70">
            Gestão de visitas e rotas
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email" // Tipo alterado para 'email' para teclados mobile adequados
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="senha" className="text-sm font-medium text-card-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 pr-12 text-base"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={feedbackState === "loading"}
            className="h-12 w-full text-base font-semibold"
          >
            {feedbackState === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-primary-foreground/50">
          {"Versão 1.0.0"}
        </p>
      </div>

      <RequestFeedback
        state={feedbackState}
        loadingMessage="Validando suas credenciais..."
        successMessage="Login realizado com sucesso!"
        errorMessage="Falha ao conectar com o servidor. Verifique sua conexão."
        onClose={resetFeedback}
        onRetry={retryLogin}
        autoCloseDuration={1200}
      />
    </div>
  );
}