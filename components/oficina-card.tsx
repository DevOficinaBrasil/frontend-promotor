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
} from "lucide-react";

interface OficinaCardProps {
  rota: RotaPromotor;
  onNavigate: (rota: RotaPromotor) => void;
  onCheckin: (rota: RotaPromotor) => void;
  isNavigating?: boolean;
  isCheckingIn?: boolean;
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

export function OficinaCard({ rota, onNavigate, onCheckin, isNavigating, isCheckingIn }: OficinaCardProps) {
  const config = statusConfig[rota.status] || statusConfig.BACKLOG;
  const isFinished = rota.status === "FINALIZADO" || rota.status === "CANCELADO";

  return (
    // h-full garante que se estiver em um grid, todos tenham a mesma altura
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 flex-col gap-1">
          {/* min-h reserva espaço para 2 linhas; line-clamp-2 evita quebra excessiva */}
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
          {/* min-h reserva espaço para o endereço não "pular" o layout */}
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

      {/* mt-auto empurra os botões para o final, alinhando-os horizontalmente entre cards */}
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

            {(rota.status === "A CAMINHO" || rota.status === "BACKLOG") && (
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

            {rota.status === "EM ANDAMENTO" && (
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
                {isCheckingIn ? "Registrando..." : "Finalizar visita"}
              </Button>
            )}
          </div>
        )}

        {isFinished && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted py-2.5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">
              Visita concluída
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
