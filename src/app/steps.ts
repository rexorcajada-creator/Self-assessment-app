/**
 * The guided journey screens from MASTER_SPEC §3.
 * P0 only renders placeholders; real screens arrive in P1 and later phases.
 */
export interface JourneyStep {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  /** Build phase that is expected to implement this screen. */
  readonly phase: string;
}

export const JOURNEY_STEPS: readonly JourneyStep[] = [
  { id: 'welcome', number: 0, title: 'Welcome', summary: 'Start, resume or restore a 2025–26 return.', phase: 'P1' },
  { id: 'setup', number: 1, title: 'Quick setup and screening', summary: 'A few yes/no questions to spot unsupported situations.', phase: 'P1' },
  { id: 'upload', number: 2, title: 'Upload documents', summary: 'Add P60/P45, bank CSVs, receipts and screenshots. Files stay on this device.', phase: 'P2' },
  { id: 'extracted', number: 3, title: 'Check extracted figures', summary: 'Review and correct figures read from your documents.', phase: 'P3' },
  { id: 'transactions', number: 4, title: 'Bank transactions', summary: 'Import a bank CSV and approve how each item is treated.', phase: 'P4' },
  { id: 'expenses', number: 5, title: 'Expenses and journeys', summary: 'Record business expenses and mileage.', phase: 'P5' },
  { id: 'reconcile', number: 6, title: 'Final questions', summary: 'Confirm missing facts and payments already made to HMRC.', phase: 'P6' },
  { id: 'dashboard', number: 7, title: 'Tax estimate', summary: 'See the estimate, its assumptions and where each figure came from.', phase: 'P7' },
  { id: 'filing', number: 8, title: 'HMRC filing guide', summary: 'Copy figures by HMRC box and download a PDF guide.', phase: 'P8' },
  { id: 'backup', number: 9, title: 'Back up and finish', summary: 'Export an encrypted backup of your return.', phase: 'P8' },
];
