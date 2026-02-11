import { api } from "./api";
import type {
  CampanhaAtivaResponse,
  CampanhaDetalheResponse,
  RotaPromotor,
  RotaAPI,
  Campanha,
  CampanhaPerguntas,
  QuestionType,
} from "@/lib/types";

function normalizeRota(rota: RotaAPI, campanha: Campanha): RotaPromotor {
  const o = rota.oficina;
  const endereco = [o.ENDERECO, o.NUMERO, o.BAIRRO, o.CIDADE, o.ESTADO]
    .filter(Boolean)
    .join(", ");

  return {
    id_rota_promotor: rota.ID_ROTA_PROMOTOR,
    id_oficina: rota.ID_OFICINA,
    id_campanha_promotor: rota.ID_CAMPANHA_PROMOTOR,
    status: rota.STATUS,
    success: rota.SUCCESS ?? null,
    checkin_time: rota.CHECKIN_TIME || null,
    done_at: rota.DONE_AT || null,
    obs: rota.OBS || null,
    redirect: rota.REDIRECT || null,
    oficina: {
      id_oficina: o.ID_OFICINA,
      nome: o.NOME_FANTASIA,
      endereco,
      telefone: o.TELEFONE,
      localizacao: o.LOCALIZACAO,
      bairro: o.BAIRRO,
      cidade: o.CIDADE,
      estado: o.ESTADO,
    },
    campanha,
  };
}

export async function getCampanhaAtiva(
  idPromotor: number,
): Promise<{ campanha: Campanha; rotas: RotaPromotor[] }> {
  const response = await api<CampanhaAtivaResponse>(
    `campanha/ativa?ID_PROMOTOR=${idPromotor}`
  );

  const d = response.data;
  const campanha: Campanha = {
    id_campanha: d.ID_CAMPANHA,
    nome: d.NOME,
    objetivo: d.OBEJTIVO,
  };

  const rotas = d.rotas.map((r) => normalizeRota(r, campanha));

  return { campanha, rotas };
}

export async function getCampanhaDetalhes(idCampanha: number): Promise<CampanhaPerguntas[]> {
  const response = await api<CampanhaDetalheResponse>(`campanha/${idCampanha}`);
  
  if (!response.data || !response.data.campanhaPerguntas) {
    return [];
  }

  return response.data.campanhaPerguntas.map((p) => ({
    id_perguntas: p.ID_PERGUNTAS.toString(),
    id_campanha: p.ID_CAMPANHA.toString(),
    pergunta: p.PERGUNTA,
    tipo: (p.TIPO as QuestionType) || "String", // Default to String if type is missing or unrecognized
  }));
}