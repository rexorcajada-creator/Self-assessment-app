import { describe, expect, it } from 'vitest';
import { CURRENT_TAX_YEAR } from './taxYear.ts';

describe('CURRENT_TAX_YEAR', () => {
  it('is the 2025–26 UK tax year, 6 April 2025 to 5 April 2026', () => {
    expect(CURRENT_TAX_YEAR).toEqual({
      id: '2025-26',
      label: '2025–26',
      startDate: '2025-04-06',
      endDate: '2026-04-05',
    });
  });
});
