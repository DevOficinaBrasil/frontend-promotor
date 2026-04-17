# Tech Stack

**Analyzed:** 2026-04-07

## Core — Frontend (`frontend-promotor`)

- **Framework:** Next.js 16.1.6 (App Router, Turbopack dev)
- **Language:** TypeScript 5.7.3
- **Runtime:** Node.js (pnpm como package manager)
- **UI Library:** React 19.2.3 + React DOM 19.2.3

### UI & Styling

- **Component Library:** shadcn/ui (Radix UI primitives + CVA + Tailwind)
- **Styling:** Tailwind CSS 3.4.17 + `tailwindcss-animate` + CSS variables (HSL tokens)
- **Icons:** Lucide React 0.544.0
- **Charts:** Recharts 2.15.0
- **Carousel:** Embla Carousel React 8.5.1
- **Drawer:** Vaul 1.1.2
- **Toast:** Sonner 1.7.1

### Forms & Validation

- **Form Library:** React Hook Form 7.54.1
- **Schema Validation:** Zod 3.24.1
- **Resolver:** @hookform/resolvers 3.9.1

### Utilities

- **Date:** date-fns 3.6.0
- **Class Merge:** clsx 2.1.1 + tailwind-merge 2.5.5
- **OTP Input:** input-otp 1.4.1
- **Resizable Panels:** react-resizable-panels 2.1.7
- **Themes:** next-themes 0.4.6

### Cloud

- **Storage:** AWS S3 (`@aws-sdk/client-s3` 3.987.0) — upload de imagens via Server Action

## Core — Backend (`backend-promotor`)

- **Framework:** Express 5.1.0
- **Language:** TypeScript 5.9.2
- **Runtime:** Node.js 20 (Alpine Docker)
- **ORM:** TypeORM 0.3.26 (suporta PostgreSQL / MSSQL configurável via DB_TYPE env)
- **Auth:** jsonwebtoken 9.0.2 + bcrypt 6.0.0
- **Validation:** Zod 3.23.8
- **API Docs:** @asteasolutions/zod-to-openapi 7.1.1 + @scalar/express-api-reference 0.8.15

### Cloud & Infra

- **Storage:** AWS S3 (`@aws-sdk/client-s3` 3.864.0 + `@aws-sdk/s3-request-presigner`)
- **Container:** Docker (node:20-alpine) → ECS (task_definition.tpl.json)
- **Scheduling:** node-cron 4.2.1 + node-schedule 2.1.1

### Data & Processing

- **PDF:** pdf-lib 1.17.1 + pdf-parse 1.1.1
- **Images:** sharp 0.34.5
- **Excel:** xlsx 0.18.5
- **Fonts:** fontkit 2.0.4
- **Templates:** EJS 3.1.10
- **AI:** OpenAI 5.20.3

### Testing (Backend)

- **Unit/Integration:** Jest 30.0.5 + ts-jest 29.4.1
- **HTTP:** Supertest 7.1.4
- **E2E scraping:** Playwright 1.56.0

### Extra databases/connectors

- **MongoDB:** mongodb 6.20.0
- **MSSQL:** mssql 11.0.1
- **MySQL:** mysql2 3.14.3
- **PostgreSQL:** pg 8.16.3

## Development Tools

- **Dev Frontend:** Turbopack (`next dev --turbo`)
- **Dev Backend:** Nodemon 3.1.10
- **Linting Frontend:** ESLint (next lint, flat config)
- **Build Frontend:** `next build` (ignoreBuildErrors: true em next.config.mjs)
