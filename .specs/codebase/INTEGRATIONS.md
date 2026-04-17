# External Integrations

## AWS S3 — Storage de Imagens

**Service:** Amazon S3
**Purpose:** Upload e armazenamento de fotos tiradas durante visitas (perguntas tipo "Image")
**Implementation:**
  - **Frontend:** Server Action em `app/actions/s3.action.ts` — recebe FormData, faz `PutObjectCommand` via `@aws-sdk/client-s3`
  - **Backend:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` disponíveis (presigned URLs)
**Configuration:** Variáveis de ambiente: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`, `AWS_S3`
**Authentication:** IAM Access Key + Secret Key via env vars

## Database — TypeORM (PostgreSQL / MSSQL)

**Service:** PostgreSQL ou MSSQL (configurável via `DB_TYPE`)
**Purpose:** Persistência principal — campanhas, promotores, rotas, oficinas, resultados
**Implementation:** `data-source.ts` — DataSource TypeORM com entities auto-descobertas em `entities/*.ts`
**Configuration:** Env vars: `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
**Schema:** `CAMPANHAS_OB` (domínio campanhas) + `MAIN_REGISTER` (entity Usuario)
**Authentication:** Credenciais via env + `trustServerCertificate: true`

## OpenAI — Inteligência Artificial

**Service:** OpenAI API
**Purpose:** Utilizado em scripts de bots (scraping, vectorização de manuais)
**Implementation:** `openai` 5.20.3 — referenciado em scripts (`bots/`)
**Configuration:** Provável via API key em env (não mapeada no `exemple.env`)

## GPS Navigation (Externo, Client-Side)

**Service:** Google Maps / Waze
**Purpose:** Navegação do promotor até a oficina
**Implementation:** `components/gps-dialog.tsx` → abre URL externa no browser:
  - Google Maps: `https://www.google.com/maps/dir/?api=1&destination=...`
  - Waze: `https://waze.com/ul?ll=...&navigate=yes`
**Configuration:** Sem API keys — usa deep links públicos
**Dados:** Endereço ou coordenadas (campo `LOCALIZACAO` da oficina)

## API Integrations

### REST API Interna (Backend → Frontend)

**Purpose:** Comunicação entre frontend e backend
**Location:** `service/api.ts` (frontend), `routes/` (backend)
**Authentication:** JWT Bearer token (header Authorization)
**Base URL:** `NEXT_PUBLIC_API_URL` (frontend env var)
**Key endpoints:**
  - `POST /promotor/login` — Autenticação
  - `GET /campanha/ativa?ID_PROMOTOR=X` — Campanha ativa do promotor
  - `GET /campanha/{id}` — Detalhes + perguntas da campanha
  - `PUT /rota/{id}/options` — Atualizar status da rota
  - `POST /campanha-results/save` — Salvar resposta de pesquisa
  - `GET /oficina/nearby` — Oficinas próximas por geolocalização
  - `POST /rota/geolocation` — Calcular distâncias com coordenada

### API Documentation (Scalar UI)

**Purpose:** Documentação interativa da API
**Location:** Servida em `/docs` no backend
**Implementation:** `config/openapi.ts` + `@scalar/express-api-reference`
**OpenAPI spec:** Gerada dinamicamente em `/openapi.json` via `zod-to-openapi`

## Connectors Adicionais (Backend)

### MongoDB

**Package:** `mongodb` 6.20.0
**Purpose:** Possível uso em scripts/bots auxiliares (importação de dados)
**Script:** `npm run importToMongoDev`

### MSSQL

**Package:** `mssql` 11.0.1
**Purpose:** Provável conexão legacy com banco SQL Server corporativo

### MySQL

**Package:** `mysql2` 3.14.3
**Purpose:** Conector adicional — uso não identificado no código principal

## Background Jobs

**Scheduling:** `node-cron` 4.2.1 + `node-schedule` 2.1.1 (instalados, uso em scripts)
**Scripts disponíveis:**
  - `npm run scrapAutoDoc` — Scraping automatizado
  - `npm run scrapStartMyCar` — Scraping de dados
  - `npm run autodocToOB` — ETL de dados
  - `npm run vectorizeManuals` — Vectorização com OpenAI
  - `npm run vinculateToPeca` — Vinculação de peças
  - `npm run importToMongoDev` — Importação para MongoDB
  - `npm run aproveSolicitacoes` — Aprovação de solicitações
  - `npm run sendEmailSolicitacoes` — Envio de emails

## Deploy & Infra

**Container:** Docker (`Dockerfile`) → AWS ECS
**Image base:** `node:20-alpine` + ImageMagick + Ghostscript + RDS CA bundle
**Task Definition:** `task_definition.tpl.json` com variáveis de ECS deploy
**Env vars de infra:** `REPOSITORY_ECR_URL`, `CLUSTER_NAME`, `SERVICE_NAME`, `ARN_ROLE_ECS`, etc.
