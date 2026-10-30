# Self Assessment Assistant (2025–26)

A personal, **local-only** helper for estimating a UK Self Assessment return for
the 2025–26 tax year (PAYE employment + simple sole-trader income).

- It does **not** submit anything to HMRC.
- Documents and financial data are processed **on your device only**. No cloud
  OCR, AI, analytics, bank APIs or cloud storage.
- It is **not** tax advice. Estimates must be checked against HMRC's own calculation.

> **Status: Phase P0 (scaffold).** The app is a placeholder navigation shell.
> Nothing is stored or calculated yet. Do not enter real information.

Project specification: [`CLAUDE.md`](CLAUDE.md), [`docs/MASTER_SPEC.md`](docs/MASTER_SPEC.md),
[`docs/BUILD_PROMPTS.md`](docs/BUILD_PROMPTS.md), [`docs/TAX_SOURCES.md`](docs/TAX_SOURCES.md).

## Commands

Requires Node.js 22+ (see `.nvmrc`). These run in a Claude Code cloud session or in GitHub Actions; no local install is needed on iPad.

| Command | What it does |
| --- | --- |
| `npm ci` | Install the exact dependency versions from `package-lock.json` |
| `npm run dev` | Start the local development server (cloud `localhost` is not reachable from iPad Safari) |
| `npm run typecheck` | TypeScript strict type-check |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run test` | Unit, UI and guardrail tests (Vitest) |
| `npm run build` | Type-check and produce static files in `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | All of the above checks in order |

GitHub Actions runs type-check, lint, tests and build on every pull request (`.github/workflows/ci.yml`).

## Project layout

```text
docs/                 specification (read before coding)
src/app/              app shell and step navigation
src/components/       shared accessible components
src/features/<area>/  setup, screening, documents, bank-import, transactions,
                      mileage, tax, filing, backup (filled in by later phases)
src/db/               IndexedDB schema and migrations (P2)
src/domain/           shared types such as the tax year
src/test/fixtures/    SYNTHETIC test data only
tests/guardrails/     repository-wide privacy and safety checks
```

## Built-in guardrails

- **ESLint** blocks `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`,
  `navigator.sendBeacon`, `console.log`, `dangerouslySetInnerHTML` and `innerHTML`
  assignment in `src/`.
- **Guardrail tests** fail if analytics/AI/cloud/banking packages are installed,
  if any dependency is not pinned to an exact version, if app source or
  `index.html` references a remote URL (official `gov.uk` links excepted), or if
  `.gitignore` stops protecting personal files.
- **`.gitignore`** excludes PDFs, images, CSV/bank exports, spreadsheets, archives,
  backups/exports and `.env` files everywhere, except synthetic fixtures in
  `src/test/fixtures/`, `e2e/fixtures/` and app icons in `public/icons/`.

## Data safety

Never commit or paste real P60s, P45s, bank statements, receipts or screenshots
into this repository or a Claude Code session. Use fabricated data for development.
