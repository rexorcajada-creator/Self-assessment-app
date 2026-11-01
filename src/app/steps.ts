/**
 * The nine guided journey steps from MASTER_SPEC §3 (screens 1–9).
 * Screen 0 (Welcome) sits outside the stepper.
 */
export const STEP_IDS = [
  'setup',
  'upload',
  'extracted',
  'transactions',
  'expenses',
  'final-questions',
  'estimate',
  'filing',
  'backup',
] as const;

export type StepId = (typeof STEP_IDS)[number];

export interface JourneyStep {
  readonly id: StepId;
  /** 1-based position shown to the user ("Step 2 of 9"). */
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  /** Build phase expected to make this screen work with real data. */
  readonly phase: string;
}

export const JOURNEY_STEPS: readonly JourneyStep[] = [
  {
    id: 'setup',
    number: 1,
    title: 'Quick setup and screening',
    summary: 'A few quick questions so we can spot situations this app does not support yet.',
    phase: 'P1',
  },
  {
    id: 'upload',
    number: 2,
    title: 'Upload documents',
    summary: 'Add your P60 or P45, bank CSV files, receipts and screenshots. Files stay on this device.',
    phase: 'P2',
  },
  {
    id: 'extracted',
    number: 3,
    title: 'Check extracted figures',
    summary: 'Check the figures read from your documents and correct anything that looks wrong.',
    phase: 'P3',
  },
  {
    id: 'transactions',
    number: 4,
    title: 'Bank transactions',
    summary: 'Import a bank CSV and confirm how each transaction should be treated.',
    phase: 'P4',
  },
  {
    id: 'expenses',
    number: 5,
    title: 'Expenses and journeys',
    summary: 'Record business expenses and business journeys.',
    phase: 'P5',
  },
  {
    id: 'final-questions',
    number: 6,
    title: 'Final questions',
    summary: 'Confirm the remaining facts and any payments you have already made to HMRC.',
    phase: 'P6',
  },
  {
    id: 'estimate',
    number: 7,
    title: 'Tax estimate',
    summary: 'See the estimate, its assumptions and where each figure came from.',
    phase: 'P7',
  },
  {
    id: 'filing',
    number: 8,
    title: 'HMRC filing guide',
    summary: 'Copy figures by HMRC box and download a PDF guide to help you file yourself.',
    phase: 'P7–P8',
  },
  {
    id: 'backup',
    number: 9,
    title: 'Back up and finish',
    summary: 'Save an encrypted backup and learn how to keep or delete your local data.',
    phase: 'P8',
  },
];

export const TOTAL_STEPS = JOURNEY_STEPS.length;

export function isStepId(value: string): value is StepId {
  return (STEP_IDS as readonly string[]).includes(value);
}

export function getStep(id: StepId): JourneyStep {
  const step = JOURNEY_STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown step: ${id}`);
  return step;
}

export function previousStep(id: StepId): JourneyStep | undefined {
  return JOURNEY_STEPS[getStep(id).number - 2];
}

export function nextStep(id: StepId): JourneyStep | undefined {
  return JOURNEY_STEPS[getStep(id).number];
}
