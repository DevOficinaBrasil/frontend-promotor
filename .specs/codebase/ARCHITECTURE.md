# Architecture

**Pattern:** Monolito Frontend (Next.js SPA) + Monolito Backend (Express REST API)

## High-Level Structure

```
┌─────────────────────────┐       ┌──────────────────────────────┐
│   Frontend (Next.js)    │       │    Backend (Express)          │
│                         │       │                              │
│  ┌───────────────────┐  │  HTTP │  ┌────────┐  ┌───────────┐  │
│  │   app/page.tsx     │──┼──────┼─▶│ Routes │─▶│Controllers│  │
│  │    (SPA root)      │  │ REST │  └────────┘  └─────┬─────┘  │
│  └────────┬──────────┘  │       │                    │        │
│           │              │       │              ┌─────▼─────┐  │
│  ┌────────▼──────────┐  │       │              │  Services  │  │
│  │   AuthProvider     │  │       │              └─────┬─────┘  │
│  │   (Context API)    │  │       │                    │        │
│  └────────┬──────────┘  │       │              ┌─────▼─────┐  │
│           │              │       │              │  TypeORM   │  │
│  ┌────────▼──────────┐  │       │              │  Entities  │  │
│  │   HomeScreen       │  │       │              └─────┬─────┘  │
│  │   LoginForm        │  │       │                    │        │
│  └───────────────────┘  │       │              ┌─────▼─────┐  │
│                         │       │              │  Database   │  │
│  ┌───────────────────┐  │       │              │ (PG/MSSQL) │  │
│  │  Server Actions    │──┼──────┼─▶ AWS S3     └───────────┘  │
│  │  (S3 upload)       │  │       │                              │
│  └───────────────────┘  │       └──────────────────────────────┘
└─────────────────────────┘
```

## Identified Patterns

### 1. Single-Page App com Context Auth (Frontend)

**Location:** `app/page.tsx` + `lib/auth-context.tsx`
**Purpose:** Controla login/logout e renderização condicional da tela principal
**Implementation:** `AuthProvider` com React Context. Persiste `Promotor` + JWT token no `localStorage`. Se `NEXT_PUBLIC_API_URL` estiver definida, autentica via API real; caso contrário, fallback para mock data.
**Example:** `page.tsx` → `AuthProvider` → `isAuthenticated ? <HomeScreen /> : <LoginForm />`

### 2. Service Layer com Fetch Wrapper (Frontend)

**Location:** `service/api.ts`, `service/*.service.ts`
**Purpose:** Abstrai chamadas HTTP para o backend
**Implementation:** Função `api<T>()` genérica que encapsula `fetch`, com `ApiError` custom. Cada service (`auth`, `campanha`, `rota`) expõe funções específicas que normalizam payloads e responses.
**Example:** `getCampanhaAtiva(idPromotor)` chama `api<CampanhaAtivaResponse>(...)` e normaliza com `normalizeRota()`

### 3. Route → Controller → Service → Repository (Backend)

**Location:** `routes/`, `controllers/`, `service/`, `entities/`
**Purpose:** Separação de responsabilidades clássica MVC-like
**Implementation:**
  - **Routes:** Definem endpoints + validação Zod + documentação OpenAPI via `createDocumentedRoute`
  - **Controllers:** Recebem req/res, delegam para services, tratam erros
  - **Services:** Lógica de negócio + acesso ao repositório TypeORM
  - **Entities:** Modelos TypeORM com decorators, soft delete (`DeleteDateColumn`)
**Example:** `CampanhaRoute → campanhaController.getCampanhaAtiva() → campanhaService.getCampanhaAtiva()`

### 4. Schema-Driven Validation + OpenAPI (Backend)

**Location:** `schemas/`, `config/openapi.ts`, `utils/routeDocumentation.ts`
**Purpose:** Schemas Zod servem para validação de input E geração automática de documentação OpenAPI
**Implementation:** `createDocumentedRoute()` registra rota + schema no registry OpenAPI. Middleware `validateSchema` valida body/params/query. Scalar UI servida em `/docs`.
**Example:** `schemas/campanha.ts` define `createCampanhaBodySchema` → usado em rota E no OpenAPI generator

### 5. Async Action Hook com Feedback (Frontend)

**Location:** `hooks/use-async-action.tsx`
**Purpose:** Padrão reutilizável para operações assíncronas com estados loading/success/error
**Implementation:** Custom hook `useAsyncAction` retorna `{ feedbackState, execute, retry, reset }`. Componente `RequestFeedback` consome o estado e mostra dialogs auto-fecháveis.
**Example:** `const { execute: executeCheckin } = useAsyncAction(checkinAction)` → `<RequestFeedback state={checkinFeedback} />`

### 6. Carousel-Based Route Navigation (Frontend)

**Location:** `components/route-carousel.tsx`, `components/oficina-card.tsx`
**Purpose:** Container mobile-first que exibe rotas de visita como carousel horizontal
**Implementation:** Embla Carousel com cards de oficina. Cada card tem workflow: BACKLOG → A CAMINHO → EM ANDAMENTO → FINALIZADO/CANCELADO. Lógica de bloqueio (`isAnyRouteActive`) impede iniciar nova rota se outra está em andamento.

## Data Flow

### Autenticação

```
LoginForm → loginService(email, senha) → POST /promotor/login
  → promotorController.loginPromotor() → bcrypt.compare()
  → jwt.sign({ user }) → { promotor, token }
  → localStorage.setItem("ofbr_promotor", "ofbr_token")
  → AuthProvider.setPromotor() → isAuthenticated = true → <HomeScreen />
```

### Fluxo de Visita (Core Business)

```
1. HomeScreen → getCampanhaAtiva(promotor.ID_PROMOTOR)
   → GET /campanha/ativa?ID_PROMOTOR=X
   → Retorna campanha + rotas (com oficinas) do promotor

2. Usuário toca "Ir a caminho" → GpsDialog
   → updateRotaACaminho(id) → PUT /rota/{id}/options { STATUS: "A CAMINHO" }
   → Abre Google Maps ou Waze com endereço/coordenadas

3. Usuário chega e faz "Check-in"
   → updateRotaCheckin(id) → PUT /rota/{id}/options { STATUS: "EM ANDAMENTO", CHECKIN_TIME }

4. Usuário toca "Responder Pesquisa"
   → getCampanhaDetalhes(id_campanha) → GET /campanha/{id}
   → Retorna perguntas (String, Integer, Boolean, Date, Image)

5. Preenche formulário → Para perguntas "Image", upload via Server Action S3
   → saveCampanhaResult(payload) × N → POST /campanha-results/save
   → updateRotaFinalizado(id) → PUT /rota/{id}/options { STATUS: "FINALIZADO" }
```

### Upload de Imagem

```
CheckinForm → arquivo selecionado (input type=file, capture=environment)
  → uploadImageToS3(formData) — Server Action (app/actions/s3.action.ts)
  → AWS S3 PutObject → retorna URL pública
  → URL salva como RESPOSTA em CAMPANHA_RESULTS
```

## Code Organization

**Approach:** Layer-based no backend, feature-flat no frontend

**Frontend:** Estrutura flat — todos componentes em `components/`, serviços em `service/`, hooks em `hooks/`. Single page (`app/page.tsx`) com renderização condicional.

**Backend:** Camadas clássicas — `routes/ → controllers/ → service/ → entities/`. Schemas Zod isolados em `schemas/`. Middlewares compartilhados em `middlewares/`.

**Module boundaries:** Não há modules/bounded contexts formais. Frontend comunica com backend exclusivamente via REST. Backend tem schema único `CAMPANHAS_OB` no banco.
