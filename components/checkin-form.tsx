"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { RotaPromotor, CampanhaPerguntas, CampanhaResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RequestFeedback } from "@/components/request-feedback";
import { useAsyncAction } from "@/hooks/use-async-action";
import { Loader2, Send, FileText, CheckCircle2 } from "lucide-react";
import { uploadImageToS3 } from "@/app/actions/s3.action";

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
  // Respostas agora podem ser string ou File (para imagens)
  const [answers, setAnswers] = useState<Record<string, string | File>>({});
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (open) {
      setAnswers({});
      setObs("");
    }
  }, [open, rota]);

  const submitAction = useCallback(
    async (rotaId: string, rawAnswers: Record<string, string | File>, obsText: string) => {
      const results: CampanhaResult[] = [];

      // Processa cada resposta, fazendo upload caso seja um arquivo de imagem
      for (const pergunta of perguntas) {
        const answer = rawAnswers[pergunta.id_perguntas];
        if (!answer) continue;

        let finalAnswer = "";

        if (pergunta.tipo === "Image" && answer instanceof File) {
          const formData = new FormData();
          formData.append("file", answer);
          formData.append("campanhaName", rota?.campanha.nome || "geral");
          
          try {
            const { url } = await uploadImageToS3(formData);
            finalAnswer = url; // Salva a URL do S3 como resposta
          } catch (error) {
            console.error("Falha ao subir imagem pro S3", error);
            throw new Error("Falha no upload da imagem");
          }
        } else {
          finalAnswer = answer as string;
        }

        results.push({
          id_rota: parseInt(rotaId, 10),
          id_pergunta: pergunta.id_perguntas,
          resposta: finalAnswer,
        });
      }

      await onSubmit(parseInt(rotaId, 10), results, obsText);
      return true;
    },
    [onSubmit, perguntas, rota]
  );

  const {
    feedbackState,
    execute: executeSubmit,
    retry: retrySubmit,
    reset: resetFeedback,
  } = useAsyncAction(submitAction, { delay: 100, errorChance: 0 });

  const handleChange = (questionId: string, value: string | File) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rota) return;
    await executeSubmit(rota.id_rota_promotor.toString(), answers, obs);
  };

  const handleFeedbackClose = () => {
    const wasSuccess = feedbackState === "success";
    resetFeedback();
    if (wasSuccess) {
      onClose();
    }
  };

  // Verifica se todas as perguntas foram respondidas
  const allAnswered = perguntas.every((p) => {
    const ans = answers[p.id_perguntas];
    if (!ans) return false;
    if (p.tipo === "Image") return ans instanceof File;
    return typeof ans === "string" && ans.trim() !== "";
  });

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
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {perguntas.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-card-foreground">Nenhuma pergunta configurada</p>
                <p className="text-xs text-muted-foreground">Esta campanha não possui questionário. Adicione observações se necessário.</p>
              </div>
            )}

            {perguntas.map((pergunta, index) => (
              <div key={pergunta.id_perguntas} className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-card-foreground">
                  {index + 1}. {pergunta.pergunta}
                </Label>

                {pergunta.tipo === "String" && (
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={(answers[pergunta.id_perguntas] as string) || ""}
                    onChange={(e) => handleChange(pergunta.id_perguntas, e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                )}

                {pergunta.tipo === "Integer" && (
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={(answers[pergunta.id_perguntas] as string) || ""}
                    onChange={(e) => handleChange(pergunta.id_perguntas, e.target.value)}
                    className="h-11 text-sm"
                  />
                )}

                {pergunta.tipo === "Date" && (
                  <Input
                    type="date"
                    value={(answers[pergunta.id_perguntas] as string) || ""}
                    onChange={(e) => handleChange(pergunta.id_perguntas, e.target.value)}
                    className="h-11 text-sm"
                  />
                )}

                {pergunta.tipo === "Image" && (
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment" // <-- Força a abertura da câmera (traseira)
                    onChange={(e) => handleChange(pergunta.id_perguntas, e.target.files?.[0] || "")}
                    className="pt-2.5 h-11 text-sm"
                  />
                )}

                {pergunta.tipo === "Boolean" && (
                  <RadioGroup
                    value={(answers[pergunta.id_perguntas] as string) || ""}
                    onValueChange={(val) => handleChange(pergunta.id_perguntas, val)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sim" id={`${pergunta.id_perguntas}-sim`} />
                      <Label htmlFor={`${pergunta.id_perguntas}-sim`} className="text-sm">Sim</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id={`${pergunta.id_perguntas}-nao`} />
                      <Label htmlFor={`${pergunta.id_perguntas}-nao`} className="text-sm">Não</Label>
                    </div>
                  </RadioGroup>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-card-foreground">Observações (opcional)</Label>
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
              disabled={feedbackState === "loading" || (!allAnswered && perguntas.length > 0)}
              className="h-12 w-full gap-2 text-sm font-semibold"
            >
              {feedbackState === "loading" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                <><Send className="h-4 w-4" /> Finalizar visita</>
              )}
            </Button>
          </form>
        )}
      </DialogContent>

      <RequestFeedback
        state={feedbackState}
        loadingMessage="Salvando dados e imagens..."
        successMessage="Visita e pesquisa finalizadas!"
        errorMessage="Falha ao enviar dados. Verifique sua conexão."
        onClose={handleFeedbackClose}
        onRetry={retrySubmit}
        autoCloseDuration={1500}
      />
    </Dialog>
  );
}