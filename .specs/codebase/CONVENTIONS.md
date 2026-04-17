# Code Conventions

## Naming Conventions

### Files

**Frontend:**
- Componentes: `kebab-case.tsx` → `home-screen.tsx`, `oficina-card.tsx`, `route-carousel.tsx`
- Hooks: `use-kebab-case.tsx` → `use-async-action.tsx`, `use-mobile.tsx`
- Services: `kebab-case.service.ts` → `auth.service.ts`, `campanha.service.ts`
- Server Actions: `kebab-case.action.ts` → `s3.action.ts`
- Types: `types.ts` (arquivo único)
- UI (shadcn): `kebab-case.tsx` → `button.tsx`, `dialog.tsx`

**Backend:**
- Controllers: `camelCase + Controller.ts` → `campanhaController.ts`, `promotorController.ts`
- Services: `camelCase + Service.ts` → `campanhaService.ts`, `rotaService.ts`
- Routes: `PascalCase + Route.ts` → `CampanhaRoute.ts`, `PromotorRoute.ts`
- Entities: `PascalCase.ts` → `Campanha.ts`, `RotaPromotor.ts`, `CampanhaResults.ts`
- Schemas: `camelCase.ts` → `campanha.ts`, `promotor.ts`, `rota.ts`
- Middlewares: `camelCase.ts` → `authMiddleware.ts`, `validation.ts`

### Functions/Methods

**Frontend:** `camelCase` — `handleSubmit`, `loadRotas`, `normalizeRota`, `handleOpenGpsSelection`
**Backend:** `camelCase` — `getCampanhaAtiva`, `loginPromotor`, `createDocumentedRoute`
Exemplos: `loginService()`, `updateRotaACaminho()`, `saveCampanhaResult()`

### Variables

- `camelCase` em ambos projetos: `pendingRotas`, `completedCount`, `surveyQuestions`
- State hooks: `[nome, setNome]` → `[rotas, setRotas]`, `[gpsModalOpen, setGpsModalOpen]`

### Constants

- `UPPER_SNAKE_CASE` para campos do banco/API: `ID_PROMOTOR`, `NOME_FANTASIA`, `CHECKIN_TIME`
- `camelCase` para constantes UI: `statusConfig`, `borderColorMap`

### Types/Interfaces

- `PascalCase`: `Promotor`, `RotaPromotor`, `CampanhaPerguntas`, `OficinaAPI`
- Props com sufixo `Props`: `OficinaCardProps`, `CheckinFormProps`, `RouteCarouselProps`
- API responses com sufixo `Response`: `CampanhaAtivaResponse`, `CampanhaDetalheResponse`
- Enums no backend: `PascalCase` — `StatusRota`, `TipoPergunta`, `RedirectRota`

## Code Organization

### Import/Dependency Declaration

**Frontend — ordem observada:**
```tsx
// 1. "use client" directive
"use client";
// 2. React imports
import React, { useState, useCallback, useEffect } from "react";
// 3. Types
import type { RotaPromotor, CampanhaPerguntas } from "@/lib/types";
// 4. Internal libs/hooks
import { useAuth } from "@/lib/auth-context";
// 5. Services
import { getCampanhaAtiva } from "@/service/campanha.service";
// 6. Components
import { Button } from "@/components/ui/button";
// 7. Icons
import { Loader2, MapPin } from "lucide-react";
```

**Backend — ordem observada:**
```ts
// 1. External packages
import express from "express";
import { z } from "zod";
// 2. Internal modules (relative paths)
import { campanhaService } from "../service/campanhaService";
import { createDocumentedRoute } from "../utils/routeDocumentation";
// 3. Schemas
import { createCampanhaBodySchema } from "../schemas/campanha";
```

### File Structure

**Componentes Frontend:** Cada arquivo exporta uma única função componente. Named exports (não default).
```tsx
export function OficinaCard({ rota, onNavigate, ... }: OficinaCardProps) { ... }
```

**Controllers Backend:** Objeto singleton exportado com métodos.
```ts
export const campanhaController = {
  async getCampanhaAtiva(req, res) { ... },
  async createCampanha(req, res) { ... },
};
```

**Services Backend:** Instância única exportada da classe.
```ts
class CampanhaService { ... }
export const campanhaService = new CampanhaService();
```

## Type Safety/Documentation

**Frontend:** TypeScript strict mode. Types centralizados em `lib/types.ts`. Usa `type` (não `interface`) para a maioria dos tipos de dados (exceto AuthContextType). Props são `interface`.

**Backend:** TypeScript strict (com `strictPropertyInitialization: false` por causa do TypeORM). Schemas Zod como source of truth para validação. Entities usam decorators TypeORM.

## Error Handling

**Frontend:** `try/catch` em services + fallback silencioso. Hook `useAsyncAction` captura erros e expõe `feedbackState: "error"`. `ApiError` custom com status code.

**Backend:** Controllers envolvem lógica em `try/catch`, retornam `res.status(500).json({ message, error })`. Middleware `validateSchema` retorna 400 com detalhes de erros Zod.

## Comments/Documentation

**Frontend:** Comentários em português sobre lógica de negócio:
```tsx
// Verifica se já existe um usuário salvo no localStorage ao carregar a aplicação
// Mensagem genérica por segurança
```

**Backend:** Docs extensivos em `docs/` (markdown). JSDoc mínimo inline. Comentários em português misturados com inglês.

## API Convention

- Campos do banco/API sempre em `UPPER_SNAKE_CASE`
- Frontend normaliza para `camelCase` nos types internos (ex: `OficinaAPI.NOME_FANTASIA` → `Oficina.nome`)
- A normalização acontece em `campanha.service.ts` com `normalizeRota()`
