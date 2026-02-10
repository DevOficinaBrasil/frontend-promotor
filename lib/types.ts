export type RouteStatus =
  | "BACKLOG"
  | "A CAMINHO"
  | "EM ANDAMENTO"
  | "FINALIZADO"
  | "CANCELADO";

export type RedirectType = "SAC" | "VENDAS" | "LOGISTICA";

export type QuestionType = "TEXTO" | "NUMERO" | "SIM_NAO" | "SELECAO";

// --- API response types (casing matches backend) ---

export interface Promotor {
  ID_PROMOTOR: number;
  NOME: string;
  EMAIL: string;
  CPF: string;
  ID_CLIENT: number;
  CREATED_BY: number;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface OficinaAPI {
  ID_OFICINA: number;
  NOME_FANTASIA: string;
  RAZAO_SOCIAL: string;
  CNPJ: string;
  EMAIL: string;
  TELEFONE: string;
  ENDERECO: string;
  NUMERO: string;
  BAIRRO: string;
  CIDADE: string;
  ESTADO: string;
  CEP: string;
  LOCALIZACAO: string;
  ATIVO: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface RotaAPI {
  ID_ROTA_PROMOTOR: number;
  ID_OFICINA: number;
  ID_CAMPANHA_PROMOTOR: number;
  STATUS: RouteStatus;
  SUCCESS: boolean;
  CHECKIN_TIME: string;
  DONE_AT: string;
  OBS: string;
  REDIRECT: RedirectType;
  CREATED_BY: number;
  CREATED_AT: string;
  UPDATED_AT: string;
  DELETED_AT: string;
  oficina: OficinaAPI;
}

export interface CampanhaAtivaResponse {
  message: string;
  data: {
    ID_CAMPANHA: number;
    NOME: string;
    OBEJTIVO: string;
    ID_CLIENT: number;
    START_TIME: string;
    END_TIME: string;
    CREATED_BY: number;
    CREATED_AT: string;
    UPDATED_AT: string;
    rotas: RotaAPI[];
  };
}

export interface RotaUpdatePayload {
  STATUS: RouteStatus;
  SUCCESS?: boolean;
  CHECKIN_TIME?: string;
  DONE_AT?: string;
  OBS?: string;
  REDIRECT?: RedirectType;
}

// --- Internal normalized types (used in components) ---

export interface Campanha {
  id_campanha: number;
  nome: string;
  objetivo: string;
}

export interface Oficina {
  id_oficina: number;
  nome: string;
  endereco: string;
  telefone: string;
  localizacao: string;
  bairro: string;
  cidade: string;
  estado: string;
  distancia_km?: number;
}

export interface RotaPromotor {
  id_rota_promotor: number;
  id_oficina: number;
  id_campanha_promotor: number;
  status: RouteStatus;
  success: boolean | null;
  checkin_time: string | null;
  done_at: string | null;
  obs: string | null;
  redirect: RedirectType | null;
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
  id_rota: number;
  id_pergunta: string;
  resposta: string;
}
