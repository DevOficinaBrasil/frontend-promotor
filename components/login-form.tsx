"use client";

import React from "react";
import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequestFeedback } from "@/components/request-feedback";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Route, Eye, EyeOff, Loader2 } from "lucide-react";

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
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginAction = useCallback(
    async (emailInput: string, password: string) => {
      const success = await login(emailInput, password);
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

    const { ok } = await executeLogin(email, senha);
    if (!ok && feedbackState !== "error") {
      setError("E-mail ou senha incorretos");
    }
  };

  return (
    <div className="flex min-h-dvh">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between bg-azul p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verde/15">
            <Route className="h-5 w-5 text-verde" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display">
            OFBR Promotores
          </span>
        </div>

        <div className="max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white font-display xl:text-5xl">
            Gerencie suas visitas com eficiência
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/60 xl:text-lg">
            Rotas otimizadas, check-in em tempo real e pesquisas integradas — tudo em um só lugar.
          </p>
        </div>

        <p className="text-xs text-white/30">
          Oficina Brasil © {new Date().getFullYear()}
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 md:px-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only branding */}
          <div className="mb-10 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azul">
              <Route className="h-7 w-7 text-verde" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-display">
              OFBR Promotores
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestão de visitas e rotas
            </p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Acesse sua conta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-border bg-card text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/20"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="senha" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-11 rounded-lg border-border bg-card pr-11 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/20"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/8 px-3 py-2 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={feedbackState === "loading"}
              className="h-11 w-full rounded-lg bg-azul font-semibold text-verde transition-all hover:bg-azul/90 active:scale-[0.98]"
            >
              {feedbackState === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-[11px] text-muted-foreground/60 lg:text-left">
            Versão 1.0.0
          </p>
        </div>
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