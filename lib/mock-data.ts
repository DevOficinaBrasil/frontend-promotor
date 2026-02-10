import type {
  Promotor,
  RotaPromotor,
  CampanhaPerguntas,
} from "./types";

export const mockPromotor: Promotor = {
  id_promotor: "p1",
  nome: "Carlos Silva",
  email: "carlos@email.com",
  cpf: "12345678900",
};

export const mockRotas: RotaPromotor[] = [
  {
    id_rota_promotor: "r1",
    id_oficina: "o1",
    id_campanha_promotor: "cp1",
    status: "BACKLOG",
    success: null,
    checkin_time: null,
    done_at: null,
    obs: null,
    oficina: {
      id_oficina: "o1",
      nome: "Auto Center Oliveira",
      endereco: "Rua das Flores, 123 - Centro, Sao Paulo",
      telefone: "(11) 3456-7890",
      lat: -23.5505,
      lng: -46.6333,
      distancia_km: 1.2,
    },
    campanha: {
      id_campanha: "c1",
      nome: "Campanha Oleo Premium",
      objetivo: "VENDA",
    },
  },
  {
    id_rota_promotor: "r2",
    id_oficina: "o2",
    id_campanha_promotor: "cp1",
    status: "BACKLOG",
    success: null,
    checkin_time: null,
    done_at: null,
    obs: null,
    oficina: {
      id_oficina: "o2",
      nome: "Mecanica Rapida Express",
      endereco: "Av. Brasil, 456 - Liberdade, Sao Paulo",
      telefone: "(11) 2345-6789",
      lat: -23.5575,
      lng: -46.6353,
      distancia_km: 2.8,
    },
    campanha: {
      id_campanha: "c1",
      nome: "Campanha Oleo Premium",
      objetivo: "VENDA",
    },
  },
  {
    id_rota_promotor: "r3",
    id_oficina: "o3",
    id_campanha_promotor: "cp1",
    status: "BACKLOG",
    success: null,
    checkin_time: null,
    done_at: null,
    obs: null,
    oficina: {
      id_oficina: "o3",
      nome: "Oficina do Joao Freios",
      endereco: "Rua Augusta, 789 - Consolacao, Sao Paulo",
      telefone: "(11) 1234-5678",
      lat: -23.5615,
      lng: -46.6553,
      distancia_km: 4.5,
    },
    campanha: {
      id_campanha: "c1",
      nome: "Campanha Oleo Premium",
      objetivo: "VENDA",
    },
  },
  {
    id_rota_promotor: "r4",
    id_oficina: "o4",
    id_campanha_promotor: "cp1",
    status: "BACKLOG",
    success: null,
    checkin_time: null,
    done_at: null,
    obs: null,
    oficina: {
      id_oficina: "o4",
      nome: "Point Car Service",
      endereco: "Rua Vergueiro, 321 - Vila Mariana, Sao Paulo",
      telefone: "(11) 9876-5432",
      lat: -23.5725,
      lng: -46.6363,
      distancia_km: 6.1,
    },
    campanha: {
      id_campanha: "c1",
      nome: "Campanha Oleo Premium",
      objetivo: "VENDA",
    },
  },
];

export const mockPerguntas: CampanhaPerguntas[] = [
  {
    id_perguntas: "q1",
    id_campanha: "c1",
    pergunta: "Qual a quantidade de oleo em estoque?",
    tipo: "NUMERO",
  },
  {
    id_perguntas: "q2",
    id_campanha: "c1",
    pergunta: "O material promocional foi instalado?",
    tipo: "SIM_NAO",
  },
  {
    id_perguntas: "q3",
    id_campanha: "c1",
    pergunta: "Como esta a exposicao dos produtos?",
    tipo: "TEXTO",
  },
  {
    id_perguntas: "q4",
    id_campanha: "c1",
    pergunta: "O responsavel da oficina estava presente?",
    tipo: "SIM_NAO",
  },
];
