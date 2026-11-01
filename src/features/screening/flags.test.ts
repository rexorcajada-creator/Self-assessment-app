import { describe, expect, it } from 'vitest';
import { EMPTY_SETUP } from '../../app/draftStore.ts';
import { screeningFlags, unansweredCount } from './flags.ts';
import { SCREENING_QUESTIONS } from './questions.ts';

describe('screening flags', () => {
  it('flags nothing for a supported, fully answered setup', () => {
    const screening = Object.fromEntries(SCREENING_QUESTIONS.map((q) => [q.id, 'no' as const]));
    const setup = { ...EMPTY_SETUP, jurisdiction: 'england' as const, employment: 'yes' as const, jobCount: 1, selfEmployment: 'yes' as const, hmrcAsked: 'yes' as const, screening };
    expect(screeningFlags(setup)).toEqual([]);
    expect(unansweredCount(setup)).toBe(0);
  });

  it('flags Scotland without falling back to England rates', () => {
    const flags = screeningFlags({ ...EMPTY_SETUP, jurisdiction: 'scotland' });
    expect(flags).toHaveLength(1);
    expect(flags[0]?.text).toMatch(/Scottish .* not supported/);
  });

  it('flags every "yes" screening answer', () => {
    const flags = screeningFlags({ ...EMPTY_SETUP, screening: { 'student-loan': 'yes', cis: 'yes', pension: 'no' } });
    expect(flags.map((f) => f.id)).toEqual(['screening-student-loan', 'screening-cis']);
  });

  it('counts unanswered questions, including job count when employed', () => {
    expect(unansweredCount(EMPTY_SETUP)).toBe(4 + SCREENING_QUESTIONS.length);
    expect(unansweredCount({ ...EMPTY_SETUP, employment: 'yes' })).toBe(3 + 1 + SCREENING_QUESTIONS.length);
  });
});
