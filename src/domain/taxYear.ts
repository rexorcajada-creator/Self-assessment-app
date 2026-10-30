/**
 * Tax year identity for this version of the app.
 * Dates are plain YYYY-MM-DD strings with no timezone conversion (MASTER_SPEC §4).
 */
export type TaxYearId = '2025-26';

export interface TaxYear {
  readonly id: TaxYearId;
  /** Human label using an en dash, e.g. "2025–26". */
  readonly label: string;
  /** First day of the tax year (inclusive). */
  readonly startDate: string;
  /** Last day of the tax year (inclusive). */
  readonly endDate: string;
}

export const CURRENT_TAX_YEAR: TaxYear = {
  id: '2025-26',
  label: '2025–26',
  startDate: '2025-04-06',
  endDate: '2026-04-05',
};
