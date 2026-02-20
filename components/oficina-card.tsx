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
  // NOVA PROP: Avisa se existe alguma outra rota em andamento ou a caminho
  isAnyRouteActive?: boolean; 
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

const borderColorMap: Record<string, string> = {
  vermelho: "border-red-500",
  cinza: "border-gray-400",
  verde: "border-emerald-500",
  azul: "border-blue-500",
};

const getEngajamentoColor = (val: string) => (val === "alto" ? "bg-emerald-500" : "bg-red-500");
const getSentimentoColor = (val: string) => {
  if (val === "promotor") return "bg-emerald-500";
  if (val === "neutro") return "bg-yellow-500";
  return "bg-red-500";
};
const getTreinamentoColor = (val: string) => {
  if (val === "alto") return "bg-emerald-500";
  if (val === "medio") return "bg-yellow-500";
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
  isAnyRouteActive = false, // Valor padrão como false
}: OficinaCardProps) {
  const config = statusConfig[rota.status] || statusConfig.BACKLOG;
  const isFinished = rota.status === "FINALIZADO" || rota.status === "CANCELADO";

  const borderClass = borderColorMap[rota.oficina.cor_icone] || "border-border";

  // LÓGICA NOVA: Bloqueia este card se ele for BACKLOG e houver outra rota ativa
  const isDisabledByActiveRoute = rota.status === "BACKLOG" && isAnyRouteActive;

  return (
    <div className={`relative flex h-full flex-col gap-4 rounded-2xl border-2 bg-card p-5 shadow-sm transition-all ${borderClass} ${isDisabledByActiveRoute ? "opacity-60" : ""}`}>
      
      {/* Botão de Cancelar */}
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
                  // Botão desabilitado se estiver cancelando OU se houver outra rota ativa
                  disabled={isCanceling || isDisabledByActiveRoute}
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
          <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold text-card-foreground">
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

      {/* Seção de Flags (Bullet Points) */}
      <div className="grid grid-cols-1 gap-y-1.5 border-y border-border/50 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${getEngajamentoColor(rota.oficina.flag_engajamento)}`} />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Engajamento: {rota.oficina.flag_engajamento}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${getSentimentoColor(rota.oficina.flag_sentimento)}`} />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Sentimento: {rota.oficina.flag_sentimento}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${getTreinamentoColor(rota.oficina.flag_treinamento)}`} />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Participações em treinamentos: {rota.oficina.flag_treinamento}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground min-h-[2.5rem]">
            {rota.oficina.endereco}
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
            {rota.status === "BACKLOG" && (
              <Button
                onClick={() => onNavigate(rota)}
                variant="outline"
                // Desabilita se estiver navegando OU se já existir rota ativa no sistema
                disabled={isNavigating || isDisabledByActiveRoute}
                className="h-11 flex-1 gap-2 text-xs font-medium"
              >
                {isNavigating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                {isNavigating ? "Abrindo..." : "Ir a caminho"}
              </Button>
            )}

            {rota.status === "A CAMINHO" && (
              <Button
                onClick={() => onCheckin(rota)}
                disabled={isCheckingIn}
                className="h-11 flex-1 gap-2 text-xs font-medium"
              >
                {isCheckingIn ? <Loader2 className="h-3 w-3 animate-spin" /> : <ClipboardCheck className="h-3 w-3" />}
                {isCheckingIn ? "Registrando..." : "Check-in"}
              </Button>
            )}

            {rota.status === "EM ANDAMENTO" && (
              <Button
                onClick={() => onSurvey(rota)}
                disabled={isLoadingSurvey}
                className="h-11 flex-1 gap-2 text-xs font-medium"
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
  );
}