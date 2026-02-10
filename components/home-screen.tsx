"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { RotaPromotor, CampanhaResult } from "@/lib/types";
import { mockRotas, mockPerguntas } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { getCampanhaAtiva } from "@/service/campanha.service";
import { updateRotaACaminho, updateRotaCheckin, updateRotaFinalizado } from "@/service/rota.service";
import { AppHeader } from "@/components/app-header";
import { RouteCarousel } from "@/components/route-carousel";
import { CheckinForm } from "@/components/checkin-form";
import { RequestFeedback } from "@/components/request-feedback";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react";

export function HomeScreen() {
  const { promotor } = useAuth();
  const [rotas, setRotas] = useState<RotaPromotor[]>([]);
  const [selectedRota, setSelectedRota] = useState<RotaPromotor | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load campaign routes on mount
  useEffect(() => {
    async function loadRotas() {
      if (process.env.NEXT_PUBLIC_API_URL && promotor) {
        try {
          const { rotas: apiRotas } = await getCampanhaAtiva(promotor.ID_PROMOTOR);
          setRotas(apiRotas);
        } catch {
          // Fallback to mock if API fails
          setRotas(mockRotas);
        }
      } else {
        setRotas(mockRotas);
      }
      setInitialLoading(false);
    }
    loadRotas();
  }, [promotor]);

  const pendingRotas = useMemo(
    () =>
      rotas
        .filter((r) => r.status !== "FINALIZADO" && r.status !== "CANCELADO")
        .sort((a, b) => (a.oficina.distancia_km ?? 999) - (b.oficina.distancia_km ?? 999)),
    [rotas]
  );

  const completedCount = useMemo(
    () => rotas.filter((r) => r.status === "FINALIZADO").length,
    [rotas]
  );

  // -- Navigate: set status to "A CAMINHO" --
  const navigateAction = useCallback(
    async (rota: RotaPromotor) => {
      if (process.env.NEXT_PUBLIC_API_URL) {
        await updateRotaACaminho(rota.id_rota_promotor);
      }
      setRotas((prev) =>
        prev.map((r) =>
          r.id_rota_promotor === rota.id_rota_promotor
            ? { ...r, status: "A CAMINHO" as const }
            : r
        )
      );
      return rota;
    },
    []
  );

  const {
    feedbackState: navFeedback,
    execute: executeNavigate,
    retry: retryNavigate,
    reset: resetNavFeedback,
  } = useAsyncAction(navigateAction, { delay: 1000, errorChance: 0 });

  const handleNavigate = async (rota: RotaPromotor) => {
    const { ok } = await executeNavigate(rota);
    if (ok) {
      const destination = encodeURIComponent(rota.oficina.endereco);
      // Use LOCALIZACAO field if available for precise coordinates
      let mapsUrl: string;
      if (rota.oficina.localizacao) {
        const [lat, lng] = rota.oficina.localizacao.split(",");
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${destination}&travelmode=driving`;
      } else {
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      }
      setTimeout(() => {
        window.open(mapsUrl, "_blank");
      }, 1600);
    }
  };

  // -- Check-in: set status to "EM ANDAMENTO" + CHECKIN_TIME --
  const checkinAction = useCallback(
    async (rota: RotaPromotor) => {
      const checkinTime = new Date().toISOString();
      if (process.env.NEXT_PUBLIC_API_URL) {
        await updateRotaCheckin(rota.id_rota_promotor);
      }
      setRotas((prev) =>
        prev.map((r) =>
          r.id_rota_promotor === rota.id_rota_promotor
            ? { ...r, status: "EM ANDAMENTO" as const, checkin_time: checkinTime }
            : r
        )
      );
      return rota;
    },
    []
  );

  const {
    feedbackState: checkinFeedback,
    execute: executeCheckinAction,
    retry: retryCheckinAction,
    reset: resetCheckinFeedback,
  } = useAsyncAction(checkinAction, { delay: 1200, errorChance: 0 });

  const handleCheckin = async (rota: RotaPromotor) => {
    const { ok, result } = await executeCheckinAction(rota);
    if (ok && result) {
      setSelectedRota(result);
    }
  };

  const handleCheckinFeedbackClose = () => {
    const wasSuccess = checkinFeedback === "success";
    resetCheckinFeedback();
    if (wasSuccess && selectedRota) {
      setCheckinOpen(true);
    }
  };

  // -- Finalizar: set status to "FINALIZADO" + DONE_AT --
  const handleSubmitCheckin = async (
    rotaId: number,
    _results: CampanhaResult[],
    obs: string
  ) => {
    const doneAt = new Date().toISOString();
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        await updateRotaFinalizado(rotaId, obs || undefined);
      } catch {
        // Will still update locally for UX, backend can be retried
      }
    }
    setRotas((prev) =>
      prev.map((r) =>
        r.id_rota_promotor === rotaId
          ? { ...r, status: "FINALIZADO" as const, success: true, done_at: doneAt }
          : r
      )
    );
    setCheckinOpen(false);
    setSelectedRota(null);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando sua rota...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5">
        {/* Stats */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-card-foreground">
            Visitas realizadas
          </span>
          <span className="ml-auto text-lg font-bold text-card-foreground">
            {completedCount}
            <span className="text-muted-foreground">{"/"}</span>
            {rotas.length}
          </span>
        </div>

        {/* Route section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Sua rota de hoje
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              Ordenado por proximidade
            </Badge>
          </div>

          <RouteCarousel
            rotas={pendingRotas}
            onNavigate={handleNavigate}
            onCheckin={handleCheckin}
            isNavigating={navFeedback === "loading"}
            isCheckingIn={checkinFeedback === "loading"}
          />
        </div>

        {/* Completed section */}
        {completedCount > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Visitas concluidas
            </h2>
            <div className="flex flex-col gap-2">
              {rotas
                .filter((r) => r.status === "FINALIZADO")
                .map((rota) => (
                  <div
                    key={rota.id_rota_promotor}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-card-foreground">
                        {rota.oficina.nome}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {rota.done_at
                          ? `Finalizado as ${new Date(rota.done_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                          : "Concluido"}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="border-0 bg-success/10 text-[10px] text-success"
                    >
                      Concluida
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      <CheckinForm
        rota={selectedRota}
        perguntas={mockPerguntas}
        open={checkinOpen}
        onClose={() => {
          setCheckinOpen(false);
          setSelectedRota(null);
        }}
        onSubmit={handleSubmitCheckin}
      />

      {/* Navigate feedback */}
      <RequestFeedback
        state={navFeedback}
        loadingMessage="Atualizando status da rota..."
        successMessage="Rota atualizada! Abrindo o mapa..."
        errorMessage="Falha ao atualizar a rota. Tente novamente."
        onClose={resetNavFeedback}
        onRetry={retryNavigate}
        autoCloseDuration={1400}
      />

      {/* Check-in feedback */}
      <RequestFeedback
        state={checkinFeedback}
        loadingMessage="Registrando check-in..."
        successMessage="Check-in realizado! Responda as perguntas."
        errorMessage="Falha ao registrar check-in. Tente novamente."
        onClose={handleCheckinFeedbackClose}
        onRetry={retryCheckinAction}
        autoCloseDuration={1200}
      />
    </div>
  );
}
