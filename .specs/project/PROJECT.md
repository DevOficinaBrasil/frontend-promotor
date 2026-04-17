# OFBR Promotores (RotaCheck)

**Vision:** Sistema mobile-first de gestão de rotas e visitas para promotores de vendas da Oficina Brasil, permitindo que cada promotor visualize, navegue e execute suas visitas diárias em oficinas mecânicas, coletando dados de campanhas em campo.

**For:** Promotores de vendas em campo (mobile). Admin/backoffice é gerenciado por aplicação separada (OBADS).

**Solves:** Eliminar controle manual de rotas e pesquisas de campo. Promotores precisam de uma ferramenta mobile para saber quais oficinas visitar, navegar até elas, registrar presença e responder pesquisas de campanhas — tudo em tempo real.

## Goals

- Permitir que promotores executem 100% do fluxo de visita pelo celular (login → rota → navegação → check-in → pesquisa → finalização)
- Capturar dados de campanhas (respostas + fotos) de forma estruturada e em tempo real
- Reduzir tempo entre visita e registro de dados para zero (registro in-loco ao invés de posterior)

## Tech Stack

**Frontend:**
- Framework: Next.js 16.1.6 (App Router) — SPA mobile-first
- Language: TypeScript 5.7.3
- UI: React 19 + shadcn/ui + Tailwind CSS 3.4

**Backend:**
- Framework: Express 5.1.0
- ORM: TypeORM 0.3.26
- Database: PostgreSQL / MSSQL (configurável)
- Auth: JWT + bcrypt

**Key dependencies:** Zod (validação), AWS S3 (upload imagens), Embla Carousel (UX rotas), zod-to-openapi (documentação API)

## Scope

**v1 includes:**

- Login do promotor (email + senha → JWT)
- Visualização das rotas da campanha ativa com cards em carousel
- Navegação até oficina via Google Maps ou Waze (deep links)
- Check-in na oficina (registro de horário)
- Responder pesquisa da campanha (String, Integer, Boolean, Date, Image)
- Upload de fotos via câmera do celular → AWS S3
- Cancelar visita com observação obrigatória
- Histórico do dia (visitas finalizadas e canceladas)
- Pull-to-refresh para atualizar rotas
- Indicadores de engajamento/sentimento/treinamento por oficina

**Explicitly out of scope:**

- Painel administrativo (gerenciado pela app OBADS)
- Criação/edição de campanhas (via admin)
- Cadastro de oficinas (via admin/importação)
- Notificações push
- Modo offline / cache local
- Relatórios e dashboards

## Constraints

- **Mobile-first:** Interface otimizada para smartphone (max-w-md, viewport locked)
- **Equipe:** Projeto mantido por equipe pequena
- **Infra:** Backend em AWS ECS (Docker), banco compartilhado com outros sistemas (schema CAMPANHAS_OB)
- **Dependência:** Frontend depende de dados configurados via OBADS (campanhas, promotores, oficinas, rotas)
