import { normalizeRota } from "./campanha.service";
import type { Campanha, RotaAPI } from "@/lib/types";

const campanha: Campanha = {
  id_campanha: 1,
  nome: "Campanha de teste",
  objetivo: "Visitar oficinas",
};

function rotaAPI(overrides: Partial<RotaAPI> = {}): RotaAPI {
  return {
    ID_ROTA_PROMOTOR: 10,
    ID_OFICINA: 20,
    ID_CAMPANHA_PROMOTOR: 30,
    STATUS: "BACKLOG",
    SUCCESS: false,
    CHECKIN_TIME: "",
    DONE_AT: "",
    OBS: "",
    REDIRECT: "SAC",
    ORDEM: 1,
    CREATED_BY: 1,
    CREATED_AT: "2026-01-01T00:00:00.000Z",
    UPDATED_AT: "2026-01-01T00:00:00.000Z",
    DELETED_AT: "",
    oficina: {
      ID_OFICINA: 20,
      NOME_FANTASIA: "Oficina Teste",
      RAZAO_SOCIAL: "Oficina Teste LTDA",
      CNPJ: "00000000000000",
      EMAIL: "oficina@teste.com",
      TELEFONE: "11999999999",
      ENDERECO: "Rua das Flores",
      NUMERO: "100",
      BAIRRO: "Centro",
      CIDADE: "São Paulo",
      ESTADO: "SP",
      CEP: "01000000",
      LOCALIZACAO: "-23.5,-46.6",
      ATIVO: "S",
      CREATED_AT: "2026-01-01T00:00:00.000Z",
      UPDATED_AT: "2026-01-01T00:00:00.000Z",
      cor_icone: "verde",
      flag_engajamento: "alto",
      flag_sentimento: "promotor",
      flag_treinamento: "alto",
    },
    ...overrides,
  };
}

describe("normalizeRota — status de confirmação", () => {
  it("preserva status e data de confirmação de uma rota confirmada", () => {
    const rota = normalizeRota(
      rotaAPI({
        notificacaoVisita: {
          STATUS: "CONFIRMADO",
          CONFIRMADO_EM: "2026-02-10T12:00:00.000Z",
        },
      }),
      campanha
    );

    expect(rota.notificacao_visita).toEqual({
      status: "CONFIRMADO",
      confirmado_em: "2026-02-10T12:00:00.000Z",
    });
  });

  it("preserva o status quando CONFIRMADO_EM não vem, com confirmado_em null", () => {
    const rota = normalizeRota(
      rotaAPI({ notificacaoVisita: { STATUS: "PENDENTE" } }),
      campanha
    );

    expect(rota.notificacao_visita).toEqual({
      status: "PENDENTE",
      confirmado_em: null,
    });
  });

  it("omite o campo quando a rota da API não o traz, em vez de criar objeto vazio", () => {
    const rota = normalizeRota(rotaAPI(), campanha);

    expect("notificacao_visita" in rota).toBe(false);
    expect(rota.notificacao_visita).toBeUndefined();
  });
});
