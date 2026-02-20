"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { RotaPromotor, CampanhaResult, CampanhaPerguntas } from "@/lib/types";
import { mockRotas, mockPerguntas } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { getCampanhaAtiva, getCampanhaDetalhes, saveCampanhaResult } from "@/service/campanha.service";
import { updateRotaACaminho, updateRotaCheckin, updateRotaFinalizado, updateRotaCancelado } from "@/service/rota.service";
import { AppHeader } from "@/components/app-header";
import { RouteCarousel } from "@/components/route-carousel";
import { CheckinForm } from "@/components/checkin-form";
import { RequestFeedback } from "@/components/request-feedback";
import { GpsSelectionDialog } from "@/components/gps-dialog";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ClipboardList, Loader2, XCircle, RefreshCw } from "lucide-react"; // RefreshCw adicionado
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function HomeScreen() {
  const { promotor } = useAuth();
  const [rotas, setRotas] = useState<RotaPromotor[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [rotaParaNavegar, setRotaParaNavegar] = useState<RotaPromotor | null>(null);

  const [selectedRotaForSurvey, setSelectedRotaForSurvey] = useState<RotaPromotor | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<CampanhaPerguntas[]>([]);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const [rotaParaCancelar, setRotaParaCancelar] = useState<RotaPromotor | null>(null);
  const [obsCancelamento, setObsCancelamento] = useState("");

  const loadRotas = useCallback(async () => {
    setIsRefreshing(true);
    if (process.env.NEXT_PUBLIC_API_URL && promotor) {
      try {
        const { rotas: apiRotas } = await getCampanhaAtiva(promotor.ID_PROMOTOR);
        setRotas(apiRotas);
      } catch {
        setRotas([]);
      }
    } else {
      setRotas([]);
    }
    setInitialLoading(false);
    setIsRefreshing(false);
  }, [promotor]);

  useEffect(() => {
    loadRotas();
  }, [loadRotas]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY.current > 0) {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchEndY - touchStartY.current > 100 && !isRefreshing) {
        await loadRotas();
      }
    }
    touchStartY.current = 0;
  };

  const pendingRotas = useMemo(
    () => rotas.filter((r) => r.status !== "FINALIZADO" && r.status !== "CANCELADO").sort((a, b) => (a.oficina.distancia_km ?? 999) - (b.oficina.distancia_km ?? 999)),
    [rotas]
  );

  const completedCount = useMemo(
    () => rotas.filter((r) => r.status === "FINALIZADO" || r.status === "CANCELADO").length,
    [rotas]
  );

  const handleOpenGpsSelection = (rota: RotaPromotor) => {
    setRotaParaNavegar(rota);
    setGpsModalOpen(true);
  };

  const navigateAction = useCallback(async (app: "google" | "waze") => {
    if (!rotaParaNavegar) return;
    const rota = rotaParaNavegar;

    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        await updateRotaACaminho(rota.id_rota_promotor);
      } catch (e) {
        console.error("Failed to update status", e);
      }
    }

    setRotas((prev) =>
      prev.map((r) => r.id_rota_promotor === rota.id_rota_promotor ? { ...r, status: "A CAMINHO" as const } : r)
    );

    const destination = encodeURIComponent(rota.oficina.endereco);
    let mapsUrl: string;
    const localizacao = rota.oficina.localizacao;

    if (app === "waze") {
      mapsUrl = localizacao ? `https://waze.com/ul?ll=${localizacao}&navigate=yes` : `https://waze.com/ul?q=${destination}&navigate=yes`;
    } else {
      mapsUrl = localizacao ? `https://www.google.com/maps/dir/?api=1&destination=${localizacao}&destination_place_id=${destination}&travelmode=driving` : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    }
    
    window.open(mapsUrl, "_blank");
    setGpsModalOpen(false);
    setRotaParaNavegar(null);
  }, [rotaParaNavegar]);

  const { execute: executeNavigate } = useAsyncAction(navigateAction, { delay: 500 });

  const checkinAction = useCallback(async (rota: RotaPromotor) => {
    const checkinTime = new Date().toISOString();
    if (process.env.NEXT_PUBLIC_API_URL) {
      await updateRotaCheckin(rota.id_rota_promotor);
    }
    setRotas((prev) =>
      prev.map((r) => r.id_rota_promotor === rota.id_rota_promotor ? { ...r, status: "EM ANDAMENTO" as const, checkin_time: checkinTime } : r)
    );
    return rota;
  }, []);

  const { feedbackState: checkinFeedback, execute: executeCheckinAction, retry: retryCheckinAction, reset: resetCheckinFeedback } = useAsyncAction(checkinAction, { delay: 1000, errorChance: 0 });

  const handleCheckin = async (rota: RotaPromotor) => {
    await executeCheckinAction(rota);
  };

  const surveyAction = useCallback(async (rota: RotaPromotor) => {
    let perguntas: CampanhaPerguntas[] = [];
    if (process.env.NEXT_PUBLIC_API_URL) {
      perguntas = await getCampanhaDetalhes(rota.campanha.id_campanha);
    } else {
      perguntas = mockPerguntas;
    }
    setSurveyQuestions(perguntas);
    return perguntas;
  }, []);

  const { feedbackState: surveyLoadingState, execute: executeSurveyLoad, reset: resetSurveyFeedback } = useAsyncAction(surveyAction, { delay: 800 });

  const handleResponderPesquisa = async (rota: RotaPromotor) => {
    setSelectedRotaForSurvey(rota);
    setSurveyQuestions([]); 
    setIsSurveyModalOpen(true);
    await executeSurveyLoad(rota);
  };

  const handleSubmitSurvey = async (rotaId: number, results: CampanhaResult[], obs: string) => {
    const doneAt = new Date().toISOString();
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        await Promise.all(results.map(r => saveCampanhaResult({
            ID_ROTA: r.id_rota,
            ID_PERGUNTA: Number(r.id_pergunta),
            RESPOSTA: r.resposta
        })));
        await updateRotaFinalizado(rotaId, obs || undefined);
      } catch (error) {
        console.error("Erro ao finalizar rota", error);
        throw error;
      }
    }
    
    setRotas((prev) =>
      prev.map((r) => r.id_rota_promotor === rotaId ? { ...r, status: "FINALIZADO" as const, success: true, done_at: doneAt } : r)
    );
    setIsSurveyModalOpen(false);
    setSelectedRotaForSurvey(null);
  };

  const cancelAction = useCallback(async () => {
    if (!rotaParaCancelar) return;
    if (process.env.NEXT_PUBLIC_API_URL) {
      await updateRotaCancelado(rotaParaCancelar.id_rota_promotor, obsCancelamento);
    }

    setRotas((prev) =>
      prev.map((r) => r.id_rota_promotor === rotaParaCancelar.id_rota_promotor ? { ...r, status: "CANCELADO" as const, done_at: new Date().toISOString() } : r)
    );
    setRotaParaCancelar(null);
    setObsCancelamento("");
  }, [rotaParaCancelar, obsCancelamento]);

  const { feedbackState: cancelFeedback, execute: executeCancel, reset: resetCancelFeedback } = useAsyncAction(cancelAction, { delay: 1000 });

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
    <div 
      className="flex min-h-dvh flex-col bg-background relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AppHeader />

      {/* Indicador de Swipe Refresh Animado no Topo */}
      <div 
        className={`absolute top-14 left-0 z-10 w-full flex items-center justify-center transition-all duration-300 ${
          isRefreshing ? "translate-y-2 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-background/90 backdrop-blur border shadow-sm rounded-full p-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-card-foreground">Visitas realizadas</span>
          <span className="ml-auto text-lg font-bold text-card-foreground">
            {completedCount} <span className="text-muted-foreground">/</span> {rotas.length}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Sua rota de hoje</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">Ordenado por proximidade</Badge>
              {/* Botão para atualizar manualmente caso o Pull-to-refresh falhe */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={loadRotas} 
                disabled={isRefreshing}
                className="h-7 w-7 text-muted-foreground hover:bg-muted"
                aria-label="Atualizar rotas"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <RouteCarousel
            rotas={pendingRotas}
            onNavigate={handleOpenGpsSelection}
            onCheckin={handleCheckin}
            onSurvey={handleResponderPesquisa}
            onCancel={(r) => setRotaParaCancelar(r)}
            isNavigating={false}
            isCheckingIn={checkinFeedback === "loading"}
            isCheckingInSurvey={surveyLoadingState === "loading" && isSurveyModalOpen}
          />
        </div>

        {completedCount > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">Histórico do dia</h2>
            <div className="flex flex-col gap-2">
              {rotas.filter((r) => r.status === "FINALIZADO" || r.status === "CANCELADO").map((rota) => (
                  <div key={rota.id_rota_promotor} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                    {rota.status === "FINALIZADO" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-card-foreground">{rota.oficina.nome}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {rota.done_at ? `${rota.status === 'FINALIZADO' ? 'Finalizado' : 'Cancelado'} às ${new Date(rota.done_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Concluído"}
                      </span>
                    </div>
                    <Badge variant="secondary" className={`border-0 text-[10px] ${rota.status === 'FINALIZADO' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {rota.status === 'FINALIZADO' ? 'Concluída' : 'Cancelada'}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      <GpsSelectionDialog 
        open={gpsModalOpen}
        onSelect={(app) => executeNavigate(app)}
        onCancel={() => { setGpsModalOpen(false); setRotaParaNavegar(null); }}
      />

      <CheckinForm
        rota={selectedRotaForSurvey}
        perguntas={surveyQuestions}
        open={isSurveyModalOpen}
        onClose={() => { setIsSurveyModalOpen(false); setSelectedRotaForSurvey(null); resetSurveyFeedback(); }}
        onSubmit={handleSubmitSurvey}
        isLoadingQuestions={surveyLoadingState === "loading"}
      />

      <RequestFeedback
        state={checkinFeedback}
        loadingMessage="Registrando check-in..."
        successMessage="Check-in realizado com sucesso!"
        errorMessage="Falha ao registrar check-in."
        onClose={resetCheckinFeedback}
        onRetry={retryCheckinAction}
        autoCloseDuration={1200}
      />

      <Dialog open={!!rotaParaCancelar} onOpenChange={(open) => { if(!open) { setRotaParaCancelar(null); setObsCancelamento(""); }}}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancelar visita</DialogTitle>
            <DialogDescription>
              Por que você está cancelando a visita na oficina <strong>{rotaParaCancelar?.oficina.nome}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Label>Observação (Obrigatório)</Label>
            <Textarea 
              placeholder="Motivo do cancelamento..."
              value={obsCancelamento}
              onChange={(e) => setObsCancelamento(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="ghost" onClick={() => { setRotaParaCancelar(null); setObsCancelamento(""); }}>Voltar</Button>
            <Button 
              onClick={(e) => { e.preventDefault(); executeCancel(); }}
              disabled={!obsCancelamento.trim() || cancelFeedback === "loading"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelFeedback === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizar Visita (Cancelar)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <RequestFeedback
        state={cancelFeedback === "loading" ? "idle" : cancelFeedback}
        successMessage="Visita cancelada e finalizada."
        errorMessage="Erro ao cancelar."
        onClose={resetCancelFeedback}
        autoCloseDuration={1500}
      />
    </div>
  );
}