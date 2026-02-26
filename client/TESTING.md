# Testing Strategy (client)

Le frontend suit une stratégie à deux étages : tests unitaires (composants/logic) et tests end-to-end.

## Tooling
- Unitaires: Vitest + Testing Library (React, user-event, jest-dom) avec jsdom. Vitest exclut `e2e/**` pour éviter de mélanger les runners.
- Couverture: V8 via `npm run test:coverage` (HTML + lcov + résumé texte dans `coverage/`).
- End-to-end: Playwright (`npm run e2e`) avec démarrage auto du dev server.

## Commands
- Install deps: `npm install` (run once).
- Unit + integration (CI-friendly): `npm run test`.
- Watch mode: `npm run test:watch`.
- Coverage: `npm run test:coverage`.
- End-to-end headless: `npm run e2e`.
- End-to-end inspector UI: `npm run e2e:ui`.
- First run Playwright browsers: `npx playwright install --with-deps` (only once on a new machine/CI image).

## Lignes directrices – Unitaires
- Tests dans `src/__tests__/`.
- Setup commun: `src/test/setup.ts` (matchers jest-dom, cleanup, reset localStorage).
- Privilégier les sélecteurs orientés utilisateur (`getByRole`, `getByLabelText`).
- Mocker uniquement au bord API (`api/client`) pour simuler les réponses, pas d’accès direct à axios.
- Assertions sur le comportement (ce que l’utilisateur voit/reçoit), pas de snapshots de structure DOM.

## End-to-End Guidelines
- Config: `playwright.config.ts` uses a dev server on port 4173 with baseURL `http://localhost:4173` and Chromium desktop profile.
- Tests live in `e2e/`. Example flow: `e2e/auth-flow.spec.ts` stubs backend routes (login, me, authors, books) so UI can be exercised without a real API.
- Use `page.route` to intercept backend calls instead of hitting live services; keep fixtures close to tests.
- Keep e2e assertions high-level (visible text, navigation, critical CTAs). Add traces on first retry already configured.

## Writing New Tests
1) Decide the layer: component behavior → unit; multi-component with mocked API → integration; full page with routing and network stubs → e2e.
2) Co-locate fixtures inside the test file unless reused broadly; keep them small and explicit.
3) When adding new API methods, mock them at `api/client` in integration tests; avoid mocking axios directly.
4) For forms, assert both happy-path (calls handlers with payload) and error-path (validation messages, disabled states).
5) Keep tests independent; rely on the shared cleanup in the setup file and avoid cross-test state.

## Reporting
- Coverage reports output to `coverage/` (HTML in `coverage/index.html`).
- Playwright artifacts (traces) are stored under `playwright-report/` when failures occur.
