"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { RotaPromotor, CampanhaResult, CampanhaPerguntas } from "@/lib/types";
import { mockRotas, mockPerguntas } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { getCampanhaAtiva, getCampanhaDetalhes } from "@/service/campanha.service";
import { updateRotaACaminho, updateRotaCheckin, updateRotaFinalizado, updateRotaCancelado } from "@/service/rota.service";
import { AppHeader } from "@/components/app-header";
import { RouteCarousel } from "@/components/route-carousel";
import { CheckinForm } from "@/components/checkin-form";
import { RequestFeedback } from "@/components/request-feedback";
import { GpsSelectionDialog } from "@/components/gps-dialog"; // Novo componente
import { useAsyncAction } from "@/hooks/use-async-action";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardList, Loader2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function HomeScreen() {
  const { promotor } = useAuth();
  const [rotas, setRotas] = useState<RotaPromotor[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Estados para navegação (GPS)
  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [rotaParaNavegar, setRotaParaNavegar] = useState<RotaPromotor | null>(null);

  // Estados para Pesquisa/Checkin
  const [selectedRotaForSurvey, setSelectedRotaForSurvey] = useState<RotaPromotor | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<CampanhaPerguntas[]>([]);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Estados para Cancelamento
  const [rotaParaCancelar, setRotaParaCancelar] = useState<RotaPromotor | null>(null);

  // Load campaign routes on mount
  useEffect(() => {
    async function loadRotas() {
      if (process.env.NEXT_PUBLIC_API_URL && promotor) {
        try {
          const { rotas: apiRotas } = await getCampanhaAtiva(promotor.ID_PROMOTOR);
          setRotas(apiRotas);
        } catch {
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
    () => rotas.filter((r) => r.status === "FINALIZADO" || r.status === "CANCELADO").length,
    [rotas]
  );

  // -- 1. Navigate Logic --
  // Primeiro abre o modal de GPS, depois atualiza o status
  const handleOpenGpsSelection = (rota: RotaPromotor) => {
    setRotaParaNavegar(rota);
    setGpsModalOpen(true);
  };

  const navigateAction = useCallback(
    async (app: "google" | "waze") => {
      if (!rotaParaNavegar) return;
      
      const rota = rotaParaNavegar;

      // Update status on backend
      if (process.env.NEXT_PUBLIC_API_URL) {
        try {
          await updateRotaACaminho(rota.id_rota_promotor);
        } catch (e) {
          console.error("Failed to update status to A CAMINHO", e);
        }
      }

      // Update local state
      setRotas((prev) =>
        prev.map((r) =>
          r.id_rota_promotor === rota.id_rota_promotor
            ? { ...r, status: "A CAMINHO" as const }
            : r
        )
      );

      // Open Maps
      const destination = encodeURIComponent(rota.oficina.endereco);
      let mapsUrl: string;
      const localizacao = rota.oficina.localizacao; // Assuming "lat,lng"

      if (app === "waze") {
        // Waze URL scheme
        if (localizacao) {
           mapsUrl = `https://waze.com/ul?ll=${localizacao}&navigate=yes`;
        } else {
           mapsUrl = `https://waze.com/ul?q=${destination}&navigate=yes`;
        }
      } else {
        // Google Maps URL scheme
        if (localizacao) {
          mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${localizacao}&destination_place_id=${destination}&travelmode=driving`;
        } else {
          mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
        }
      }
      
      window.open(mapsUrl, "_blank");
      
      setGpsModalOpen(false);
      setRotaParaNavegar(null);
    },
    [rotaParaNavegar]
  );

  const {
    execute: executeNavigate, // We invoke this from the Dialog
  } = useAsyncAction(navigateAction, { delay: 500 }); // Pequeno delay só pra UX do clique


  // -- 2. Check-in Logic --
  // Apenas roda o update, não abre modal
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
  } = useAsyncAction(checkinAction, { delay: 1000, errorChance: 0 });

  const handleCheckin = async (rota: RotaPromotor) => {
    await executeCheckinAction(rota);
    // Não faz mais nada, o feedback cuida do resto e o botão muda para "Responder Pesquisa"
  };


  // -- 3. Responder Pesquisa Logic --
  // Busca perguntas -> Abre modal
  const surveyAction = useCallback(
    async (rota: RotaPromotor) => {
      let perguntas: CampanhaPerguntas[] = [];
      
      if (process.env.NEXT_PUBLIC_API_URL) {
        perguntas = await getCampanhaDetalhes(rota.id_campanha_promotor);
      } else {
        // Fallback mock
        perguntas = mockPerguntas;
      }
      
      setSurveyQuestions(perguntas);
      return perguntas;
    },
    []
  );

  const {
    feedbackState: surveyLoadingState,
    execute: executeSurveyLoad,
    reset: resetSurveyFeedback
  } = useAsyncAction(surveyAction, { delay: 800 });

  const handleResponderPesquisa = async (rota: RotaPromotor) => {
    setSelectedRotaForSurvey(rota);
    // Limpa perguntas anteriores para mostrar loading
    setSurveyQuestions([]); 
    setIsSurveyModalOpen(true);
    
    await executeSurveyLoad(rota);
  };


  // -- 4. Finalizar Visita (Submit do Modal) --
  const handleSubmitSurvey = async (
    rotaId: number,
    _results: CampanhaResult[],
    obs: string
  ) => {
    const doneAt = new Date().toISOString();
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        await updateRotaFinalizado(rotaId, obs || undefined);
      } catch (error) {
        console.error("Erro ao finalizar rota", error);
        throw error; // Propaga para o useAsyncAction pegar o erro
      }
    }
    
    // Atualiza estado local
    setRotas((prev) =>
      prev.map((r) =>
        r.id_rota_promotor === rotaId
          ? { ...r, status: "FINALIZADO" as const, success: true, done_at: doneAt }
          : r
      )
    );
    
    // Fecha modal
    setIsSurveyModalOpen(false);
    setSelectedRotaForSurvey(null);
  };


  // -- 5. Cancelar Visita --
  const cancelAction = useCallback(async () => {
    if (!rotaParaCancelar) return;
    
    if (process.env.NEXT_PUBLIC_API_URL) {
      await updateRotaCancelado(rotaParaCancelar.id_rota_promotor);
    }

    setRotas((prev) =>
      prev.map((r) =>
        r.id_rota_promotor === rotaParaCancelar.id_rota_promotor
          ? { ...r, status: "CANCELADO" as const, done_at: new Date().toISOString() }
          : r
      )
    );
    setRotaParaCancelar(null);
  }, [rotaParaCancelar]);

  const {
    feedbackState: cancelFeedback,
    execute: executeCancel,
    reset: resetCancelFeedback
  } = useAsyncAction(cancelAction, { delay: 1000 });


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
            onNavigate={handleOpenGpsSelection}
            onCheckin={handleCheckin}
            onSurvey={handleResponderPesquisa}
            onCancel={(r) => setRotaParaCancelar(r)}
            isNavigating={false} // Loading agora é no modal de GPS
            isCheckingIn={checkinFeedback === "loading"}
            isCheckingInSurvey={surveyLoadingState === "loading" && isSurveyModalOpen}
          />
        </div>

        {/* Completed section */}
        {completedCount > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Histórico do dia
            </h2>
            <div className="flex flex-col gap-2">
              {rotas
                .filter((r) => r.status === "FINALIZADO" || r.status === "CANCELADO")
                .map((rota) => (
                  <div
                    key={rota.id_rota_promotor}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    {rota.status === "FINALIZADO" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-card-foreground">
                        {rota.oficina.nome}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {rota.done_at
                          ? `${rota.status === 'FINALIZADO' ? 'Finalizado' : 'Cancelado'} às ${new Date(rota.done_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                          : "Concluído"}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`border-0 text-[10px] ${rota.status === 'FINALIZADO' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
                    >
                      {rota.status === 'FINALIZADO' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal de GPS */}
      <GpsSelectionDialog 
        open={gpsModalOpen}
        onSelect={(app) => executeNavigate(app)}
        onCancel={() => {
          setGpsModalOpen(false);
          setRotaParaNavegar(null);
        }}
      />

      {/* Modal de Pesquisa */}
      <CheckinForm
        rota={selectedRotaForSurvey}
        perguntas={surveyQuestions}
        open={isSurveyModalOpen}
        onClose={() => {
          setIsSurveyModalOpen(false);
          setSelectedRotaForSurvey(null);
          resetSurveyFeedback();
        }}
        onSubmit={handleSubmitSurvey}
        isLoadingQuestions={surveyLoadingState === "loading"}
      />

      {/* Feedback do Check-in (Apenas visual, sem bloquear fluxo) */}
      <RequestFeedback
        state={checkinFeedback}
        loadingMessage="Registrando check-in..."
        successMessage="Check-in realizado com sucesso!"
        errorMessage="Falha ao registrar check-in."
        onClose={resetCheckinFeedback}
        onRetry={retryCheckinAction}
        autoCloseDuration={1200}
      />

      {/* Dialog de Confirmação de Cancelamento */}
      <AlertDialog open={!!rotaParaCancelar} onOpenChange={(open) => !open && setRotaParaCancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar visita?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja cancelar a visita na oficina <strong>{rotaParaCancelar?.oficina.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); 
                executeCancel(); 
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelFeedback === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : "Sim, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Feedback do Cancelamento (apenas erro/sucesso) */}
      <RequestFeedback
        state={cancelFeedback === "loading" ? "idle" : cancelFeedback} // Loading é tratado no botão do Alert
        successMessage="Visita cancelada."
        errorMessage="Erro ao cancelar."
        onClose={resetCancelFeedback}
        autoCloseDuration={1500}
      />
    </div>
  );
}