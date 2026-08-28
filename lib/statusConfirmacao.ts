/**
 * Mapeia o status de confirmação de visita (`notificacao_visita.status`, já efetivo
 * no backend) para o estado visual exibido na lista de rotas da campanha ativa.
 *
 * Paridade com `ob-ads/lib/statusConfirmacao.ts`: repos separados não compartilham
 * código, a mesma tabela é garantida pelos mesmos casos de teste.
 *
 * `REAGENDADO` não tem indicador definido nesta feature e cai no caso desconhecido.
 */
export type EstadoConfirmacao = "confirmada" | "pendente" | "nao-recebe";

const MAPA: Record<string, EstadoConfirmacao> = {
  CONFIRMADO: "confirmada",
  PENDENTE: "pendente",
  ENVIADO: "pendente",
  DISPENSADO: "pendente",
  EXPIRADO: "nao-recebe",
  FALHOU: "nao-recebe",
};

export function mapStatusConfirmacao(
  status?: string | null
): EstadoConfirmacao | null {
  if (!status) return null;
  return MAPA[status] ?? null;
}
