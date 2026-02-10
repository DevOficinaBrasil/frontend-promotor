export type RouteStatus =
  | "BACKLOG"
  | "A_CAMINHO"
  | "EM_ANDAMENTO"
  | "FINALIZADO"
  | "CANCELADO";

export type QuestionType = "TEXTO" | "NUMERO" | "SIM_NAO" | "SELECAO";

export interface Promotor {
  id_promotor: string;
  nome: string;
  email: string;
  cpf: string;
}

export interface Campanha {
  id_campanha: string;
  nome: string;
  objetivo: string;
}

export interface Oficina {
  id_oficina: string;
  nome: string;
  endereco: string;
  telefone: string;
  lat: number;
  lng: number;
  distancia_km?: number;
}

export interface RotaPromotor {
  id_rota_promotor: string;
  id_oficina: string;
  id_campanha_promotor: string;
  status: RouteStatus;
  success: boolean | null;
  checkin_time: string | null;
  done_at: string | null;
  obs: string | null;
  oficina: Oficina;
  campanha: Campanha;
}

export interface CampanhaPerguntas {
  id_perguntas: string;
  id_campanha: string;
  pergunta: string;
  tipo: QuestionType;
}

export interface CampanhaResult {
  id_rota: string;
  id_pergunta: string;
  resposta: string;
}
