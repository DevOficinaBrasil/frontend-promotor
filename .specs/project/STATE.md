# State

**Last Updated:** 2026-04-07
**Current Work:** Project initialization — brownfield mapping + project setup

---

## Recent Decisions (Last 60 days)

### AD-001: Manter arquitetura SPA single-page no frontend (2026-04-07)

**Decision:** Frontend opera como SPA com uma única page.tsx e renderização condicional
**Reason:** Já implementado e funcional assim. App mobile-first simples com poucos fluxos
**Trade-off:** Não aproveita routing do Next.js App Router, code splitting por rota
**Impact:** Qualquer nova "tela" é um estado/modal dentro de HomeScreen

---

## Active Blockers

_Nenhum blocker ativo._

---

## Lessons Learned

_Nenhuma lesson registrada ainda._

---

## Quick Tasks Completed

| #   | Description | Date | Commit | Status |
| --- | ----------- | ---- | ------ | ------ |

---

## Deferred Ideas

- [ ] Migrar JWT de localStorage para cookie HttpOnly (ver CONCERNS.md SEC-01) — Captured during: brownfield mapping
- [ ] Remover `errorChance` do useAsyncAction em produção (CONCERNS.md DEBT-05) — Captured during: brownfield mapping
- [ ] Criar endpoint batch para salvar resultados de pesquisa (CONCERNS.md PERF-02) — Captured during: brownfield mapping
- [ ] Extrair HomeScreen em hooks menores (CONCERNS.md FRAG-01) — Captured during: brownfield mapping
- [ ] Resolver config duplicada next.config.ts / next.config.mjs (CONCERNS.md DEBT-01) — Captured during: brownfield mapping

---

## Todos

- [ ] Definir estratégia para ordenação de rotas por supervisor (feature v1.1)

---

## Preferences

_Nenhuma preferência registrada._
