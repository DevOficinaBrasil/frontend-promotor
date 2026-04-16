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
  isAnyRouteActive?: boolean; 
}

const statusConfig: Record<string, { label: string; className: string }> = {
  BACKLOG: {
    label: "Pendente",
    className: "bg-muted text-muted-foreground",
  },
  "A CAMINHO": {
    label: "A caminho",
    className: "bg-warning/15 text-warning",
  },
  "EM ANDAMENTO": {
    label: "Em andamento",
    className: "bg-primary/10 text-primary",
  },
  FINALIZADO: {
    label: "Finalizado",
    className: "bg-success/10 text-success",
  },
  CANCELADO: {
    label: "Cancelado",
    className: "bg-destructive/10 text-destructive",
  },
};

const accentMap: Record<string, string> = {
  vermelho: "bg-red-500",
  cinza: "bg-gray-400",
  verde: "bg-emerald-500",
  azul: "bg-blue-500",
};

const getEngajamentoColor = (val: string) => (val === "alto" ? "bg-emerald-500" : "bg-red-500");
const getSentimentoColor = (val: string) => {
  if (val === "promotor") return "bg-emerald-500";
  if (val === "neutro") return "bg-amber-500";
  return "bg-red-500";
};
const getTreinamentoColor = (val: string) => {
  if (val === "alto") return "bg-emerald-500";
  if (val === "medio") return "bg-amber-500";
  return "bg-red-500";
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
  isAnyRouteActive = false,
}: OficinaCardProps) {
  const config = statusConfig[rota.status] || statusConfig.BACKLOG;
  const isFinished = rota.status === "FINALIZADO" || rota.status === "CANCELADO";
  const isDisabledByActiveRoute = rota.status === "BACKLOG" && isAnyRouteActive;
  const accentClass = accentMap[rota.oficina.cor_icone] || "bg-primary";

  return (
    <div className={`relative flex h-full flex-col rounded-xl border border-border bg-card transition-all ${isDisabledByActiveRoute ? "opacity-50" : ""}`}>
      {/* Accent top bar */}
      <div className={`h-1 w-full rounded-t-xl ${accentClass}`} />

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <h3 className="line-clamp-2 text-sm font-bold text-foreground md:text-base">
              {rota.oficina.nome}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {rota.campanha.nome}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className={`shrink-0 border-0 text-[10px] font-semibold ${config.className}`}
            >
              {config.label}
            </Badge>
            {!isFinished && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/50 hover:bg-destructive/8 hover:text-destructive"
                      onClick={() => onCancel(rota)}
                      disabled={isCanceling || isDisabledByActiveRoute}
                    >
                      {isCanceling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="sr-only">Cancelar Visita</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancelar Visita</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${getEngajamentoColor(rota.oficina.flag_engajamento)}`} />
            <span className="text-[10px] font-medium text-muted-foreground">
              Engajamento: {rota.oficina.flag_engajamento}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${getSentimentoColor(rota.oficina.flag_sentimento)}`} />
            <span className="text-[10px] font-medium text-muted-foreground">
              Sentimento: {rota.oficina.flag_sentimento}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${getTreinamentoColor(rota.oficina.flag_treinamento)}`} />
            <span className="text-[10px] font-medium text-muted-foreground">
              Treinamento: {rota.oficina.flag_treinamento}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {rota.oficina.endereco}
          </span>
        </div>

        {/* Bottom section */}
        <div className="mt-auto flex flex-col gap-3 pt-1">
          {rota.oficina.distancia_km !== undefined && (
            <div className="flex items-center gap-1.5">
              <Navigation className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {rota.oficina.distancia_km.toFixed(1)} km
              </span>
            </div>
          )}

          {!isFinished && (
            <div className="flex gap-2">
              {rota.status === "BACKLOG" && (
                <Button
                  onClick={() => onNavigate(rota)}
                  variant="outline"
                  disabled={isNavigating || isDisabledByActiveRoute}
                  className="h-10 flex-1 gap-2 rounded-lg text-xs font-medium transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  {isNavigating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                  {isNavigating ? "Abrindo..." : "Ir a caminho"}
                </Button>
              )}

              {rota.status === "A CAMINHO" && (
                <Button
                  onClick={() => onCheckin(rota)}
                  disabled={isCheckingIn}
                  className="h-10 flex-1 gap-2 rounded-lg bg-azul text-xs font-medium text-verde transition-all hover:bg-azul/90 active:scale-[0.98]"
                >
                  {isCheckingIn ? <Loader2 className="h-3 w-3 animate-spin" /> : <ClipboardCheck className="h-3 w-3" />}
                  {isCheckingIn ? "Registrando..." : "Check-in"}
                </Button>
              )}

              {rota.status === "EM ANDAMENTO" && (
                <Button
                  onClick={() => onSurvey(rota)}
                  disabled={isLoadingSurvey}
                  className="h-10 flex-1 gap-2 rounded-lg bg-azul text-xs font-medium text-verde transition-all hover:bg-azul/90 active:scale-[0.98]"
                >
                  {isLoadingSurvey ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
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
                  <span className="text-sm font-medium text-success">Visita concluída</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Visita cancelada</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}