"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { RotaPromotor, CampanhaPerguntas, CampanhaResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RequestFeedback } from "@/components/request-feedback";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Loader2, Send, FileText, CheckCircle2 } from "lucide-react";

interface CheckinFormProps {
  rota: RotaPromotor | null;
  perguntas: CampanhaPerguntas[];
  open: boolean;
  onClose: () => void;
  onSubmit: (rotaId: number, results: CampanhaResult[], obs: string) => void;
  isLoadingQuestions?: boolean;
}

export function CheckinForm({
  rota,
  perguntas,
  open,
  onClose,
  onSubmit,
  isLoadingQuestions = false,
}: CheckinFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [obs, setObs] = useState("");

  // Limpa o form quando abre com nova rota
  useEffect(() => {
    if (open) {
      setAnswers({});
      setObs("");
    }
  }, [open, rota]);

  const submitAction = useCallback(
    async (rotaId: string, results: CampanhaResult[], obsText: string) => {
      await onSubmit(parseInt(rotaId, 10), results, obsText);
      return true;
    },
    [onSubmit]
  );

  const {
    feedbackState,
    execute: executeSubmit,
    retry: retrySubmit,
    reset: resetFeedback,
  } = useAsyncAction(submitAction, { delay: 1500, errorChance: 0.1 });

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rota) return;

    const results: CampanhaResult[] = perguntas.map((p) => ({
      id_rota: rota.id_rota_promotor,
      id_pergunta: p.id_perguntas,
      resposta: answers[p.id_perguntas] || "",
    }));

    // Se não houver perguntas, results será vazio, o que é esperado
    await executeSubmit(rota.id_rota_promotor.toString(), results, obs);
  };

  const handleFeedbackClose = () => {
    const wasSuccess = feedbackState === "success";
    resetFeedback();
    if (wasSuccess) {
      onClose();
    }
  };

  const allAnswered = perguntas.every(
    (p) => answers[p.id_perguntas] && answers[p.id_perguntas].trim() !== ""
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-sm overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Pesquisa de Visita
          </DialogTitle>
          <DialogDescription className="text-xs">
            {rota?.oficina.nome} - {rota?.campanha.nome}
          </DialogDescription>
        </DialogHeader>

        {isLoadingQuestions ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando perguntas...</p>
          </div>
        ) : perguntas.length === 0 ? (
          <div className="flex flex-col gap-6 py-2">
            <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-card-foreground">
                Nenhuma pergunta configurada
              </p>
              <p className="text-xs text-muted-foreground">
                Esta campanha não possui questionário. Você pode adicionar uma observação opcional abaixo e finalizar.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-card-foreground">
                  Observações (opcional)
                </Label>
                <Textarea
                  placeholder="Alguma observação sobre a visita..."
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={feedbackState === "loading"}
                className="h-12 w-full gap-2 text-sm font-semibold"
              >
                {feedbackState === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Finalizar Pesquisa
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {perguntas.map((pergunta, index) => (
              <div key={pergunta.id_perguntas} className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-card-foreground">
                  {index + 1}. {pergunta.pergunta}
                </Label>

                {pergunta.tipo === "String" && (
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={answers[pergunta.id_perguntas] || ""}
                    onChange={(e) =>
                      handleChange(pergunta.id_perguntas, e.target.value)
                    }
                    className="min-h-[80px] text-sm"
                  />
                )}

                {pergunta.tipo === "Integer" && (
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={answers[pergunta.id_perguntas] || ""}
                    onChange={(e) =>
                      handleChange(pergunta.id_perguntas, e.target.value)
                    }
                    className="h-11 text-sm"
                  />
                )}

                {pergunta.tipo === "Boolean" && (
                  <RadioGroup
                    value={answers[pergunta.id_perguntas] || ""}
                    onValueChange={(val) =>
                      handleChange(pergunta.id_perguntas, val)
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sim" id={`${pergunta.id_perguntas}-sim`} />
                      <Label
                        htmlFor={`${pergunta.id_perguntas}-sim`}
                        className="text-sm text-card-foreground"
                      >
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id={`${pergunta.id_perguntas}-nao`} />
                      <Label
                        htmlFor={`${pergunta.id_perguntas}-nao`}
                        className="text-sm text-card-foreground"
                      >
                        Não
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-card-foreground">
                Observações (opcional)
              </Label>
              <Textarea
                placeholder="Alguma observação adicional..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={feedbackState === "loading" || !allAnswered}
              className="h-12 w-full gap-2 text-sm font-semibold"
            >
              {feedbackState === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Finalizar visita
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>

      <RequestFeedback
        state={feedbackState}
        loadingMessage="Finalizando visita..."
        successMessage="Visita e pesquisa finalizadas!"
        errorMessage="Falha ao enviar dados. Verifique sua conexão."
        onClose={handleFeedbackClose}
        onRetry={retrySubmit}
        autoCloseDuration={1500}
      />
    </Dialog>
  );
}