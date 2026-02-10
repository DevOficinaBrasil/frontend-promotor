"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut } from "lucide-react";

export function AppHeader() {
  const { promotor, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-sidebar">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-azul">
            <MapPin className="h-4 w-4 text-verde" />
          </div>
          <span className="text-base font-bold text-card-foreground">
            OFBR Promoters
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {promotor?.NOME?.split(" ")[0]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
