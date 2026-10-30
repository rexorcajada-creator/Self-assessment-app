# Claude Code — Copy-and-Paste Development Prompts

**Read this file together with** `CLAUDE.md`, `docs/MASTER_SPEC.md`, and `docs/TAX_SOURCES.md`.

## How to use these prompts

1. On **iPad Pro**, follow `IPAD_SETUP.md`. Open `https://claude.ai/code` (or Claude app Code tab) and select the **private GitHub repo**.
2. Paste **one numbered prompt** below into a Claude Code cloud session. Phase P0 must first scaffold the Vite app in the repository root.
3. Ask Claude Code to run `npm run` checks **in the cloud**, push a branch and prepare a pull request. No local iPad terminal is required.
4. Review and **merge the PR** into main when the phase passes its tests. Then start the next phase from updated main.
5. Once deployed as a static preview (suggested after P1), open the preview URL in iPad Safari for manual checks. The cloud `localhost` URL is not accessible directly from Safari.
6. Fix failing tests **before starting the next phase**. Use only fabricated financial data during development. Never paste real records into the cloud session or commit them to GitHub.

The user specifically chose **upload/document experience first, then tax calculation**. Early tax screens may use synthetic demo figures only and must clearly say so.

---

## Prompt 0 — Set up project, rules and checks

```text
I am new to Claude Code. Please read CLAUDE.md, docs/MASTER_SPEC.md, docs/BUILD_PROMPTS.md and docs/TAX_SOURCES.md first.

Implement ONLY Phase P0. This repository might contain only documentation, because I am starting on an iPad Pro with Claude Code cloud sessions. If no Vite React TypeScript scaffold exists, CREATE it at the repository root, preserving CLAUDE.md and docs/. Explain in plain English what you will do. Set up a clean feature-based source directory, navigation shell placeholders, TypeScript strict mode, ESLint, a basic Vitest setup, test scripts, and .gitignore rules preventing sensitive documents, bank files, backup archives and local exports from being committed. Use synthetic fixtures only. Do not install any cloud document, telemetry, AI or banking SDK. Add an initial README command summary if needed.

Before editing, tell me the files you expect to change. Then implement and run type-check, lint, build and unit tests. If something fails, fix it. Stop at the end of P0, report exact commands/tests run in the cloud and create a branch/PR. Do not claim that a cloud localhost URL works in Safari; a hosted static preview is added after P1. Do not start P1.
```

**Check yourself:** Claude can run `npm run dev` in the cloud (not directly on iPad); `npm run build` succeeds; `npm run test` works; `.gitignore` excludes real data. If Node packages or script names differ from expected, Claude must document what it actually configured.

---

## Prompt 1 — Guided UI and responsive shell

```text
Implement ONLY Phase P1, based on docs/MASTER_SPEC.md. Build a polished, clean, accessible responsive UI for desktop and mobile with a large “Start my tax return” button, a 2025–26 year label, a progress stepper, Resume and Restore Backup placeholders, and the nine user journey screens as navigable layouts. Show clear privacy language: all real document processing will run locally; local working records will not be application-encrypted. Include step titles, back/next handling, loading/empty/error states, and keyboard support.

Do not implement tax calculations yet. Any tax figures shown must be conspicuously labelled SYNTHETIC DEMO. No external fonts, scripts, tracking or images. Keep it a static React PWA candidate, not a backend app. Add UI tests for navigation and refresh. Run all checks, show me how to inspect it and stop at P1.
```

**Check yourself:** Desktop screen and simulated phone view work; Back does not lose state; “Start” leads to uploads; no misleading real tax results.

---

## Prompt 2 — Local document library

```text
Implement ONLY Phase P2: local original-document storage. Use IndexedDB, with a typed schema and migrations. Add upload for PDF/JPG/PNG/WEBP/CSV. Preserve the original Blob locally and metadata: tax year, hash, file name, MIME type, size and timestamp. Add per-file preview, remove, duplicate identification, unsupported file error and storage-quota error. Accept real-world filenames but use SYNTHETIC files for tests. Include validation and sensible file size limits and prevent malicious file text from entering HTML unsanitised.

Critical rule: never upload a document or its content to a remote service. No POST endpoints, cloud OCR, analytics, external scripts or runtime CDNs. Give an offline-capable verification test and a clear local-storage-is-not-encrypted warning. Add persistence and duplicate tests. Run lint, types, tests and build. Stop at P2.
```

**Check yourself:** A fake PDF/image/CSV stays available after browser refresh; import same file again gets a duplicate warning; automated browser network tests show no document-content upload requests (iPad Safari has limited developer tools).

---

## Prompt 3 — On-device PDF extraction / image OCR

```text
Implement ONLY Phase P3. On uploaded text PDFs, extract text with a locally bundled PDF.js worker. For scanned PDFs/images, use local Tesseract.js workers, trained language data and WASM assets that are ALL served from the app itself, including when offline. Absolutely no CDN fallback, cloud OCR or remote model calls. Show extraction progress, cancel/retry and a user-friendly failure explanation. Start with a limited P60/P45 amount and employer-field extractor, but do not guess or automatically finalise ambiguous values.

Build a preview that displays an original (or page) alongside proposed fields, including source/page and confidence/evidence where available; provide edit/confirm controls. Record original OCR text separately from corrected canonical values. Ensure duplicate P45/P60 employment values are flagged, not blindly summed. Add synthetic text-PDF and screenshot tests plus an offline network test. Provide automated cross-browser tests where feasible, and guide an actual check in iPad Safari against a deployed static preview; describe mobile limitations. Run checks and stop at P3.
```

**Check yourself:** Text-based PDF works; synthetic blurry image generates an editable low-confidence field; no OCR network call appears; documents can still be accessed offline.

---

## Prompt 4 — CSV import, classification and review queue

```text
Implement ONLY Phase P4. Build a flexible local bank CSV column mapper and ONE proven bank-format adapter first. Candidate formats for eventual presets are Monzo and NatWest, but do not assert format support without representative SYNTHETIC fixtures matching their real exported column structures. Add a second adapter only if straightforward and tested. Parse dates as UK dates where required, distinguish credits and debits, and filter strictly 6 April 2025 to 5 April 2026.

Classify with transparent deterministic local rules into trading income, potential business expense, personal, transfer, refund, duplicate or unknown. Do not use cloud AI or claim classifier accuracy. Automatically flag uncertain transactions in a review queue and EXCLUDE them from the approved ledger/tax result until the user explicitly approves. Detect duplicate CSV imports and double-count risks between accounts/receipts. Add per-item category/approval edit and an explanation for each suggestion. Tests must include salary mistaken for trading income, internal account transfers, overlapping exports, reversed refunds and boundary dates. Run checks and stop at P4.
```

**Check yourself:** Import 10 synthetic lines; transfers and payroll do not become sole-trader turnover; ambiguous Uber remains excluded; duplicate import changes no totals.

---

## Prompt 5 — Manual records, expenses and mileage

```text
Implement ONLY Phase P5. Add manual entry for PAYE figures, trading income, expense items/annual expense totals and vehicle journeys with source links. For expenses collect description, date, amount, business-use percentage, user-approved status and evidence reference. Provide a journey form for date, vehicle, business purpose and business miles. Use a versioned 2025–26 rate table but do NOT yet build the main Income Tax engine.

Implement exact 2025–26 self-employed simplified vehicle mileage (car/van first 10,000 qualifying miles at 45p, over 10,000 at 25p, motorcycle 24p), with a warning that the journey must genuinely be business travel and that mileage cannot be combined with actual costs for the same vehicle. Do NOT use the 2026–27 55p rate. Treat meal, petrol and taxi eligibility as uncertain until user review. Add validation, explainable expense categories, receipt linkage, and tests for mileage thresholds and personal vs approved travel. Run checks and stop at P5.
```

**Check yourself:** A journey is excluded until approved; 10,001 eligible car miles calculates £4,500.25 before other eligibility adjustments; user can edit/discard costs.

---

## Prompt 6 — 2025–26 tax calculation engine (CRITICAL)

```text
Implement ONLY Phase P6 and treat it as a high-risk correctness task. Review docs/TAX_SOURCES.md and the HMRC 2025–26 SA110 tax calculation notes BEFORE implementing formulas. Create a pure TypeScript tax engine with no React, OCR or IndexedDB dependencies. It should accept canonical approved records and versioned rules and return a typed, explainable result with issue codes and source provenance. Use integer pence plus reviewed exact arithmetic/rounding, not ordinary floating-point calculations for tax money.

Supported v1: straightforward E/W/Northern Ireland UK-resident employment PAYE and eligible sole-trader earnings only. Apply 2025–26 Personal Allowance £12,570, taper above £100,000 adjusted net income, 20%/40%/45% ordinary non-savings rates, Class 4 at 6% between £12,570 and £50,270 and 2% above, Class 2 small profits threshold £6,845 with optional voluntary handling (never auto-charge), and eligible trading allowance vs actual expense deduction (never both). Do NOT silently treat unsupported income, Scottish residence, tax benefits, pensions, loans, coding adjustments, losses or other reliefs as zero: generate explicit material warnings and a provisional result.

Handle PAYE deducted tax, confirmed prior 2025–26 HMRC payments on account/credits, estimated 2025–26 balance, and test eligibility plus projected 2026–27 payments on account for 31 Jan/31 Jul using HMRC guidance (including <£1,000 and >80% exceptions). Separate gross tax liability from balance payable. Include synthetic fixtures independently worked against HMRC's 2025–26 notes; tests for £40k PAYE + £1.4k trading receipts + £250 approved expenses where eligible £1k trading allowance yields £80 extra ordinary-rate income tax; trading allowance vs £1,200 costs; band limits; PA taper; Class 4; mileage already handled; POA; special/out-of-scope cases. If you cannot validate a rule, mark it TODO/provisional and do not call the calculation filing-ready.

Run tests, types, lint and build. Give me a detailed tax engine test summary and stop at P6.
```

**Check yourself:** Tax engine has substantial independent unit tests with hard-coded verified expected outputs; UI still labels incomplete situations provisional; Class 4 is on relevant sole-trader profits, not PAYE plus self-employment.

---

## Prompt 7 — Detailed result dashboard and HMRC box map

```text
Implement ONLY Phase P7. Connect reviewed canonical inputs to the tested tax engine and build an accessible detailed dashboard. Display separately total Income Tax and Class 4, PAYE tax already deducted, estimated 2025–26 SA liability, previously allocated 2025–26 payments on account, resulting balance/refund, first 2026–27 estimated payment on account due 31 Jan 2027, and second due 31 Jul 2027. Never conflate these figures. Display clear support-status labels and material assumptions.

Create a versioned 2025–26 filing box map audited against SA102, SA103S, SA110 and relevant SA100 notes. Cover SA102 employment per employer (boxes 1,2,4,5) and SA103S turnover (9), other income (10 if any), allowance (10.1), relevant expense boxes/total (20), profits (21/28/31); map other boxes ONLY if verified against official notes. Provide copy buttons, exact field labels and source drilldown. Warn that online HMRC screen sequence may differ from PDF form box numbering. Provide a review checklist and unresolved issues list, not a one-click tax filing feature. Use synthetic fixture E2E tests. Run checks and stop at P7.
```

**Check yourself:** Changing an approved expense updates calculation and traceable HMRC figure; source doc is accessible; unresolved out-of-scope answer retains provisional badge.

---

## Prompt 8 — PDF filing guide and encrypted backups

```text
Implement ONLY Phase P8. Generate a local PDF filing guide with tax year, inputs, SA102/SA103S/SA110 box mappings, source/assumption notes, tax computations, prior HMRC payments and future estimate timeline. Mark the document clearly 'Provisional' if any material issue is unresolved. Everything must be rendered entirely on device.

Build full encrypted backup export and restoration, INCLUDING stored original document Blobs, all canonical records, audit trail, rules/schema versions and calculation status. Use Web Crypto AES-GCM authenticated encryption and a robust passphrase-derived key with unique per-export salt/nonce. Never save the passphrase. Validate schema and integrity before any destructive restore; support wrong password and corrupt archives cleanly, and avoid partial restoration. Include password strength information and backup recovery warning. Ensure backup files are .gitignored. Add export/restore roundtrip tests with actual synthetic Blobs and verify exact reconstructed tax result. Run checks and stop at P8.
```

**Check yourself:** PDF exports with correct clearly provisional/ready label; encrypted backup cannot be opened without passphrase; restore recovers fake P60 and matching calculation; wrong passphrase changes nothing.

---

## Prompt 9 — Offline PWA, mobile polish, privacy tests and release audit

```text
Implement ONLY Phase P9. Make the app an installable, offline-capable responsive PWA with a correctly scoped service worker caching only versioned public app assets and OCR runtime assets, NEVER personal documents or IndexedDB content. Prove all OCR and app interactions work while the network is disabled after initial installation. Show clear warning about mobile Safari/browser storage eviction and require a verified backup prompt before users rely on local data.

Audit the full threat model in docs/MASTER_SPEC.md. Add network intercept tests that fail for any document/financial-content outbound requests, runtime OCR CDN, analytics or unexpected remote resource. Add accessibility/keyboard/mobile tests, loading/error states, data quota and delete-record handling, backups across version migrations, and tests against synthetic corrupted files. Verify routes, rates, box mappings, HMRC links and all earlier phases. Do not claim accountant-grade reliability; report any unsupported tax facts or unverified examples. Run all test/type/lint/build checks and produce a release checklist of known limitations. Stop at P9.
```

**Check yourself:** Install on your device; toggle airplane mode; complete a synthetic test flow; PDF and backup both work; browser local storage clear loses unbacked data as warned.

---

## Prompt 10 — Independent tax and privacy review (before real data)

```text
Do a READ-ONLY final pre-use audit of this repository against docs/MASTER_SPEC.md, CLAUDE.md and official HMRC 2025–26 sources. Do not change code during this audit. Identify potential tax miscalculations, incorrect tax year rates, unverified box mappings, duplicate PAYE records, trading allowance eligibility errors, payments-on-account issues, rounding discrepancies, possible cloud/network data leakage, backup/security weaknesses, device storage risks and missing tests. Give a prioritised blocker list, a reproducible test command for each risk and exact acceptance criteria. Distinguish proven test results from claims requiring external validation. Avoid any real personal records. When finished, stop and wait for my approval before fixing anything.
```

**Check yourself:** You have a concise list of known limitations and no critical unaddressed tax/privacy blockers before importing any real records.

---

## Troubleshooting prompts (non-sensitive errors only)

### Fix a failing phase

```text
The P[NUMBER] check failed. Here is the NON-SENSITIVE error message: [PASTE ERROR]. Diagnose the root cause, propose the smallest code change, fix it, rerun related tests and stop. Do not start a new phase and do not delete any data to hide the failure.
```

### Explain an unfamiliar command

```text
I'm new to Claude Code. Explain what this command does, why it is needed, which files it touches, whether it makes any network calls, and what I should expect. Do not execute anything until I approve.
```

### Recheck a specific HMRC rule

```text
Check the implemented rule [RULE ID] against the official HMRC 2025–26 document listed in docs/TAX_SOURCES.md. Show the year-specific source, exact formula, two independently worked numeric examples, which tests cover it and any unresolved interpretation. Don't change code until we've agreed the correct behaviour.
```
