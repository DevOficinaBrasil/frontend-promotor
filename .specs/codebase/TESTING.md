# Testing Infrastructure

## Test Frameworks

**Backend:**
- **Unit/Integration:** Jest 30.0.5 + ts-jest 29.4.1
- **HTTP Testing:** Supertest 7.1.4
- **Coverage:** Jest built-in (`jest --coverage`)

**Frontend:**
- **Nenhum framework de teste configurado.** Não há `jest`, `vitest`, `testing-library` ou `cypress` nas dependências.

## Test Organization (Backend)

**Location:** `__tests__/`
**Naming:** `*.test.ts`
**Structure:** Separação unit / integration em subpastas

```
__tests__/
├── unit/
│   ├── campanhaService.test.ts
│   ├── campanhaPerguntasService.test.ts
│   ├── campanhaResultsService.test.ts
│   ├── promotorService.test.ts
│   └── rotaService.test.ts
└── integration/
    └── duckdb.test.ts
```

## Testing Patterns

### Unit Tests (Backend)

**Approach:** Mocking do DataSource TypeORM via `__mocks__/data-source.ts`.
**Mock:** `jest.fn()` no `getRepository` para simular retornos do banco.

```ts
// __mocks__/data-source.ts
export const AppDataSourceSync = {
  getRepository: jest.fn()
}
```

**Padrão observado:** Cada service é testado isoladamente. O repository é mockado com `jest.fn()` retornando os métodos TypeORM (`find`, `save`, `findOne`, etc.).

**Cobertura por service:**
- `campanhaService.test.ts` — CRUD, campanha ativa, link/unlink promotor
- `campanhaPerguntasService.test.ts` — CRUD perguntas
- `campanhaResultsService.test.ts` — Salvar resultados, buscar por rota/campanha
- `promotorService.test.ts` — CRUD, login, link campanha
- `rotaService.test.ts` — Criar rota, atualizar opções, geolocation

### Integration Tests (Backend)

**Approach:** Teste do client JSON de oficinas (substituto do DuckDB).
**Location:** `__tests__/integration/duckdb.test.ts`
**Conteúdo:** Valida carregamento e busca de dados no cache JSON de oficinas.

## Test Execution

**Commands:**
```bash
npm test                        # Roda todos os testes
npm run test:watch              # Watch mode
npm run test:coverage           # Com relatório de cobertura
npm run test:unit               # Apenas unit tests
npm run test:integration        # Apenas integration tests
npm run test:unit:watch         # Unit em watch mode
npm run test:unit:coverage      # Unit com coverage
npm run test:integration:watch  # Integration em watch mode
npm run test:integration:coverage # Integration com coverage
```

**Configuration (jest.config.ts):**
```ts
{
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  clearMocks: true,
  verbose: true,
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  coveragePathIgnorePatterns: ["entities", "data-source.ts", "utils"]
}
```

## Coverage Targets

**Current:** Não documentado formalmente
**Coverage ignora:** Entities, data-source.ts, utils (declarado em `coveragePathIgnorePatterns`)
**Enforcement:** Nenhum threshold obrigatório configurado

## Gaps

- **Frontend sem testes** — Nenhuma infraestrutura de testes configurada
- **Sem testes E2E** — Playwright está instalado no backend mas é usado para web scraping (bots), não para E2E testing
- **Controllers não testados** — Apenas services possuem testes unitários
- **Sem CI/CD de testes** — Não há GitHub Actions ou pipeline de testes automatizado visível
