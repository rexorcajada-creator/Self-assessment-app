# Claude Code project instructions — Self Assessment Assistant

Read `docs/MASTER_SPEC.md` before coding. Follow `docs/BUILD_PROMPTS.md` in phase order.

## Product and scope
- Personal UK Self Assessment helper for tax year **2025–26**.
- Initial calculation scope: straightforward PAYE employment and UK sole-trader income; E/W/NI standard non-savings income path. Other material tax facts must be screened and flagged as unsupported until implemented/tested.
- Guided upload-first UI; locally processed PDFs, images and bank CSVs; manual correction and classification review; tax estimate with explicit assumptions; copyable HMRC boxes; PDF; encrypted export/restore.
- **No HMRC submission, no bank API, no cloud storage, no analytics, no external OCR or AI data processing.**

## Hard constraints
1. Never send document text, bank records, employment records or financial inputs to any server. No model API calls in application code. Bundle OCR data locally rather than using Tesseract's CDN defaults.
2. Do not use real personal records as development fixtures. Do not ask owner to paste personal records into Claude Code. Assume Claude Code itself can read and transmit files in its working context.
3. Never claim that the working IndexedDB data is encrypted at rest: user chose no app login. Only backups must be passphrase-encrypted. Add clear UI disclosure and storage-loss warning.
4. Original uploads are stored as Blobs locally. Never put them in service worker public asset caches or source control.
5. Uncertain bank transactions, receipts, extracted fields and mileage entries must be excluded until user approval. Every amount must preserve provenance and corrections.
6. Tax computation is a **pure, deterministic, separately tested module** using a versioned 2025–26 rules file, precise amounts, HMRC-specific rounding, independent fixtures and official references. Do not guess tax law or box mappings.
7. If a material unsupported tax condition exists, clearly label estimate provisional and include assumptions. Do not label filing-ready; still allow provisional estimate/export with warnings.
8. Show total liability, PAYE tax deducted, balancing payment, **2025–26** past payments on account, and **2026–27** future instalments separately.
9. Follow user preference for build sequence: **documents/import/review UX first, tax engine after**. During early phases use clearly marked mock figures.
10. Make UX mobile-friendly, accessible and minimal. Prefer robust manual fallback to unreliable automation.

## Technical defaults
React + TypeScript + Vite + PWA, IndexedDB, local PDF.js, locally bundled Tesseract.js, CSV adapter, pure TS tax engine, on-device PDF export and Web Crypto authenticated encrypted backup. Vitest/Testing Library/Playwright. Prefer small, boring, well-maintained dependencies; pin versions with lockfile.

## Execution contract for each phase
- Begin by naming phase, goal, files expected to change, risks and test plan in 3–6 lines.
- Implement **only the phase requested**, preserving earlier working functionality.
- Add/run unit and integration tests; run type-check/build/lint when configured.
- Do not fabricate passing test results. If a command cannot run, show error and specific remediation.
- Use synthetic fake documents/transactions and never log original document content.
- At end supply: changed files; what works; test commands and outcomes; how to manually check; known limitations; recommendation for next phase.
- Pause at the phase boundary for the user's review.

## First response after initial prompt
Read the spec and summarise the ten most important constraints. Propose the P0 plan. Then scaffold only if asked by the user or if the supplied phase prompt authorises it.
