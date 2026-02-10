"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export type FeedbackState = "idle" | "loading" | "success" | "error";

interface RequestFeedbackProps {
  state: FeedbackState;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
  /** Auto-close after success in ms (0 = no auto-close) */
  autoCloseDuration?: number;
}

export function RequestFeedback({
  state,
  loadingMessage = "Processando...",
  successMessage = "Operacao realizada com sucesso!",
  errorMessage = "Ocorreu um erro. Tente novamente.",
  onClose,
  onRetry,
  autoCloseDuration = 1500,
}: RequestFeedbackProps) {
  const isOpen = state !== "idle";

  useEffect(() => {
    if (state === "success" && autoCloseDuration > 0) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [state, autoCloseDuration, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && state !== "loading") onClose(); }}>
      <DialogContent
        className="max-w-[280px] rounded-2xl border-0 p-8 shadow-xl [&>button]:hidden"
        onPointerDownOutside={(e) => { if (state === "loading") e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (state === "loading") e.preventDefault(); }}
      >
        <DialogTitle className="sr-only">
          {state === "loading" && "Processando"}
          {state === "success" && "Sucesso"}
          {state === "error" && "Erro"}
        </DialogTitle>

        <div className="flex flex-col items-center gap-4 text-center">
          {state === "loading" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-card-foreground">
                  Aguarde
                </p>
                <p className="text-xs text-muted-foreground">
                  {loadingMessage}
                </p>
              </div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-card-foreground">
                  Sucesso
                </p>
                <p className="text-xs text-muted-foreground">
                  {successMessage}
                </p>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 animate-in zoom-in-50 duration-300">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-card-foreground">
                  Erro
                </p>
                <p className="text-xs text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 pt-2">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="w-full text-xs font-semibold"
                  >
                    Tentar novamente
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
