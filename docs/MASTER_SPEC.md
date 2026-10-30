# Self Assessment Assistant — Master Product and Technical Specification

**Version:** 1.0 (planning baseline, 30 October 2026)  
**Initial tax year:** 2025–26 (6 April 2025 through 5 April 2026)  
**Owner:** single UK taxpayer, initially personal use only  
**Build tool:** Claude Code  
**Status:** Implementation specification, **not** finished tax software or professional tax advice

> **Goal:** Convert a small set of locally stored PAYE and sole-trader documents/transactions into a reviewable, traceable estimate of 2025–26 Self Assessment tax, copyable HMRC filing figures, a PDF filing guide and an encrypted backup — with the fewest questions possible.

## 1. Decision log — agreements from discovery

| Area | Decision |
| --- | --- |
| User | Single person initially; no SaaS/multi-tenancy |
| Return | 2025–26; PAYE employment and self-employment only |
| Workflow | Guided “Start my tax return”, uploads first, then calculation |
| Inputs | P60/P45, PDFs, screenshots, CSVs, receipts, manual figures and journeys |
| Extraction | Local-only; extract automatically; flag doubtful fields |
| Classification | Rule-based suggestions; uncertain items excluded pending confirmation |
| Bank support | Start with up to two formats; provisional candidates Monzo and NatWest; generic mapping fallback |
| Tax questioning | Short yes/no gate with conditional follow-ups and out-of-scope flags |
| Calculations | Breakdown with HMRC box references, Income Tax/NIC, prior payments and estimated upcoming instalments |
| Output | Copyable figures + downloadable PDF; manual HMRC submission only |
| Device | Responsive desktop and phone; primarily one device |
| Privacy | No external document processing; originals stored locally |
| Security | No app login/password; **working storage not application-encrypted**; encrypted exported backups |
| Delivery | Claude Code, beginner-friendly prompts, staged implementation |
| Sequence | Upload/document experience before tax calculations |

### Non-goals, explicitly excluded from v1

No HMRC submission/API integration; no open banking; no remote sync; no cloud AI/OCR; no paid backend; no analytics; no auto-filing; no multi-user accounts; no MTD-compliant digital record submissions; no comprehensive support for rental, investments, capital gains, foreign income, partnerships, trusts, complex residence, company directors' special arrangements, complicated losses/reliefs or unusual tax adjustments. **Do not silently treat these as zero**; detect and warn if possible.

### Quality priorities

1. **Accuracy over automation:** guesses cannot become tax facts without safeguards.
2. **Simplicity:** very small number of decisions for ordinary PAYE + side-income return.
3. **Privacy:** financial documents never leave the device in the released application.
4. **Explainability:** every filing figure has a derivation, rule year and source document/transaction.
5. **Recoverability:** tested encrypted export/import before the user relies on local storage.

## 2. Recommended architecture

### App type

Static, offline-capable **Progressive Web App (PWA)**, built with **Vite, React, TypeScript**. Deployable as static assets on a trusted HTTPS host or runnable locally on desktop. After install/asset caching it should work offline. Hosting serves code, **not** documents or tax records. Desktop is the recommended first production device because backups, filesystem access and OCR are more dependable; responsive phone usage is supported but device storage is independent.

### Stack

| Concern | Proposed implementation | Boundary |
| --- | --- | --- |
| UI | React + TypeScript, CSS with accessible components | Local client |
| Build | Vite + service worker/PWA plugin | Static files |
| Indexed storage | IndexedDB via `idb` or Dexie | Local browser origin |
| Schema validation | Zod or comparable runtime schema validation | Local |
| CSV parsing | Papa Parse / local custom parser | Local |
| Embedded PDF text | PDF.js with worker bundled locally | Local |
| Scanned PDF/image OCR | Tesseract.js + trained data/worker/WASM **bundled locally** | Local, no CDN |
| Calculation | Pure TS functions, integer pence / precisely specified decimal and HMRC rounding rules | Local, no ML |
| PDF output | Local client-side renderer (e.g. pdf-lib) | Local |
| Backup crypto | Web Crypto AES-GCM + random salt/nonce + memory-hard KDF if properly supported, otherwise reviewed PBKDF2 parameters | Local |
| Tests | Vitest + React Testing Library + Playwright | Synthetic data only |

**Important:** Default Tesseract.js configurations can download model data and binaries from a CDN. Override all paths and bundle those assets locally. Disable all externally fetched fonts, scripts, telemetry and untrusted images. A PWA service worker must not cache sensitive uploads in a publicly served asset cache.

### Separation of responsibilities

```text
PWA UI (screens/forms)
    ↓
Local file adapter → extraction pipeline → proposed data
    ↓                                    ↓
IndexedDB original documents       confidence + source references
    ↓                                    ↓
User review + approved canonical ledger/records
    ↓
Tax engine (pure, year-specific, no OCR or UI dependencies)
    ↓
Tax result + assumption/issue registry + HMRC mapping
    ↓
Dashboard / copyable output / PDF / encrypted backup
```

The **tax engine cannot call the document extraction engine**. Document extraction cannot set a transaction `approved=true`; approval is a distinct auditable user action. Manual edits must create a trace of old/new value, source and timestamp.

### Suggested repository structure

```text
self-assessment-app/
  CLAUDE.md
  docs/MASTER_SPEC.md
  docs/BUILD_PROMPTS.md
  docs/TAX_SOURCES.md
  src/
    app/                  # routes, step navigation, global status
    components/           # accessible shared components
    features/
      setup/
      documents/          # ingestion, local OCR, field proposals
      bank-import/        # adapters and column mapping
      transactions/       # review/approval, dedupe
      mileage/            # journeys, rates and travel review
      screening/          # yes/no questionnaire
      tax/                # year-specific rules, pure functions
      filing/             # HMRC mapping, copy, PDF
      backup/             # encrypted export/import
    db/                   # schemas, migrations, IndexedDB adapter
    domain/               # data types and schema validation
    test/fixtures/        # synthetic examples only
  e2e/
  public/ocr/            # locally bundled OCR model/assets, if licensing permits
  .gitignore
```

Use a simple state machine for flow transitions: `not_started → importing → reviewing → screening → provisional → ready_to_check → exported`. A return **must not** reach `ready_to_check` while unresolved issues materially affect the result. An estimate with unresolved issues can still be displayed with assumptions, because the user expressly wants a provisional estimate option.

## 3. Detailed user journey and screen requirements

### Screen 0 — Welcome / Start

- Large **Start my tax return** action; secondary **Resume return** and **Restore backup**.
- Explain “2025–26, local-only, not HMRC filing”.
- State no server receives uploaded documents. Disclose that working data is unencrypted within browser storage.
- Exit: user creates a 2025–26 draft or restores a verified backup.

### Screen 1 — Quick setup and screening (first pass, 60–90 seconds target)

Collect only: country of tax residence for UK rates (England / Wales / Northern Ireland / Scotland / outside UK), dates/tax year, whether PAYE employment and self-employment took place, number of jobs, and whether HMRC asked for a return. Business description and start/cessation date are only asked when necessary for SA103S. Default cash basis for sole trader but explain alternatives.

A compact yes/no screen for: P11D/payrolled benefits; student/postgraduate loans; personal pension contributions not fully covered in payroll; Gift Aid; savings interest/dividends/rental income/CGT; child benefit charge; foreign or Scottish taxes/residency; self-employment losses brought forward; CIS; multiple trades; PAYE coding adjustments/earlier-year tax owed; and any additional significant receipts. Positive answers trigger targeted follow-up or an explicit unsupported-case flag, **not** an unsupported calculation.

- Required state: `screeningAnswers`, `jurisdiction`, `sourceSelection`, `outOfScopeIssues`.
- Exit: basic profile captured; unresolved triggers recorded, not lost.

### Screen 2 — Upload documents

- Accept files: PDF, JPG, PNG, WEBP, CSV; optionally HEIC only after a proven on-device conversion strategy.
- Cards: **P60/P45**, **bank CSV**, **receipts**, **other screenshot**, **enter manually**.
- Batch import, progress, cancel, file size limits, duplicate-document detection by local content hash, clear validation errors.
- Each original stored as a Blob in IndexedDB with immutable id/hash/filename/type/import timestamp and associated tax year.
- Never upload files or call remote OCR; inform user if local storage quota is low.
- Exit: originals safely persisted or an explicit saving failure shown.

### Screen 3 — Extracted figures preview

- For P60/P45: employer identity, tax reference if present, employment pay and income tax deducted; multiple employment records supported. **P60 ‘In this employment’ rather than cumulative ‘previous employment’ figures where relevant**. Detect overlapping P45/P60 and require dedupe confirmation.
- For scanned documents: show source snippet/page location and OCR confidence where available. Review all critical monetary figures at least once in a consolidated confirmation screen; don't treat high OCR confidence as proof of correctness.
- For receipts: merchant, date, amount, potential category, original link. A receipt by itself is evidence of an expense, **not automatically an allowable deduction**.
- Mark failed/low confidence fields as unresolved with a manual edit option.
- Exit: user accepts or corrects essential extracted records; traceability maintained.

### Screen 4 — CSV import and classification

- Begin with 1–2 **confirmed** bank formats. Candidate presets: Monzo and NatWest; verify actual headers, encodings, date and sign conventions against **synthetic test copies** before claiming support.
- Generic CSV column mapper if preset unknown: date, description, amount or credit/debit, currency, reference. Dates should parse strictly and preserve day-month order. No automated currency conversion.
- Restrict 2025–26 received/paid transactions; offer a separate excluded-outside-year view.
- Classify by local deterministic rules with descriptions: likely self-employed income, possible expense, transfer, personal, refund, duplicate, unknown. No ML requirement in v1.
- **Never treat all incoming payments as trading revenue.** Exclude transfers, employer salary and refunds where appropriate; ask about business relevance.
- **Never treat all travel/spending as deductible.** Business eligibility depends on purpose and UK rules.
- Transaction status: `proposed` / `approved` / `rejected` / `needs_review`. Only approved amounts enter calculation; uncertain items stay in a review queue.
- Collision handling: duplicate bank exports, transfers between own accounts, payment/receipt corroborated by an uploaded receipt, and refunds; one economic event counted once.
- Exit: transactions either approved, rejected or clearly unresolved.

### Screen 5 — Expenses and journeys

- Manual totals or itemised entries with amount, date, supplier, description, business-use percentage, linked proof and review status.
- Expense categories align with SA103S: cost of goods, vehicle/travel, staff, premises, repairs, professional fees, finance charges, office, other.
- Journey form: date, origin/destination (optional), purpose, vehicle (car/van/motorcycle), distance in miles, business justification, paid/reimbursed amount, linked evidence. Only **qualifying business journeys** can be included; ordinary home-to-permanent-workplace travel is excluded unless actual facts meet an exception.
- Self-employed simplified mileage 2025–26: cars/vans **45p for first 10,000 eligible miles and 25p after**; motorcycles **24p/mile**. Rates are vehicle-specific and cannot be combined for the same vehicle with actual vehicle running-cost deductions. These differ from 2026–27 (55p first 10,000).
- No automatic approval of petrol, meals, Uber, accommodation, incidental snacks. Ask business purpose; overnight business-trip meals may qualify, ordinary food typically does not.
- Provide a comparison: **allowable actual expenses vs eligible trading allowance** (normally £1,000) and show the more favourable outcome without silently selecting an ineligible method.
- Exit: only approved, allowable entries/totals used.

### Screen 6 — Final questionnaire and reconciliation

- Show a checklist of missing facts. Ask exact confirmations only where necessary: P60 totals correct, different employers not double counted, cash basis eligibility, trading-allowance exclusions, receipts > £1,000 and self-assessment obligation, NI and tax coding details, tax previously paid to HMRC.
- If user says “Yes” to unsupported tax sources/reliefs, calculate with clearly stated **exclusions and assumptions** and label the result `PROVISIONAL — NOT FILING-READY`.
- Accept recorded 2025–26 payments on account and other HMRC account credits only when user enters amount, payment date, tax year allocation and description. Never infer HMRC account balance from bank transfers alone.
- Exit: supported case with required data or explicit provisional issues.

### Screen 7 — Tax calculation dashboard

Cards (different concepts): **2025–26 total tax liability**, **PAYE tax already deducted**, **2025–26 liability net of PAYE**, **previous 2025–26 payments on account/credits**, **estimated balancing payment or refund**, **provisional 2026–27 payment on account instalments**, **expected 31 Jan 2027 amount**, **expected 31 Jul 2027 amount**.

Expandable detailed breakdown: PAYE employment records; gross trading receipts; actual approved costs; trading allowance method; taxable sole-trader profit; Personal Allowance and taper; tax bands; Class 4 NIC; Class 2 status; adjusted tax; amounts collected at source; HMRC payments. Each line cites a source or rule-year and exposes calculation logic. Include `verified/provisional` status and unresolved list. Allow copy amounts individually.

Exit: transparent, reproducible calculation result generated from canonical approved data.

### Screen 8 — HMRC filing guide / PDF export

- Separate **Employment (SA102)** section per job, **Self-employment (SA103S)**, **Self Assessment main return (SA100)** checklist and calculation references (SA110 where applicable).
- For every applicable figure: HMRC section, **tax year**, box id, human-readable field name, value, method, supporting evidence and **Copy** button.
- Note that the online HMRC filing flow can differ from the paper-form boxes; use box mapping as a reference, not an assertion of a one-to-one screen sequence.
- Include a detailed “Before you submit” checklist; estimated payment timeline and **HMRC is authoritative for your account balance**.
- PDF generated on-device, with “provisional” watermark where unsupported facts exist.
- Export a machine-readable calculation JSON for debugging **only if explicitly chosen**, and warn that it contains private data.

### Screen 9 — Back up and finish

- **Export encrypted backup** with user-chosen passphrase; includes originals, records, approvals, assumptions and version metadata.
- **Restore** validates version, authentication tag, schema and file integrity before replacing data. Offer safe restore-to-new-draft rather than destructive overwrite where possible.
- Test export → remove test data → restore → compare checksums in automated tests.
- Show local retention and manual delete instructions. Warn that mobile browser storage can be purged and backups should be saved separately.

## 4. Input data model (reference, not final runtime code)

All monetary amounts stored internally as **integer pence** or a suitably reviewed exact decimal model. Do not use JS floating-point arithmetic for financial calculations. Date strings are explicit `YYYY-MM-DD` without timezone conversion. All records include tax-year id, IDs, timestamps, sources and validation status.

```ts
type TaxYearId = '2025-26';
type RecordStatus = 'proposed'|'needs_review'|'approved'|'rejected';
type DocumentKind = 'p60'|'p45'|'receipt'|'bank_csv'|'statement'|'other';
interface TaxReturn {
  id: string; year: TaxYearId; jurisdiction: 'england'|'wales'|'ni'|'scotland'|'other';
  status: 'draft'|'provisional'|'ready_to_check'|'exported';
  createdAt: string; updatedAt: string; schemaVersion: number;
  accountingBasis: 'cash'|'traditional'|'unknown';
}
interface SourceDocument {
  id: string; returnId: string; kind: DocumentKind; filename: string;
  mime: string; sizeBytes: number; sha256: string; originalBlob: Blob;
  importedAt: string; pageCount?: number;
}
interface ExtractedField {
  id: string; docId: string; fieldName: string; proposedValue: string;
  correctedValue?: string; confidence?: number; page?: number;
  evidenceText?: string; status: RecordStatus;
}
interface Employment {
  id: string; returnId: string; employerName: string; payeRef?: string;
  employmentPayPence: number; taxDeductedPence: number;
  periodStart?: string; periodEnd?: string; sourceDocumentIds: string[];
  status: RecordStatus;
}
interface Transaction {
  id: string; returnId: string; date: string; description: string;
  amountPence: number; bankImportId?: string; externalReference?: string;
  direction: 'in'|'out'; category: string; businessUsePercent: number;
  treatment: 'trading_income'|'potential_expense'|'personal'|'transfer'|'refund'|'other';
  status: RecordStatus; sourceDocumentIds: string[]; duplicateGroupId?: string;
  explanation?: string;
}
interface Journey {
  id: string; returnId: string; date: string; purpose: string;
  vehicleId: string; vehicleKind: 'car'|'van'|'motorcycle';
  businessMiles: number; reimbursedPence: number; status: RecordStatus;
  sourceDocumentIds: string[];
}
interface PreviousHmrcPayment {
  id: string; returnId: string; paymentDate: string; amountPence: number;
  allocatedTaxYear: TaxYearId|string; kind: 'payment_on_account'|'credit'|'other';
  confirmedByUser: boolean;
}
interface TaxIssue {
  id: string; severity: 'info'|'review'|'material'; code: string;
  description: string; assumedTreatment?: string; resolved: boolean;
}
interface CalculationResult {
  returnId: string; taxYear: TaxYearId; engineVersion: string;
  rulesVersion: string; calculatedAt: string; provisional: boolean;
  lines: Array<{id:string; amountPence:number; sourceIds:string[]; ruleId:string}>;
  issues: TaxIssue[];
}
```

Add separate tables for `ScreeningAnswer`, `ManualIncome`, `ExpenseItem`, `TaxRule`, `AuditEvent`, `ExportManifest`, and (optional) `FilingBoxMap`. Preserve provenance from expense → transaction/source → calculated line → HMRC figure. A corrected field must not overwrite raw OCR source content.

### Tax rule data files

A versioned file such as `src/features/tax/rules/2025-26.ts` defines numeric thresholds, jurisdiction coverage, HMRC source URLs and effective dates. This makes adding later tax years additive rather than changing hard-coded numbers everywhere. Tax calculation is pure and deterministic; any updating of rules requires tests and a new rules version.

## 5. Tax rules and 2025–26 implementation requirements

**All of the following are UK official 2025–26 source-based rules; validate final output against the official HMRC 2025–26 calculation notes before personal reliance.** Build a narrow validated tax engine; do not claim general-purpose Self Assessment accuracy.

### 5.1 Taxpayer eligibility and assumptions

- Full personal allowance and ordinary employment/self-employment income in **England/Wales/Northern Ireland** in a straightforward UK-resident case are the initial supported calculation path.
- Scotland has different non-savings rates/bands; flag Scotland/outside-UK as **not supported** until separately coded and tested. No accidental use of England rates.
- Multiple PAYE employers are supported as separate employment lines with their own P45/P60 figures.
- Special earnings, company benefits (P11D), savings interest, dividends, property, capital gains, reliefs, tax-code adjustments, student/postgraduate loans and complicated pension contributions require specific support or material-issue flags. **Unknown is not zero.**
- Trading-income gross receipts **over £1,000** generally trigger registration/reporting considerations. At or under £1,000 there can be full-relief exceptions and circumstances requiring a return. Show a check rather than absolute legal determination.
- SA103S applies only when eligible (including turnover under the relevant £90,000 threshold stated on the 2025–26 form); check eligibility in the app, else flag use of full pages.
- Cash basis is normally default from 2024–25. Include a choice/eligibility check; avoid silently applying cash basis to traditional accounts.

### 5.2 Income Tax — ordinary E/W/NI non-savings income

| 2025–26 parameter | Value |
| --- | ---: |
| Standard Personal Allowance | £12,570 |
| Adjusted net income threshold for allowance taper | £100,000 |
| Taper | £1 allowance lost per £2 adjusted net income over £100,000 |
| Basic rate | 20% of first £37,700 **taxable income** |
| Higher rate | 40% of taxable income above £37,700 up to £125,140 (taxable band boundaries depend on allowance; follow HMRC calculation) |
| Additional rate | 45% above the applicable threshold |

Do **not** simply add £125,140 to a taxable income band cutoff. Correctly handle Personal Allowance taper and band definitions according to HMRC tax computation. Pensions, Gift Aid and other adjustments may alter adjusted net income/band extension; if unsupported, mark calculation provisional.

### 5.3 Self-employed trading profit

1. Sum **approved** 2025–26 self-employment cash receipts, excluding transfers, salary receipts, refunded amounts counted elsewhere and duplicates.
2. Calculate allowable, approved business expenses, appropriately apportioned for private use and cash-basis eligibility.
3. If the individual is eligible for the **trading allowance**, compare the up-to-£1,000 allowance against actual deductions. **Never claim trading allowance and allowable business expenses together.** The trading allowance cannot create a business loss. Verify eligibility restrictions, especially payments from own/connected companies and certain employer/connected-party sources.
4. Identify other income, profit adjustments and prior losses as unsupported where necessary; do not implement automatic relief for loss cases until verified.
5. Compute taxable profit for the supported case and map to SA103S. Record the chosen method and alternatives.
6. Do not confuse gross revenue with profit for filing requirements or future MTD thresholds.

### 5.4 National Insurance

| 2025–26 parameter | Value |
| --- | ---: |
| Class 4 lower profits limit | £12,570 |
| Class 4 upper profits limit | £50,270 |
| Class 4 between limits | 6% |
| Class 4 above upper limit | 2% |
| Class 2 small profits threshold | £6,845 |
| Voluntary Class 2 weekly rate | £3.50 |

At/above the relevant small-profits threshold, Class 2 contributions can be treated as paid without a compulsory Class 2 charge; below it, voluntary Class 2 is optional and must **never be charged automatically**. If user requests voluntary Class 2, collect qualifying weeks and confirm special circumstances. **Class 4 is based on relevant self-employed profit, not combined PAYE salary and self-employed profit.** PAYE Class 1 NIC is not an extra income-tax line to be charged again by this engine.

### 5.5 Mileage, expenses and uncertainty

- For **2025–26 self-employed simplified vehicle expenses**: car/van business miles first 10,000 at **45p**, subsequent at **25p**; motorcycle at **24p**. Do not accidentally use 2026–27's 55p rate.
- The full deduction is subject to qualifying business journeys, vehicle history and incompatibility with certain other vehicle claims. No double counting mileage and fuel/maintenance for the same vehicle.
- Business travel may qualify; ordinary home-to-work journeys and personal travel do not. Some subsistence is allowable only in specified conditions. Do not auto-approve meals, Uber, petrol and parking based on merchant alone.
- Introduce `needs_review` on ambiguous purpose and require explicit approval.

### 5.6 Liability versus HMRC amounts payable

Calculate and display separately:

```text
2025–26 income tax on all supported taxable income
+ supported Class 4 NIC
+ any explicitly supported other Self Assessment liabilities (none by default)
= total computed 2025–26 liability (subject to screening)
- PAYE income tax deducted and any applicable source credits
= estimated 2025–26 Self Assessment liability before account payments
- confirmed payments on account allocated to 2025–26 and other confirmed credits
= estimated 2025–26 balancing payment / overpayment
+ estimated first 2026–27 payment on account (if required)
= estimated total payable 31 January 2027
estimated second 2026–27 payment on account → 31 July 2027
```

The above is a conceptual reconciliation. Implement exact payment-on-account rules and allowable credits from HMRC instructions rather than mechanically including all items in a single formula.

Generally 2 payments on account are due, half of the relevant prior-year liability each, on 31 January and 31 July. Exceptions include prior-year amount below £1,000 or over 80% tax already collected outside Self Assessment. Source: HMRC payments-on-account guidance. The app must show **whether** payments on account apply, their **basis**, the estimated **2026–27** instalments and a distinction between those instalments and **2025–26** balance. HMRC's account statement may include other credits, interest, debts and adjustments; the app cannot promise its estimate matches the amount actually demanded.

**Dates for this version:** potential 2025–26 balancing tax + first 2026–27 payment on account: **31 January 2027**; second 2026–27 payment on account: **31 July 2027**.

### 5.7 HMRC boxes (verified against official 2025–26 PDFs)

| Form | Box | Meaning / implementation note |
| --- | --- | --- |
| SA102 | 1 | Pay from **each** PAYE employment, from that employment's P45/P60 |
| SA102 | 2 | UK tax taken off pay in that employment |
| SA102 | 4, 5 | Employer PAYE reference and employer name |
| SA102 | 9–16 | Benefits; unsupported benefits must raise a flag, not be assumed absent |
| SA103S | 1 | Description of self-employed business |
| SA103S | 7, 8 | Accounts date and cash/traditional basis indicator |
| SA103S | 9 | Business turnover |
| SA103S | 10 | Other business income |
| SA103S | 10.1 | Trading allowance |
| SA103S | 11–19 | Allowable expense categories |
| SA103S | 20 | Total allowable expenses; only use **one** alternative to trading allowance |
| SA103S | 21 | Net business profit before relevant further adjustments |
| SA103S | 28 | Net business profit for tax purposes after applicable adjustments/allowance |
| SA103S | 31 | Total taxable profits from business (after applicable relevant adjustments) |
| SA103S | 36 | Voluntary Class 2 selection for profits below threshold, if chosen |
| SA110 | 1 / 2 | Total computed due / overpaid, subject to fuller HMRC computation |
| SA110 | 4 | Class 4 NIC due |
| SA110 | 4.1 | Class 2 NIC due, if applicable |
| SA110 | 10 / 11 | Reduction request / first 2026–27 payment on account (special handling) |

The app should also display SA100 return overview but **must not invent unverified SA100 box mappings**. For every figure exported: `form + taxYear + boxId + value + source + validationStatus`.

### 5.8 Rounding

Store raw money as integer pence. Preserve precise calculations internally with validated rational/decimal operations, and implement HMRC's specific treatment of tax-return entry rounding and calculation rounding for the relevant form/working sheet. **Do not add a generic “round everything to pounds” shortcut.** Tax result tests must distinguish display-only formatting from statutory rounding.

## 6. Validation, quality and test plan

### Layer A — data ingestion tests

- Empty/corrupt PDF, image, unsupported file, MIME mismatch, huge file, duplicate upload, password-protected PDF, corrupt CSV and bank CSV with malformed date.
- PDF with embedded text vs screenshot requiring OCR. OCR not exceeding local time/memory budget; allow cancel/retry/manual edit.
- Offline tests prove OCR engines and trained data load without external network.
- Bank tests for positive/negative signs, debit/credit columns, refunds, double-imports, false business income, tax-year boundaries (5 April/6 April), and misleading CSV descriptions.

### Layer B — ledger and approval tests

- Uncertain expense stays excluded from all calculations.
- `rejected` excluded; only `approved` included.
- Receipt and bank transaction linked without double counting.
- P45 + P60 of same employment never blindly summed; employer records separately identifiable.
- Source deletion shows effect on dependant calculations; restored backup has identical canonical result.
- Manual edits change visible audit trail and cause calculation invalidation.

### Layer C — tax engine unit tests (synthetic only)

1. **Basic example:** PAYE earnings £40,000, income tax deducted £5,486, sole-trader receipts £1,400, eligible actual costs £250. Choosing eligible £1,000 trading allowance yields taxable trading profit £400 and **£80 estimated incremental Income Tax** under the ordinary E/W/NI 20% band, assuming no other circumstances. No Class 4 due. This is a controlled fixture, not a personal estimate.
2. Same facts but actual costs £1,200 → actual-cost profit £200, expected incremental ordinary-rate Income Tax £40; compare alternative methods.
3. Sole-trader profit £15,000 (and no other income): Class 4 = `(15,000 − 12,570) × 6% = £145.80` before relevant rounding; test total income tax separately.
4. Income just below / at / above £12,570 and £50,270 for Class 4; and £6,845 for Class 2 status.
5. PAYE and sole-trader profits straddle 20/40% Income Tax boundary; do not use total pay for Class 4 NIC limits.
6. Personal Allowance taper around £100,000–£125,140, with nontrivial band handling.
7. Gross trading receipts £999, £1,000, £1,001; do not use net profit to decide trading-allowance/registration messaging.
8. Exclude an expense with unknown purpose; approval changes tax immediately and audibly.
9. POA scenarios: £999 and £1,001 relevant liability; 80% already paid outside Self Assessment; 2025–26 prior POA credits; refunds and overpayments.
10. Mileage 9,999, 10,000 and 10,001 miles; compare 2025–26 45p to 2026–27 55p and assert 2025–26 is used.
11. Scottish/out-of-scope answer produces `PROVISIONAL` with exclusion disclosure, **not an England-rate filing-ready result**.
12. Double counted P60/P45 produces an error rather than a tax result silently incorporating both.

Compare test fixtures with the **SA110 2025–26 calculation notes/working sheet** and independently computed cases. Document accepted differences (e.g. rounding and unsupported reliefs). Avoid basing expected outputs on the same function under test.

### Layer D — privacy, security and browser tests

- Run E2E tests under network request interception: any document-upload POST, OCR CDN, telemetry request or external asset request causes test failure (excluding explicitly permitted static app-asset requests from the chosen host).
- Security tests: content security policy, escaped document text to prevent XSS, no unsafe HTML injection, no document bodies in browser console/logs, limits against decompression bombs, input sanitisation and no exposed debugging endpoint.
- IndexedDB persistence across refresh, migrations across upgrades, failed write/quota exceeded handling; mobile Safari storage eviction warning.
- Backup export → verified password decryption → validate HMAC/authentication tag via AES-GCM → restored docs and amounts identical. Wrong passphrase and bit-flipped backups fail with no partial restore.
- Accessible keyboard/navigation and sufficient mobile tap target size; test Chrome desktop, Edge/Firefox and iOS Safari where available.
- `npm run build`, type-check, lint, unit and E2E tests pass in CI with **synthetic fixtures only**.

### Readiness definitions

- **Draft:** information incomplete or unreconciled.
- **Provisional:** calculation available but relies on explicit assumptions, material unresolved items or unsupported situations. User may view/export with clear watermark.
- **Ready to check:** all supported inputs reviewed, all material issues resolved, tax rules tested and derived figures traceable. **Not a certification of tax correctness**.
- **Exported:** filing pack produced and backup recommended/verified; HMRC submission remains manual.

## 7. Security and retention model

### Threat and control matrix

| Risk | Control | Residual limitation |
| --- | --- | --- |
| Cloud transmission of tax docs | No API calls; local OCR assets; network E2E assertions | Claude Code itself is a cloud coding agent; don't show it real files |
| Local data read by someone using device/profile | OS login, device encryption, separate browser profile | No in-app encryption or login by choice |
| Browser IndexedDB evicted/cleared | Persistent-storage request where supported + encrypted backup workflow | Browser/phone may delete local storage |
| Backup theft | Strong passphrase-derived AES-GCM encrypted archive | Weak/lost passphrase may expose/prevent restoration |
| Malicious CSV/PDF/HTML | Input limits, sanitisation, library updates, sandboxed parser/worker | Third-party parser vulnerabilities remain possible |
| Sensitive records in Git | `.gitignore` user files, fixtures synthetic only, scanning | Manual accidental inclusion possible |
| Software update changes calculations | Rules version, migration, regression tests, reapproval for changed calculation | Updates still require user review |

Use an authenticated encryption envelope with: `formatVersion`, `schemaVersion`, `kdf`, parameters, random salt, random 96-bit nonce, ciphertext and authentication tag. Implement a reviewed PBKDF2-HMAC-SHA256 KDF through Web Crypto with a documented modern iteration policy or audited cross-platform memory-hard alternative. Derive keys fresh from user passphrase for each operation; never store passphrases or decrypted backup in localStorage; zero buffers when possible. Password strength guidance and recovery warning are mandatory. Backup includes original document bytes and audit records.

**Privacy during development:** Claude Code can read files in the project and transmit material to its model. Use exclusively synthetic documents and fake data while coding. Import genuine personal files only into the finished, locally running application, and keep them out of the code repository and screenshots sent to Claude.

## 8. MVP milestones and acceptance criteria

| Phase | Outcome | Exit/acceptance condition |
| --- | --- | --- |
| P0 | Scaffold, tests, architecture guardrails | App runs locally; CLAUDE instructions loaded; type/lint/test commands exist |
| P1 | Guided shell and 9-screen navigation | Responsive Start flow, resume and step state using synthetic demo |
| P2 | Local documents and persistence | Upload P60/PDF/image/CSV; original Blob persists across refresh; no network requests |
| P3 | On-device text extraction and review | Extract text PDF/PNG; source preview; uncertain/failed edits supported; offline passes |
| P4 | CSV classifier and transaction review | Two confirmed formats or one + generic fallback; ambiguous excluded, duplicate detection |
| P5 | Manual financial records and journeys | Expense, receipts and mileage manual workflows with approval and validation |
| P6 | Tax engine (2025–26) | Pure deterministic tests for rate bands, allowance, Class 4, edge cases and POA pass |
| P7 | HMRC mapping, results, warnings | SA102/SA103S/SA110 audited mappings and provisional disclosure shown |
| P8 | PDF + encrypted backup | Filing PDF and restore roundtrip tested with originals |
| P9 | Offline/PWA/accessibility/security release | Network leakage tests, storage warnings, iOS/desktop smoke tests, full regression pass |

### Strict definition of MVP acceptance

User can start a 2025–26 return; import a synthetic P60, bank CSV and receipt locally; verify extracted employment pay and PAYE; classify transactions; enter a journey; compare trading allowance with actual approved expenses; see a 2025–26 liability and distinct potential payments on account; inspect calculations and sources; copy checked HMRC figures; export a PDF and **encrypted, restorable backup**. No private files leave the device. Out-of-scope cases are **prominently provisional**.

**Hard stop:** If a key rule lacks an independently sourced test, **do not call that result filing-ready**. The app may show a provisional estimate with explicit assumptions.

## 9. Prioritisation, dependencies and trade-offs

- The upload-first preference drives **screen sequence**, not calculation-engine trust: deliver extraction UX before implementing tax, but use stubbed synthetic calculation data until pure tax engine has passed tests.
- OCR is likely the largest UX risk, especially on mobile and rotated/low-quality screenshots. Text-PDF extraction → OCR fallback → manual correction avoids ambitious unreliable “AI”.
- Start with Monzo + NatWest **only if actual export samples are available**; otherwise build a bank-agnostic mapper and one well-tested adapter before a second.
- Keep all data on the one primary browser/device. A second device cannot automatically see the first device's records. Export/restore for manual transfer.
- “Tax optimisation” is limited to mechanically comparing eligible actual expenses against eligible trading allowance. Avoid giving unsupported advice on tax elections or expense claims.

## 10. Project task backlog by user story

- **US-01**: As a first-time user I press Start and see a clear staged journey.
- **US-02**: I import original P60s/P45s/images and recover them after a refresh.
- **US-03**: I see proposed extracted values with evidence, and correct mistakes.
- **US-04**: I import bank CSV with correct dates/signs and no duplicated rows.
- **US-05**: I identify trading income and approve only qualifying expenses.
- **US-06**: I record business journeys with eligible mileage treatment.
- **US-07**: I get a short conditional questionnaire and honest unsupported-case warnings.
- **US-08**: I can reconcile PAYE tax deducted, business tax and payments on account.
- **US-09**: I understand exactly which HMRC figure came from which record.
- **US-10**: I copy values and export a reviewed PDF guide.
- **US-11**: I encrypt, export and restore a complete local backup.
- **US-12**: I can use the app offline without unexpected external requests.

## 11. Official references (verify when coding, source URLs retained)

1. HMRC 2025–26 Income Tax bands and Personal Allowance: https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
2. National Insurance rates, including 2025–26 Class 2/4: https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions
3. HMRC 2025–26 SA102 employment pages: https://www.gov.uk/government/publications/self-assessment-employment-sa102
4. HMRC 2025–26 SA103S pages and notes: https://www.gov.uk/government/publications/self-assessment-self-employment-short-sa103s
5. HMRC 2025–26 SA110 pages and calculation notes: https://www.gov.uk/government/publications/self-assessment-tax-calculation-summary-sa110
6. HMRC SA100 2025–26 overview: https://www.gov.uk/guidance/how-to-complete-your-self-assessment-tax-return-for-last-tax-year
7. Trading allowance: https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income
8. Cash basis: https://www.gov.uk/self-employed-records/overview
9. Self-employed travel/expenses: https://www.gov.uk/expenses-if-youre-self-employed/travel
10. 2025–26 business mileage rates (check previous rates): https://www.gov.uk/simpler-income-tax-simplified-expenses/vehicles
11. Payments on account: https://www.gov.uk/understand-self-assessment-bill/payments-on-account
12. Filing deadlines and registration: https://www.gov.uk/self-assessment-tax-returns/deadlines
13. MTD eligibility timetable: https://www.gov.uk/guidance/find-out-if-and-when-you-need-to-use-making-tax-digital-for-income-tax
14. Claude Code official quickstart: https://code.claude.com/docs/en/quickstart
15. Claude Code installation: https://code.claude.com/docs/en/setup
16. Vite setup: https://vite.dev/guide/

**As at 30 October 2026:** Online 2025–26 filing/payment is normally due **31 January 2027**. The normal first-time registration notification date of 5 October 2026 has passed; HMRC advises late registrants of a separate filing deadline, but payment is still generally due 31 January. For qualifying self-employment/property **gross** income over £30,000 in 2025–26, MTD for Income Tax generally starts **6 April 2027** (subject to eligibility); this product is not MTD-compliant software.

## 12. Delivery rules for Claude Code

Read `CLAUDE.md` and `docs/BUILD_PROMPTS.md` before writing code. Build **one phase at a time**, test it, then stop with a summary and the exact run/test instructions. No unreviewed live banking, personal sample data or services. If the implementation cannot reliably satisfy a stated security or tax requirement, expose it as incomplete rather than inventing a workaround or silently reducing the standard.
