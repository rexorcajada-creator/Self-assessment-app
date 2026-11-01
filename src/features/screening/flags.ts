import type { SetupAnswers } from '../../app/draftStore.ts';
import { JURISDICTIONS, SCREENING_QUESTIONS } from './questions.ts';

export interface ScreeningFlag {
  readonly id: string;
  readonly text: string;
}

/**
 * Turn quick-setup answers into unsupported-case flags. A flag means a later
 * estimate must be labelled provisional; it never means "treat as zero".
 */
export function screeningFlags(setup: SetupAnswers): ScreeningFlag[] {
  const flags: ScreeningFlag[] = [];
  const jurisdiction = JURISDICTIONS.find((j) => j.id === setup.jurisdiction);
  if (jurisdiction && !jurisdiction.supported) {
    flags.push({
      id: `jurisdiction-${jurisdiction.id}`,
      text:
        jurisdiction.id === 'scotland'
          ? 'Scottish Income Tax rates are not supported yet. England rates will not be used in their place.'
          : 'Living outside the UK is not supported yet.',
    });
  }
  if (setup.employment === 'no' && setup.selfEmployment === 'no') {
    flags.push({
      id: 'no-supported-income',
      text: 'This app only covers PAYE employment and self-employment, and you said you had neither.',
    });
  }
  for (const question of SCREENING_QUESTIONS) {
    if (setup.screening[question.id] === 'yes') {
      flags.push({ id: `screening-${question.id}`, text: `${question.label}: not supported yet.` });
    }
  }
  return flags;
}

/** How many quick-setup questions still have no answer. */
export function unansweredCount(setup: SetupAnswers): number {
  const core = [setup.jurisdiction, setup.employment, setup.selfEmployment, setup.hmrcAsked].filter((v) => v === null).length;
  const jobs = setup.employment === 'yes' && setup.jobCount === null ? 1 : 0;
  const screening = SCREENING_QUESTIONS.filter((q) => setup.screening[q.id] === undefined).length;
  return core + jobs + screening;
}
