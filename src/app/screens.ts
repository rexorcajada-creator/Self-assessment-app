import { BackupContent } from '../features/backup/BackupScreen.tsx';
import { EstimateContent } from '../features/tax/ui/EstimateScreen.tsx';
import { ExpensesContent } from '../features/mileage/ExpensesScreen.tsx';
import { ExtractedContent } from '../features/documents/ExtractedScreen.tsx';
import { FilingContent } from '../features/filing/FilingScreen.tsx';
import { FinalQuestionsContent } from '../features/screening/FinalQuestionsScreen.tsx';
import { SetupContent } from '../features/setup/SetupScreen.tsx';
import { TransactionsContent } from '../features/transactions/TransactionsScreen.tsx';
import { UploadContent } from '../features/documents/UploadScreen.tsx';
import { stepHref } from './router.ts';
import type { ScreenDefinition } from './screenTypes.ts';
import type { StepId } from './steps.ts';

/** Each journey screen with its empty, loading and error copy. */
export const SCREENS: Readonly<Record<StepId, ScreenDefinition>> = {
  setup: {
    Content: SetupContent,
    empty: {
      title: 'No answers yet',
      body: 'Answer a few quick questions so we can spot situations this app does not support yet.',
    },
    loading: 'Loading your answers…',
    error: {
      title: 'Your answers could not be loaded',
      body: 'Your browser did not let the app read its saved answers. Nothing was sent anywhere. Try again, or reload the page.',
    },
  },
  upload: {
    Content: UploadContent,
    empty: {
      title: 'No documents added yet',
      body: 'Add a P60 or P45, a bank CSV or receipts. You can also enter figures by hand.',
    },
    loading: 'Saving your files on this device…',
    error: {
      title: 'That file could not be saved',
      body: 'Your browser may be out of storage space. Nothing was uploaded anywhere. Free up some space or remove old documents, then try again.',
    },
  },
  extracted: {
    Content: ExtractedContent,
    empty: {
      title: 'Nothing to check yet',
      body: 'Upload a P60, P45 or receipt first, or enter the figures by hand.',
      action: { label: 'Go to Upload documents', href: stepHref('upload') },
    },
    loading: 'Reading your document on this device…',
    error: {
      title: 'This document could not be read',
      body: 'It may be blurred, rotated or password-protected. You can type the figures in yourself instead.',
    },
  },
  transactions: {
    Content: TransactionsContent,
    empty: {
      title: 'No bank transactions yet',
      body: 'Import a CSV file exported from your bank’s website or app. Only 2025–26 transactions will be used.',
    },
    loading: 'Reading your CSV file on this device…',
    error: {
      title: 'This CSV file could not be read',
      body: 'Its columns did not match a known bank format. You will be able to match the columns yourself.',
    },
  },
  expenses: {
    Content: ExpensesContent,
    empty: {
      title: 'No expenses or journeys yet',
      body: 'Add business costs and business journeys, or skip this step if you have none.',
    },
    loading: 'Loading your expenses and journeys…',
    error: {
      title: 'Your expenses could not be loaded',
      body: 'Your browser did not let the app read its saved records. Nothing has been deleted. Try again, or reload the page.',
    },
  },
  'final-questions': {
    Content: FinalQuestionsContent,
    empty: {
      title: 'No questions left',
      body: 'There is nothing else to confirm for now.',
    },
    loading: 'Checking what is still missing…',
    error: {
      title: 'Your answers could not be checked',
      body: 'Something went wrong while checking your answers. Nothing has been changed. Try again.',
    },
  },
  estimate: {
    Content: EstimateContent,
    empty: {
      title: 'No estimate yet',
      body: 'The 2025–26 tax engine has not been built yet (phase P6). No tax figures are worked out in this preview.',
    },
    loading: 'Working out your estimate on this device…',
    error: {
      title: 'The estimate could not be worked out',
      body: 'Something in your records needs fixing first. Your records have not been changed.',
    },
  },
  filing: {
    Content: FilingContent,
    empty: {
      title: 'No filing figures yet',
      body: 'Figures appear here once your records are checked and the estimate has been worked out.',
    },
    loading: 'Preparing your filing guide on this device…',
    error: {
      title: 'The filing guide could not be prepared',
      body: 'Something went wrong while preparing the guide. Your records have not been changed. Try again.',
    },
  },
  backup: {
    Content: BackupContent,
    empty: {
      title: 'Nothing to back up yet',
      body: 'Once you add documents or records, you can export them here as an encrypted backup.',
    },
    loading: 'Encrypting your backup on this device…',
    error: {
      title: 'The backup could not be created',
      body: 'Your browser may be low on memory or storage. Nothing has been changed or sent anywhere. Try again.',
    },
  },
};
