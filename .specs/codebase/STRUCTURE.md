# Project Structure

**Root:** Multi-root workspace com dois projetos independentes

## Directory Tree

### Frontend (`frontend-promotor/`)

```
frontend-promotor/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Inter font, metadata, viewport)
│   ├── page.tsx                  # Única página — SPA com AuthProvider
│   ├── globals.css               # Estilos globais + CSS variables (tema)
│   └── actions/
│       └── s3.action.ts          # Server Action — upload de imagens para AWS S3
├── components/
│   ├── app-header.tsx            # Header sticky com nome do promotor + logout
│   ├── home-screen.tsx           # Tela principal — gerencia rotas, estados, modais
│   ├── login-form.tsx            # Formulário de login (email + senha)
│   ├── checkin-form.tsx          # Formulário de pesquisa (perguntas dinâmicas + upload)
│   ├── oficina-card.tsx          # Card de oficina com workflow de status
│   ├── route-carousel.tsx        # Carousel horizontal de rotas pendentes
│   ├── gps-dialog.tsx            # Modal de seleção Google Maps / Waze
│   ├── request-feedback.tsx      # Modal genérico loading/success/error
│   ├── theme-provider.tsx        # Wrapper next-themes
│   └── ui/                       # ~40 componentes shadcn/ui (auto-gerados)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── ...
├── hooks/
│   ├── use-async-action.tsx      # Hook de ações assíncronas com feedback
│   ├── use-mobile.tsx            # Hook de detecção de dispositivo mobile
│   └── use-toast.ts             # Hook de toast (sonner)
├── lib/
│   ├── auth-context.tsx          # AuthProvider + useAuth hook
│   ├── types.ts                  # Tipos centralizados (Promotor, Rota, Campanha, etc.)
│   ├── mock-data.ts              # Dados mock para desenvolvimento offline
│   └── utils.ts                  # cn() — class merge utility
├── service/
│   ├── api.ts                    # Fetch wrapper genérico + ApiError
│   ├── auth.service.ts           # loginService()
│   ├── campanha.service.ts       # getCampanhaAtiva(), getCampanhaDetalhes(), saveCampanhaResult()
│   └── rota.service.ts           # updateRota(), helpers (ACaminho, Checkin, Finalizado, Cancelado)
├── public/                       # Assets estáticos (vazio)
├── styles/
│   └── globals.css               # CSS adicional (duplicado com app/globals.css?)
├── components.json               # Configuração shadcn/ui
├── tailwind.config.ts            # Tema customizado (cores brand: azul, verde)
├── next.config.ts                # Server Actions body limit 20mb
├── next.config.mjs               # Config alternativa (ignoreBuildErrors, unoptimized images)
├── tsconfig.json                 # Strict mode, path alias @/*
└── package.json                  # pnpm, React 19, Next.js 16
```

### Backend (`backend-promotor/`)

```
backend-promotor/
├── app.ts                        # Entry point — Express + CORS + routes + DB init
├── api.ts                        # Registra todas as rotas no app
├── data-source.ts                # TypeORM DataSource config (env-driven)
├── config/
│   └── openapi.ts                # OpenAPI generator (zod-to-openapi + Scalar)
├── entities/                     # TypeORM entities (schema: CAMPANHAS_OB)
│   ├── Campanha.ts               # Campanha principal
│   ├── CampanhaPerguntas.ts      # Perguntas da campanha (enum TIPO)
│   ├── CampanhaPromotor.ts       # Vínculo N:N campanha ↔ promotor
│   ├── CampanhaResults.ts        # Respostas das perguntas por rota
│   ├── Oficina.ts                # Dados da oficina (endereço, flags)
│   ├── Promotor.ts               # Promotor (login, vinculação)
│   ├── RotaPromotor.ts           # Rota de visita (status, checkin, GPS)
│   └── Usuario.ts                # Usuário admin (schema MAIN_REGISTER)
├── controllers/
│   ├── campanhaController.ts
│   ├── campanhaPerguntasController.ts
│   ├── campanhaResultsController.ts
│   ├── oficinaController.ts
│   ├── promotorController.ts
│   └── rotaController.ts
├── routes/
│   ├── CampanhaRoute.ts
│   ├── CampanhaPerguntasRoute.ts
│   ├── CampanhaResultsRoute.ts
│   ├── OficinaRoute.ts
│   ├── PromotorRoute.ts
│   └── RotaRoute.ts
├── service/
│   ├── campanhaService.ts
│   ├── campanhaPerguntasService.ts
│   ├── campanhaResultsService.ts
│   ├── oficinaService.ts
│   ├── promotorService.ts
│   ├── rotaService.ts
│   └── usuarioService.ts
├── schemas/                      # Zod schemas (validação + OpenAPI)
│   ├── campanha.ts
│   ├── campanhaPerguntas.ts
│   ├── campanhaResults.ts
│   ├── oficina.ts
│   ├── promotor.ts
│   ├── rota.ts
│   ├── versao.ts
│   └── common.ts
├── middlewares/
│   ├── authMiddleware.ts         # JWT verification + user lookup
│   └── validation.ts            # Zod schema validation middleware
├── utils/
│   ├── duckdbClient.ts           # JSON lookup de oficinas (substituiu DuckDB)
│   ├── encryption.ts             # Helpers de criptografia
│   └── routeDocumentation.ts     # Helper para documentar rotas no OpenAPI
├── docs/                         # Documentação interna (markdown)
├── scripts/                      # Scripts utilitários
├── __tests__/
│   ├── unit/                     # Testes unitários por service
│   └── integration/              # Teste de integração (DuckDB/JSON)
├── __mocks__/
│   └── data-source.ts            # Mock do DataSource p/ testes
├── assets/                       # Fonts, imagens, PDFs
├── templates/                    # Templates EJS
├── types/
│   └── ModeloType.ts             # Types genéricos
├── duckdb/                       # Cache JSON de oficinas
├── Dockerfile                    # node:20-alpine → ECS
├── task_definition.tpl.json      # Template ECS task definition
└── package.json                  # npm, Express 5, TypeORM
```

## Where Things Live

### Autenticação

- **UI:** `components/login-form.tsx`
- **Context:** `lib/auth-context.tsx`
- **Service (frontend):** `service/auth.service.ts`
- **Controller (backend):** `controllers/promotorController.ts` → `loginPromotor()`
- **Middleware:** `middlewares/authMiddleware.ts`

### Campanhas & Pesquisas

- **UI:** `components/home-screen.tsx`, `components/checkin-form.tsx`
- **Service (frontend):** `service/campanha.service.ts`
- **API (backend):** `controllers/campanhaController.ts`, `controllers/campanhaResultsController.ts`
- **Entities:** `entities/Campanha.ts`, `entities/CampanhaPerguntas.ts`, `entities/CampanhaResults.ts`

### Rotas de Visita

- **UI:** `components/route-carousel.tsx`, `components/oficina-card.tsx`
- **Service (frontend):** `service/rota.service.ts`
- **API (backend):** `controllers/rotaController.ts`
- **Entity:** `entities/RotaPromotor.ts`

### Upload de Imagens

- **Server Action:** `app/actions/s3.action.ts`
- **Consumer:** `components/checkin-form.tsx` (tipo "Image")

## Special Directories

### `components/ui/`

~40 componentes shadcn/ui gerados automaticamente. Não devem ser editados manualmente (exceto customizações pontuais).

### `docs/` (backend)

Documentação técnica em markdown — specs de API, guias de integração, decisões de segurança.

### `duckdb/` (backend)

Cache JSON de dados de oficinas. Originalmente usava DuckDB (pacote removido por segurança).
