"use client";

import { useMemo, useState } from "react";
import { Check, ListFilter, X } from "lucide-react";
import type { RotaPromotor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface RotaFiltros {
  cidades: string[];
  bairros: string[];
}

export const FILTROS_VAZIOS: RotaFiltros = { cidades: [], bairros: [] };

export function aplicarFiltros(rotas: RotaPromotor[], filtros: RotaFiltros) {
  return rotas.filter(
    (r) =>
      (filtros.cidades.length === 0 || filtros.cidades.includes(r.oficina.cidade)) &&
      (filtros.bairros.length === 0 || filtros.bairros.includes(r.oficina.bairro))
  );
}

const unicosOrdenados = (valores: (string | null | undefined)[]) =>
  Array.from(new Set(valores.filter((v): v is string => !!v?.trim()))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

function toggle(lista: string[], valor: string) {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

function OpcaoChip({
  label,
  selecionado,
  onClick,
}: {
  label: string;
  selecionado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors active:scale-[0.98] ${
        selecionado
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {selecionado && <Check className="h-4 w-4" />}
      {label}
    </button>
  );
}

interface RotaFilterProps {
  /** Rotas pendentes (sem filtro) usadas para montar as opções */
  rotas: RotaPromotor[];
  filtros: RotaFiltros;
  onChange: (filtros: RotaFiltros) => void;
  /** Quantidade de visitas exibidas com os filtros atuais */
  totalFiltrado: number;
}

export function RotaFilter({ rotas, filtros, onChange, totalFiltrado }: RotaFilterProps) {
  const [open, setOpen] = useState(false);
  const [rascunho, setRascunho] = useState<RotaFiltros>(filtros);

  const cidades = useMemo(() => unicosOrdenados(rotas.map((r) => r.oficina.cidade)), [rotas]);

  // Bairros disponíveis dependem das cidades marcadas no rascunho
  const bairros = useMemo(
    () =>
      unicosOrdenados(
        rotas
          .filter((r) => rascunho.cidades.length === 0 || rascunho.cidades.includes(r.oficina.cidade))
          .map((r) => r.oficina.bairro)
      ),
    [rotas, rascunho.cidades]
  );

  const totalRascunho = useMemo(() => aplicarFiltros(rotas, rascunho).length, [rotas, rascunho]);

  const totalAtivos = filtros.cidades.length + filtros.bairros.length;
  const rascunhoVazio = rascunho.cidades.length + rascunho.bairros.length === 0;

  if (cidades.length < 2 && bairros.length < 2 && totalAtivos === 0) return null;

  const abrir = () => {
    setRascunho(filtros);
    setOpen(true);
  };

  const alternarCidade = (cidade: string) => {
    const cidadesNovas = toggle(rascunho.cidades, cidade);
    const bairrosValidos = new Set(
      rotas
        .filter((r) => cidadesNovas.length === 0 || cidadesNovas.includes(r.oficina.cidade))
        .map((r) => r.oficina.bairro)
    );
    setRascunho({
      cidades: cidadesNovas,
      bairros: rascunho.bairros.filter((b) => bairrosValidos.has(b)),
    });
  };

  const aplicar = () => {
    onChange(rascunho);
    setOpen(false);
  };

  const removerChip = (tipo: keyof RotaFiltros, valor: string) =>
    onChange({ ...filtros, [tipo]: filtros[tipo].filter((v) => v !== valor) });

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={totalAtivos > 0 ? "default" : "outline"}
            onClick={abrir}
            className="h-11 flex-1 justify-center gap-2 md:flex-none"
          >
            <ListFilter className="h-4 w-4" />
            Filtrar por cidade e bairro
            {totalAtivos > 0 && (
              <span className="rounded-full bg-primary-foreground/20 px-2 text-xs font-bold">
                {totalAtivos}
              </span>
            )}
          </Button>
          {totalAtivos > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(FILTROS_VAZIOS)}
              className="h-11 shrink-0 px-3 text-muted-foreground"
            >
              Limpar
            </Button>
          )}
        </div>

        {totalAtivos > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {filtros.cidades.map((c) => (
              <button
                key={`c-${c}`}
                type="button"
                onClick={() => removerChip("cidades", c)}
                aria-label={`Remover filtro da cidade ${c}`}
                className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 text-xs font-medium text-primary"
              >
                {c}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            {filtros.bairros.map((b) => (
              <button
                key={`b-${b}`}
                type="button"
                onClick={() => removerChip("bairros", b)}
                aria-label={`Remover filtro do bairro ${b}`}
                className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground"
              >
                {b}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}

        {totalAtivos > 0 && (
          <p className="text-xs text-muted-foreground">
            Mostrando {totalFiltrado} de {rotas.length} visitas pendentes
          </p>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85dvh] flex-col gap-0 rounded-t-2xl p-0"
        >
          <SheetHeader className="px-4 pb-3 pt-5 text-left">
            <SheetTitle>Filtrar visitas</SheetTitle>
            <SheetDescription>Selecione uma ou mais opções.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Cidade</h3>
              <div className="flex flex-wrap gap-2">
                {cidades.map((c) => (
                  <OpcaoChip
                    key={c}
                    label={c}
                    selecionado={rascunho.cidades.includes(c)}
                    onClick={() => alternarCidade(c)}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Bairro</h3>
              <div className="flex flex-wrap gap-2">
                {bairros.map((b) => (
                  <OpcaoChip
                    key={b}
                    label={b}
                    selecionado={rascunho.bairros.includes(b)}
                    onClick={() => setRascunho({ ...rascunho, bairros: toggle(rascunho.bairros, b) })}
                  />
                ))}
              </div>
            </section>
          </div>

          <SheetFooter className="flex-row gap-2 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="outline"
              disabled={rascunhoVazio}
              onClick={() => setRascunho(FILTROS_VAZIOS)}
              className="h-12 flex-1"
            >
              Limpar filtro
            </Button>
            <Button type="button" onClick={aplicar} className="h-12 flex-[2]">
              Ver {totalRascunho} {totalRascunho === 1 ? "visita" : "visitas"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
