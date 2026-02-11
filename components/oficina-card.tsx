"use client";

import type { RotaPromotor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Navigation,
  MapPin,
  Phone,
  ClipboardCheck,
  CheckCircle2,
  Loader2,
  FileText,
  XCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OficinaCardProps {
  rota: RotaPromotor;
  onNavigate: (rota: RotaPromotor) => void;
  onCheckin: (rota: RotaPromotor) => void;
  onSurvey: (rota: RotaPromotor) => void;
  onCancel: (rota: RotaPromotor) => void;
  isNavigating?: boolean;
  isCheckingIn?: boolean;
  isLoadingSurvey?: boolean;
  isCanceling?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  BACKLOG: {
    label: "Pendente",
    className: "bg-secondary text-secondary-foreground",
  },
  "A CAMINHO": {
    label: "A caminho",
    className: "bg-warning text-warning-foreground",
  },
  "EM ANDAMENTO": {
    label: "Em andamento",
    className: "bg-primary text-primary-foreground",
  },
  FINALIZADO: {
    label: "Finalizado",
    className: "bg-success text-success-foreground",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-destructive text-destructive-foreground",
  },
};

export function OficinaCard({
  rota,
  onNavigate,
  onCheckin,
  onSurvey,
  onCancel,
  isNavigating,
  isCheckingIn,
  isLoadingSurvey,
  isCanceling,
}: OficinaCardProps) {
  const config = statusConfig[rota.status] || statusConfig.BACKLOG;
  const isFinished = rota.status === "FINALIZADO" || rota.status === "CANCELADO";

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Botão de Cancelar no canto superior direito */}
      {!isFinished && (
        <div className="absolute right-3 top-3 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onCancel(rota)}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="sr-only">Cancelar Visita</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancelar Visita</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="flex items-start justify-between gap-2 pr-8">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-base font-semibold text-card-foreground min-h-[3rem] line-clamp-2 leading-tight">
            {rota.oficina.nome}
          </h3>
          <p className="text-xs text-muted-foreground">
            {rota.campanha.nome}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`shrink-0 border-0 text-[10px] font-semibold ${config.className}`}
        >
          {config.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs leading-relaxed text-muted-foreground min-h-[2.5rem] line-clamp-2">
            {rota.oficina.endereco}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {rota.oficina.telefone}
          </span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        {rota.oficina.distancia_km !== undefined && (
          <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-card-foreground">
              {rota.oficina.distancia_km.toFixed(1)} km de distância
            </span>
          </div>
        )}

        {!isFinished && (
          <div className="flex gap-3">
            {/* BACKLOG: Botão para ir A Caminho */}
            {rota.status === "BACKLOG" && (
              <Button
                onClick={() => onNavigate(rota)}
                variant="outline"
                disabled={isNavigating}
                className="h-11 flex-1 gap-2 text-xs font-medium"
              >
                {isNavigating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Navigation className="h-3 w-3" />
                )}
                {isNavigating ? "Abrindo..." : "Ir a caminho"}
              </Button>
            )}

            {/* A CAMINHO: Botão para fazer Check-in (sem modal, apenas update) */}
            {rota.status === "A CAMINHO" && (
              <Button
                onClick={() => onCheckin(rota)}
                disabled={isCheckingIn}
                className="h-11 flex-1 gap-2 text-xs font-medium"
              >
                {isCheckingIn ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ClipboardCheck className="h-3 w-3" />
                )}
                {isCheckingIn ? "Registrando..." : "Check-in"}
              </Button>
            )}

            {/* EM ANDAMENTO: Botão para Responder Pesquisa (Abre modal) */}
            {rota.status === "EM ANDAMENTO" && (
              <Button
                onClick={() => onSurvey(rota)}
                disabled={isLoadingSurvey}
                className="h-11 flex-1 gap-2 text-xs font-medium"
              >
                {isLoadingSurvey ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                Responder Pesquisa
              </Button>
            )}
          </div>
        )}

        {isFinished && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted py-2.5">
            {rota.status === "FINALIZADO" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Visita concluída
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Visita cancelada
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}