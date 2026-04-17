# Concerns

## Segurança

### SEC-01: Token JWT armazenado em localStorage (Alto Risco)

**Location:** `frontend-promotor/lib/auth-context.tsx` L71-74
**Evidence:** `localStorage.setItem("ofbr_token", response.token)`
**Impact:** Vulnerável a XSS — qualquer script malicioso injetado pode roubar o token JWT
**Fix approach:** Migrar para cookie HttpOnly+Secure+SameSite via backend, ou usar token em memória com refresh token em cookie

### SEC-02: SKIP_AUTH bypass em development (Médio Risco)

**Location:** `backend-promotor/middlewares/authMiddleware.ts`
**Evidence:** `if (process.env.SKIP_AUTH === "true" && process.env.NODE_ENV === "development") return next();`
**Impact:** Se `SKIP_AUTH=true` vazar para produção, toda autenticação é ignorada
**Fix approach:** Remover a flag ou usar validação dupla (NODE_ENV + presença de IP específico)

### SEC-03: trustServerCertificate: true no DataSource (Médio Risco)

**Location:** `backend-promotor/data-source.ts`
**Evidence:** `extra: { trustServerCertificate: true }`
**Impact:** Desabilita verificação de certificado SSL do banco — vulnerável a MITM
**Fix approach:** Usar certificado CA do RDS (já baixado no Dockerfile como `global-bundle.pem`) na configuração de SSL do TypeORM

### SEC-04: CORS totalmente aberto (Médio Risco)

**Location:** `backend-promotor/app.ts`
**Evidence:** `app.use(cors())` — sem configuração de origins
**Impact:** Qualquer origem pode fazer requests à API
**Fix approach:** Configurar `cors({ origin: [frontendUrl] })` usando env var `CORS_ORIGIN`

### SEC-05: Credenciais AWS via env vars diretas (Baixo Risco)

**Location:** `frontend-promotor/app/actions/s3.action.ts`, env vars
**Evidence:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` em env
**Impact:** Credenciais long-lived. Se vazarem, acesso total ao S3
**Fix approach:** Usar IAM roles (ECS task role) no backend. No frontend Server Action, considerar presigned URLs geradas pelo backend

## Tech Debt

### DEBT-01: Dois arquivos de config Next.js conflitantes

**Location:** `frontend-promotor/next.config.ts` e `frontend-promotor/next.config.mjs`
**Evidence:** Ambos existem no root. `next.config.mjs` tem `ignoreBuildErrors: true` e `images.unoptimized: true`; `next.config.ts` não tem essas flags
**Impact:** Ambiguidade sobre qual é carregado. `ignoreBuildErrors: true` esconde erros de tipo em build
**Fix approach:** Remover `next.config.mjs`, manter `next.config.ts` como fonte única. Resolver erros TS ao invés de ignorá-los

### DEBT-02: Dois globals.css duplicados

**Location:** `frontend-promotor/app/globals.css` e `frontend-promotor/styles/globals.css`
**Evidence:** Ambos existem com possível sobreposição de estilos
**Impact:** Confusão sobre qual é importado/ativo
**Fix approach:** Manter apenas `app/globals.css` (usado no layout.tsx)

### DEBT-03: Mock data hardcoded no frontend

**Location:** `frontend-promotor/lib/mock-data.ts`, lógica condicional em `auth-context.tsx` e `home-screen.tsx`
**Evidence:** `if (process.env.NEXT_PUBLIC_API_URL) { ... } else { /* mock */ }`
**Impact:** Lógica de mock misturada com lógica de produção em múltiplos arquivos
**Fix approach:** Isolar mocks em middleware ou adapter layer; usar feature flag explícita

### DEBT-04: Dependências de banco múltiplas desnecessárias (Backend)

**Location:** `backend-promotor/package.json`
**Evidence:** `pg`, `mssql`, `mysql2`, `mongodb` todos instalados
**Impact:** Superfície de ataque e tamanho de bundle aumentados. Provavelmente apenas 1-2 são usados
**Fix approach:** Remover drivers de banco não utilizados no projeto atual

### DEBT-05: errorChance em useAsyncAction

**Location:** `frontend-promotor/hooks/use-async-action.tsx`
**Evidence:** `useAsyncAction(loginAction, { delay: 1500, errorChance: 0.15 })`
**Impact:** Simula erros aleatórios em produção (15% chance no login!)
**Fix approach:** Remover `errorChance` ou garantir que só é ativado em desenvolvimento

### DEBT-06: Campos com typo na API

**Location:** `backend-promotor` → campo `OBEJTIVO` (deveria ser `OBJETIVO`)
**Evidence:** `CampanhaAtivaResponse` no frontend usa `OBEJTIVO` para manter compatibilidade
**Impact:** Confusão e inconsistência entre endpoints. `GET /campanha/ativa` retorna `OBEJTIVO`, `GET /campanha/{id}` retorna `OBJETIVO`
**Fix approach:** Migração coordenada — adicionar alias no backend ou corrigir o campo na tabela

## Performance

### PERF-01: Sem paginação nas listagens (Backend)

**Location:** Controllers e services de campanha, promotor, perguntas
**Evidence:** `campanhaService.getAll()` retorna todos sem limit/offset
**Impact:** Com crescimento de dados, queries sem paginação podem causar timeouts
**Fix approach:** Adicionar pagination params nos endpoints de listagem

### PERF-02: N+1 em saveCampanhaResult (Frontend)

**Location:** `frontend-promotor/components/home-screen.tsx`
**Evidence:** `await Promise.all(results.map(r => saveCampanhaResult(...)))` — uma request por pergunta
**Impact:** Se houver 10 perguntas, são 10 requests HTTP consecutivas
**Fix approach:** Criar endpoint batch `POST /campanha-results/save-batch` que aceite array

## Fragilidades

### FRAG-01: Componente HomeScreen é um God Component (~300 linhas)

**Location:** `frontend-promotor/components/home-screen.tsx`
**Evidence:** Gerencia 8+ useState, 5+ useCallback, 3+ modais, pull-to-refresh, e toda a lógica de rotas
**Impact:** Difícil de manter, testar e estender
**Fix approach:** Extrair custom hooks (ex: `useRotasManager`, `useSurveyFlow`, `useCancelFlow`) e separar modais em componentes independentes

### FRAG-02: Frontend é Single-Page sem rotas Next.js

**Location:** `frontend-promotor/app/page.tsx`
**Evidence:** Tudo em uma única page com renderização condicional (`isAuthenticated ? HomeScreen : LoginForm`)
**Impact:** Não aproveita features do Next.js (routing, layouts dinâmicos, code splitting por rota, SSR)
**Fix approach:** Considerar migrar para App Router com `app/(auth)/login/page.tsx` e `app/(app)/page.tsx` com layout compartilhado
