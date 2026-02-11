"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface GpsSelectionDialogProps {
  open: boolean;
  onSelect: (app: "google" | "waze") => void;
  onCancel: () => void;
}

export function GpsSelectionDialog({
  open,
  onSelect,
  onCancel,
}: GpsSelectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-xs rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Escolha o GPS
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Selecione qual aplicativo deseja usar para navegar até a oficina.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 border-primary/20 hover:bg-primary/5"
            onClick={() => onSelect("google")}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Google Maps
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 border-primary/20 hover:bg-primary/5"
            onClick={() => onSelect("waze")}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.6 12.6c-1.3 0-2.4.9-2.8 2.1H8.3c-.4-1.2-1.5-2.1-2.8-2.1-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-.9 2.8-2.1h7.4c.4 1.2 1.5 2.1 2.8 2.1 1.7 0 3-1.3 3-3s-1.3-3-2.9-3zm-13.1 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm13.1 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
              <path d="M22 10.1c-.2-.6-.9-1-1.6-1-1.3 0-2.4.8-2.8 2h-1c-1.4-3.5-4.5-6-8.2-6H5.9C4.5 5.1 3.2 6 2.6 7.3c-.5 1.1-.2 2.4.6 3.2.5.5 1.2.7 1.9.7.4 0 .9-.1 1.3-.3.7-.4 1.1-1.2 1.1-2 .6-.6 1.4-1 2.3-1h2.5c2.6 0 4.8 1.7 5.7 4.1h2c-.4-1.2-1.5-2-2.8-2-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-.9 2.8-2.1h.7c.9 0 1.7-.6 1.9-1.5.3-.9 0-1.9-.6-2.3z" />
            </svg>
            Waze
          </Button>

          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}