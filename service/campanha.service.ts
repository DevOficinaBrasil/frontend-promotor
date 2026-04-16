import { api } from "./api";
import type {
  CampanhaAtivaResponse,
  CampanhaDetalheResponse,
  RotaPromotor,
  RotaAPI,
  Campanha,
  CampanhaPerguntas,
  QuestionType,
  EstrategiaOrdenacao,
} from "@/lib/types";

function normalizeRota(rota: RotaAPI, campanha: Campanha): RotaPromotor {
  const o = rota.oficina;
  const endereco = [o.ENDERECO, o.NUMERO, o.BAIRRO, o.CIDADE, o.ESTADO]
    .filter(Boolean)
    .join(", ");

  // Extrair lat/lon de LOCALIZACAO (formato "lat,lon")
  let latitude: number | undefined;
  let longitude: number | undefined;
  if (o.LOCALIZACAO) {
    const parts = o.LOCALIZACAO.split(",").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      latitude = parts[0];
      longitude = parts[1];
    }
  }

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
    ordem: rota.ORDEM ?? null,
    oficina: {
      id_oficina: o.ID_OFICINA,
      nome: o.NOME_FANTASIA,
      endereco,
      telefone: o.TELEFONE,
      localizacao: o.LOCALIZACAO,
      bairro: o.BAIRRO,
      cidade: o.CIDADE,
      estado: o.ESTADO,
      latitude,
      longitude,
      cor_icone: o.cor_icone,
      flag_engajamento: o.flag_engajamento,
      flag_sentimento: o.flag_sentimento,
      flag_treinamento: o.flag_treinamento,
    },
    campanha,
  };
}

export async function getCampanhaAtiva(
  idPromotor: number,
): Promise<{ campanha: Campanha; rotas: RotaPromotor[]; estrategiaOrdenacao: EstrategiaOrdenacao }> {
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

  return {
    campanha,
    rotas,
    estrategiaOrdenacao: d.ESTRATEGIA_ORDENACAO || 'PROXIMIDADE_PROMOTOR',
  };
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
    tipo: (p.TIPO as QuestionType) || "String",
    opcoes: p.opcoes
      ?.sort((a, b) => a.ORDEM - b.ORDEM)
      .map((o) => ({ id_opcao: o.ID_OPCAO, label: o.LABEL, ordem: o.ORDEM })),
  }));
}

export async function saveCampanhaResult(payload: { ID_ROTA: number; ID_PERGUNTA: number; RESPOSTA: string }) {
  console.log("Saving campanha result with payload:", payload);
  return api("campanha-results/save", {
    method: "POST",
    body: payload,
  });
}