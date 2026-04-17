"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut, Route } from "lucide-react";

export function AppHeader() {
  const { promotor, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-sidebar-border bg-azul">
      <div className="mx-auto flex h-14 items-center justify-between px-4 md:h-16 md:px-8 lg:px-12 max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-verde/15 md:h-9 md:w-9">
            <Route className="h-4 w-4 text-verde md:h-5 md:w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white font-display md:text-base">
              OFBR Promotores
            </span>
            <span className="hidden text-[10px] text-white/50 md:block">
              Gestão de Visitas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
            <div className="hidden h-6 w-6 items-center justify-center rounded-full bg-verde/20 text-[10px] font-bold text-verde md:flex">
              {promotor?.NOME?.charAt(0)}
            </div>
            <span className="text-xs font-medium text-white/80 md:text-sm">
              {promotor?.NOME?.split(" ")[0]}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-white/60 hover:text-verde hover:bg-white/10 md:h-9 md:w-9"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
