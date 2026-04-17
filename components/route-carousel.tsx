"use client";

import { useState, useCallback } from "react";
import type { RotaPromotor } from "@/lib/types";
import { OficinaCard } from "@/components/oficina-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface RouteCarouselProps {
  rotas: RotaPromotor[];
  onNavigate: (rota: RotaPromotor) => void;
  onCheckin: (rota: RotaPromotor) => void;
  onSurvey: (rota: RotaPromotor) => void;
  onCancel: (rota: RotaPromotor) => void;
  isNavigating?: boolean;
  isCheckingIn?: boolean;
  isCheckingInSurvey?: boolean;
}

export function RouteCarousel({
  rotas,
  onNavigate,
  onCheckin,
  onSurvey,
  onCancel,
  isNavigating,
  isCheckingIn,
  isCheckingInSurvey,
}: RouteCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  const handleSetApi = useCallback(
    (carouselApi: CarouselApi) => {
      setApi(carouselApi);
      if (carouselApi) {
        carouselApi.on("select", onSelect);
      }
    },
    [onSelect]
  );

  const temRotaAtiva = rotas.some(
    (r) => r.status === "A CAMINHO" || r.status === "EM ANDAMENTO"
  );

  if (rotas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-6 py-16 md:py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/8">
          <svg
            className="h-7 w-7 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-foreground">
            Sem visitas no momento!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Você não tem visitas agendadas.
          </p>
        </div>
      </div>
    );
  }

  const cardProps = (rota: RotaPromotor) => ({
    rota,
    onNavigate,
    onCheckin,
    onSurvey,
    onCancel,
    isNavigating,
    isCheckingIn,
    isLoadingSurvey: isCheckingInSurvey,
    isAnyRouteActive: temRotaAtiva,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: carousel */}
      <div className="md:hidden">
        <Carousel
          setApi={handleSetApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {rotas.map((rota) => (
              <CarouselItem key={rota.id_rota_promotor} className="pl-3 basis-[88%] xs:basis-[80%]">
                <OficinaCard {...cardProps(rota)} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {rotas.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {rotas.map((_, index) => (
              <button
                key={rotas[index].id_rota_promotor}
                type="button"
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === current
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-border hover:bg-muted-foreground/30"
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Ir para oficina ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tablet/Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rotas.map((rota) => (
          <OficinaCard key={rota.id_rota_promotor} {...cardProps(rota)} />
        ))}
      </div>
    </div>
  );
}