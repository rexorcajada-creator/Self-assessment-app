/**
 * Screening questions from MASTER_SPEC §3 (Screen 1).
 * A "yes" never triggers a calculation in this app: it records an
 * unsupported-case flag so the eventual estimate is labelled provisional.
 */
export const SCREENING_QUESTIONS = [
  { id: 'benefits', label: 'Company benefits (P11D) or payrolled benefits, such as a company car or health insurance' },
  { id: 'student-loan', label: 'Student loan or postgraduate loan repayments' },
  { id: 'pension', label: 'Personal pension contributions not fully handled through your payroll' },
  { id: 'gift-aid', label: 'Gift Aid donations to charity' },
  { id: 'other-income', label: 'Savings interest, dividends, rental income or capital gains' },
  { id: 'child-benefit', label: 'Child Benefit received by you or your partner' },
  { id: 'foreign', label: 'Foreign income, foreign tax paid, or doubts about your UK residence' },
  { id: 'losses', label: 'Self-employment losses brought forward from earlier years' },
  { id: 'cis', label: 'Construction Industry Scheme (CIS) deductions' },
  { id: 'multiple-trades', label: 'More than one self-employed business' },
  { id: 'coding', label: 'PAYE tax code adjustments or tax owed from an earlier year' },
  { id: 'other-receipts', label: 'Any other significant income or receipts not mentioned above' },
] as const;

export type ScreeningId = (typeof SCREENING_QUESTIONS)[number]['id'];

export const JURISDICTIONS = [
  { id: 'england', label: 'England', supported: true },
  { id: 'wales', label: 'Wales', supported: true },
  { id: 'ni', label: 'Northern Ireland', supported: true },
  { id: 'scotland', label: 'Scotland', supported: false },
  { id: 'outside-uk', label: 'Outside the UK', supported: false },
] as const;

export type Jurisdiction = (typeof JURISDICTIONS)[number]['id'];

/** Confirmations asked on the Final questions screen (MASTER_SPEC §3, Screen 6). */
export const CONFIRMATIONS = [
  { id: 'p60-correct', label: 'My P60 or P45 totals match the original documents' },
  { id: 'no-double-count', label: 'Each job is listed once, with no P45 and P60 for the same job counted twice' },
  { id: 'cash-basis', label: 'I use the cash basis for my self-employment (the usual default)' },
  {
    id: 'trading-allowance',
    label: 'I have checked whether the trading allowance exclusions apply to me (for example, income from my employer)',
  },
  { id: 'payments-recorded', label: 'I have recorded every payment I have already made to HMRC for 2025–26' },
] as const;

export type ConfirmationId = (typeof CONFIRMATIONS)[number]['id'];

export function isScreeningId(value: string): value is ScreeningId {
  return SCREENING_QUESTIONS.some((q) => q.id === value);
}

export function isJurisdiction(value: unknown): value is Jurisdiction {
  return JURISDICTIONS.some((j) => j.id === value);
}

export function isConfirmationId(value: string): value is ConfirmationId {
  return CONFIRMATIONS.some((c) => c.id === value);
}

export const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const;
