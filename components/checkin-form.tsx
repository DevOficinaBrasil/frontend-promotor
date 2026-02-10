"use client";

import React from "react";

import { useState, useCallback } from "react";
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
import { Loader2, Send, MapPin } from "lucide-react";

interface CheckinFormProps {
  rota: RotaPromotor | null;
  perguntas: CampanhaPerguntas[];
  open: boolean;
  onClose: () => void;
  onSubmit: (rotaId: number, results: CampanhaResult[], obs: string) => void;
}

export function CheckinForm({
  rota,
  perguntas,
  open,
  onClose,
  onSubmit,
}: CheckinFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [obs, setObs] = useState("");

  const submitAction = useCallback(
    async (rotaId: string, results: CampanhaResult[], obsText: string) => {
      onSubmit(parseInt(rotaId, 10), results, obsText);
      return true;
    },
    [onSubmit]
  );

  const {
    feedbackState,
    execute: executeSubmit,
    retry: retrySubmit,
    reset: resetFeedback,
  } = useAsyncAction(submitAction, { delay: 2000, errorChance: 0.1 });

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

    const { ok } = await executeSubmit(rota.id_rota_promotor.toString(), results, obs);
    if (ok) {
      setAnswers({});
      setObs("");
    }
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
            <MapPin className="h-4 w-4 text-primary" />
            Check-in
          </DialogTitle>
          <DialogDescription className="text-xs">
            {rota?.oficina.nome} - {rota?.campanha.nome}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {perguntas.map((pergunta, index) => (
            <div key={pergunta.id_perguntas} className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-card-foreground">
                {index + 1}. {pergunta.pergunta}
              </Label>

              {pergunta.tipo === "TEXTO" && (
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={answers[pergunta.id_perguntas] || ""}
                  onChange={(e) =>
                    handleChange(pergunta.id_perguntas, e.target.value)
                  }
                  className="min-h-[80px] text-sm"
                />
              )}

              {pergunta.tipo === "NUMERO" && (
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

              {pergunta.tipo === "SIM_NAO" && (
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
                      Nao
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-card-foreground">
              Observacoes (opcional)
            </Label>
            <Textarea
              placeholder="Alguma observacao adicional..."
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
      </DialogContent>

      <RequestFeedback
        state={feedbackState}
        loadingMessage="Enviando respostas da visita..."
        successMessage="Visita finalizada com sucesso!"
        errorMessage="Falha ao enviar dados. Verifique sua conexao."
        onClose={handleFeedbackClose}
        onRetry={retrySubmit}
        autoCloseDuration={1500}
      />
    </Dialog>
  );
}
