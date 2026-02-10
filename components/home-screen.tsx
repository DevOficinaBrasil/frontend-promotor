"use client";

import { useState, useMemo } from "react";
import type { RotaPromotor, CampanhaResult } from "@/lib/types";
import { mockRotas, mockPerguntas } from "@/lib/mock-data";
import { AppHeader } from "@/components/app-header";
import { RouteCarousel } from "@/components/route-carousel";
import { CheckinForm } from "@/components/checkin-form";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle2, MapPin } from "lucide-react";

export function HomeScreen() {
  const [rotas, setRotas] = useState<RotaPromotor[]>(mockRotas);
  const [selectedRota, setSelectedRota] = useState<RotaPromotor | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);

  const pendingRotas = useMemo(
    () =>
      rotas
        .filter(
          (r) =>
            r.status !== "FINALIZADO" && r.status !== "CANCELADO"
        )
        .sort(
          (a, b) =>
            (a.oficina.distancia_km ?? 999) - (b.oficina.distancia_km ?? 999)
        ),
    [rotas]
  );

  const completedCount = useMemo(
    () => rotas.filter((r) => r.status === "FINALIZADO").length,
    [rotas]
  );

  const handleNavigate = (rota: RotaPromotor) => {
    // Update status to A_CAMINHO
    setRotas((prev) =>
      prev.map((r) =>
        r.id_rota_promotor === rota.id_rota_promotor
          ? { ...r, status: "A_CAMINHO" as const }
          : r
      )
    );

    // Open Google Maps with the destination
    const { lat, lng } = rota.oficina;
    const destination = encodeURIComponent(rota.oficina.endereco);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${destination}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  const handleCheckin = (rota: RotaPromotor) => {
    // Update status to EM_ANDAMENTO
    setRotas((prev) =>
      prev.map((r) =>
        r.id_rota_promotor === rota.id_rota_promotor
          ? {
              ...r,
              status: "EM_ANDAMENTO" as const,
              checkin_time: new Date().toISOString(),
            }
          : r
      )
    );
    setSelectedRota(rota);
  };

  const handleSubmitCheckin = (
    rotaId: string,
    _results: CampanhaResult[],
    _obs: string
  ) => {
    // In production, send results to your backend API
    // POST /api/campanha-results with { rotaId, results, obs }
    setRotas((prev) =>
      prev.map((r) =>
        r.id_rota_promotor === rotaId
          ? {
              ...r,
              status: "FINALIZADO" as const,
              success: true,
              done_at: new Date().toISOString(),
            }
          : r
      )
    );
    setCheckinOpen(false);
    setSelectedRota(null);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-5">
        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-card-foreground">
                {pendingRotas.length}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Pendentes
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-card-foreground">
                {completedCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Concluidas
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <MapPin className="h-5 w-5 text-warning" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-card-foreground">
                {rotas.length}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Total
              </span>
            </div>
          </div>
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
    </div>
  );
}
