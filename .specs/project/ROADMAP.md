# Roadmap

**Current Milestone:** v1 — Fluxo Completo de Visita
**Status:** In Progress

---

## v1 — Fluxo Completo de Visita

**Goal:** Promotor consegue executar 100% do fluxo de visita pelo celular
**Target:** Funcionalidades core implementadas e em uso

### Features

**Login do Promotor** — COMPLETE
- Autenticação por email + senha
- JWT token persistido em localStorage
- Fallback mock para desenvolvimento offline

**Campanha Ativa & Rotas** — COMPLETE
- Carregar campanha ativa do promotor via API
- Exibir rotas em carousel horizontal com cards
- Indicadores (engajamento, sentimento, treinamento) por oficina
- Pull-to-refresh para atualizar dados

**Navegação GPS** — COMPLETE
- Seleção entre Google Maps e Waze
- Deep links com endereço ou coordenadas
- Atualização de status para "A CAMINHO"

**Check-in** — COMPLETE
- Registro de horário de chegada
- Status atualizado para "EM ANDAMENTO"
- Feedback visual (loading/success/error)

**Pesquisa da Campanha** — COMPLETE
- Carregamento dinâmico de perguntas por campanha
- Tipos: String, Integer, Boolean, Date, Image
- Upload de fotos via câmera → AWS S3 (Server Action)
- Finalização com observação opcional

**Cancelamento de Visita** — COMPLETE
- Observação obrigatória
- Status "CANCELADO" com registro de horário

**Histórico do Dia** — COMPLETE
- Lista de visitas finalizadas e canceladas
- Badge de status e horário de conclusão

---

## v1.1 — Ordenação Inteligente de Rotas

**Goal:** Promotor vê rotas na ordem mais eficiente para o seu dia

### Features

**Ordenação por Proximidade** — IN PROGRESS
- Cálculo de distância via geolocalização do dispositivo
- Rotas mais próximas aparecem primeiro no carousel

**Ordenação por Escolha do Supervisor** — PLANNED
- Supervisor define ordem de prioridade via admin (OBADS)
- Frontend respeita ordem definida quando disponível
- Fallback para ordenação por proximidade

---

## Future Considerations

- Modo offline com sincronização posterior
- Notificações push (lembrete de visita, campanha nova)
- Visualização de rota no mapa (todas oficinas do dia)
- Relatório resumo do dia para o promotor
- Histórico de visitas anteriores (semana/mês)
- Assinatura digital do responsável na oficina
