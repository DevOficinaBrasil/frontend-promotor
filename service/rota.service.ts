import { api } from "./api";
import type { RotaUpdatePayload } from "@/lib/types";

/**
 * PUT /rota/{ID_ROTA_PROMOTOR}/options
 * Updates a route's status and related fields.
 */
export async function updateRota(
  idRota: number,
  payload: RotaUpdatePayload,
): Promise<void> {
  await api(`rota/${idRota}/options`, {
    method: "PUT",
    body: payload,
  });
}

/**
 * Helper: mark route as "A CAMINHO"
 */
export function updateRotaACaminho(idRota: number,) {
  return updateRota(
    idRota,
    { STATUS: "A CAMINHO" },
  );
}

/**
 * Helper: mark route as "EM ANDAMENTO" with checkin time
 */
export function updateRotaCheckin(idRota: number,) {
  return updateRota(
    idRota,
    {
      STATUS: "EM ANDAMENTO",
      CHECKIN_TIME: new Date().toISOString(),
    },
  );
}

/**
 * Helper: mark route as "FINALIZADO" with done time
 */
export function updateRotaFinalizado(
  idRota: number,
  obs?: string,
  redirect?: "SAC" | "VENDAS" | "LOGISTICA"
) {
  return updateRota(
    idRota,
    {
      STATUS: "FINALIZADO",
      SUCCESS: true,
      DONE_AT: new Date().toISOString(),
      ...(obs ? { OBS: obs } : {}),
      ...(redirect ? { REDIRECT: redirect } : {}),
    },
  );
}
