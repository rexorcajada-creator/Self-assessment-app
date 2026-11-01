import { CURRENT_TAX_YEAR, type TaxYearId } from '../domain/taxYear.ts';
import {
  isConfirmationId,
  isJurisdiction,
  isScreeningId,
  type ConfirmationId,
  type Jurisdiction,
  type ScreeningId,
} from '../features/screening/questions.ts';
import { isStepId, type StepId } from './steps.ts';

/**
 * P1 draft progress: which steps were visited plus the quick-setup answers.
 *
 * Saved to this browser's localStorage as plain, UNENCRYPTED JSON. It holds
 * no documents, no bank records and no money amounts. Phase P2 replaces this
 * with the IndexedDB schema (and must migrate or discard this key).
 */
export const STORAGE_KEY = 'sa-assistant.p1-draft';
const FORMAT_VERSION = 1;

export type YesNo = 'yes' | 'no';
export type HmrcAsked = 'yes' | 'no' | 'not-sure';

export interface SetupAnswers {
  readonly jurisdiction: Jurisdiction | null;
  readonly employment: YesNo | null;
  readonly jobCount: number | null;
  readonly selfEmployment: YesNo | null;
  readonly hmrcAsked: HmrcAsked | null;
  readonly screening: Readonly<Partial<Record<ScreeningId, YesNo>>>;
}

export interface DraftProgress {
  readonly version: typeof FORMAT_VERSION;
  readonly taxYear: TaxYearId;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly lastStepId: StepId | null;
  readonly visited: readonly StepId[];
  readonly setup: SetupAnswers;
  readonly confirmations: Readonly<Partial<Record<ConfirmationId, boolean>>>;
}

/**
 * - `ok`: saving works.
 * - `unavailable`: the browser blocks storage; progress is kept in memory only.
 * - `reset`: saved progress could not be read and was discarded.
 */
export type StorageStatus = 'ok' | 'unavailable' | 'reset';

export interface DraftState {
  readonly draft: DraftProgress | null;
  readonly storage: StorageStatus;
}

export interface DraftStore {
  readonly getSnapshot: () => DraftState;
  readonly subscribe: (listener: () => void) => () => void;
  /** Start a new 2025–26 draft, replacing any existing one. */
  readonly start: () => void;
  /** Remove the draft from memory and from this browser. */
  readonly clear: () => void;
  readonly markVisited: (stepId: StepId) => void;
  readonly updateSetup: (patch: Partial<SetupAnswers>) => void;
  readonly setScreening: (id: ScreeningId, answer: YesNo) => void;
  readonly setConfirmation: (id: ConfirmationId, value: boolean) => void;
}

export const EMPTY_SETUP: SetupAnswers = {
  jurisdiction: null,
  employment: null,
  jobCount: null,
  selfEmployment: null,
  hmrcAsked: null,
  screening: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return allowed.find((a) => a === value) ?? null;
}

function parseSetup(raw: unknown): SetupAnswers {
  if (!isRecord(raw)) return EMPTY_SETUP;
  const screening: Partial<Record<ScreeningId, YesNo>> = {};
  if (isRecord(raw['screening'])) {
    for (const [key, value] of Object.entries(raw['screening'])) {
      const answer = oneOf(value, ['yes', 'no'] as const);
      if (isScreeningId(key) && answer) screening[key] = answer;
    }
  }
  const jobCount = raw['jobCount'];
  return {
    jurisdiction: isJurisdiction(raw['jurisdiction']) ? raw['jurisdiction'] : null,
    employment: oneOf(raw['employment'], ['yes', 'no'] as const),
    jobCount: typeof jobCount === 'number' && Number.isInteger(jobCount) && jobCount >= 1 && jobCount <= 9 ? jobCount : null,
    selfEmployment: oneOf(raw['selfEmployment'], ['yes', 'no'] as const),
    hmrcAsked: oneOf(raw['hmrcAsked'], ['yes', 'no', 'not-sure'] as const),
    screening,
  };
}

/** Validate saved JSON. Returns null when it is not a usable P1 draft. */
export function parseDraft(raw: unknown): DraftProgress | null {
  if (!isRecord(raw)) return null;
  if (raw['version'] !== FORMAT_VERSION || raw['taxYear'] !== CURRENT_TAX_YEAR.id) return null;
  const { startedAt, updatedAt, lastStepId, visited, confirmations } = raw;
  if (typeof startedAt !== 'string' || typeof updatedAt !== 'string' || !Array.isArray(visited)) return null;

  const parsedConfirmations: Partial<Record<ConfirmationId, boolean>> = {};
  if (isRecord(confirmations)) {
    for (const [key, value] of Object.entries(confirmations)) {
      if (isConfirmationId(key) && typeof value === 'boolean') parsedConfirmations[key] = value;
    }
  }

  return {
    version: FORMAT_VERSION,
    taxYear: CURRENT_TAX_YEAR.id,
    startedAt,
    updatedAt,
    lastStepId: typeof lastStepId === 'string' && isStepId(lastStepId) ? lastStepId : null,
    visited: [...new Set(visited.filter((v): v is StepId => typeof v === 'string' && isStepId(v)))],
    setup: parseSetup(raw['setup']),
    confirmations: parsedConfirmations,
  };
}

function load(storage: Storage | null): DraftState {
  if (!storage) return { draft: null, storage: 'unavailable' };
  let text: string | null;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { draft: null, storage: 'unavailable' };
  }
  if (text === null) return { draft: null, storage: 'ok' };
  let draft: DraftProgress | null;
  try {
    draft = parseDraft(JSON.parse(text));
  } catch {
    draft = null;
  }
  if (draft) return { draft, storage: 'ok' };
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore: the reset notice below still tells the user what happened.
  }
  return { draft: null, storage: 'reset' };
}

/**
 * Create the draft store. `storage` is normally `window.localStorage`; pass
 * null when the browser refuses access (e.g. some private-browsing modes).
 */
export function createDraftStore(storage: Storage | null, now: () => string = () => new Date().toISOString()): DraftStore {
  let state = load(storage);
  const listeners = new Set<() => void>();

  function persist(draft: DraftProgress | null): StorageStatus {
    if (!storage) return 'unavailable';
    try {
      if (draft) storage.setItem(STORAGE_KEY, JSON.stringify(draft));
      else storage.removeItem(STORAGE_KEY);
      return 'ok';
    } catch {
      return 'unavailable';
    }
  }

  function commit(draft: DraftProgress | null): void {
    const saved = persist(draft);
    // Keep showing the "reset" notice until something is saved successfully.
    const storageStatus = saved === 'ok' && state.storage === 'reset' && !draft ? 'reset' : saved;
    state = { draft, storage: storageStatus };
    for (const listener of listeners) listener();
  }

  function update(change: (draft: DraftProgress) => DraftProgress): void {
    if (!state.draft) return;
    commit({ ...change(state.draft), updatedAt: now() });
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      const timestamp = now();
      commit({
        version: FORMAT_VERSION,
        taxYear: CURRENT_TAX_YEAR.id,
        startedAt: timestamp,
        updatedAt: timestamp,
        lastStepId: null,
        visited: [],
        setup: EMPTY_SETUP,
        confirmations: {},
      });
    },
    clear() {
      commit(null);
    },
    markVisited(stepId) {
      const draft = state.draft;
      if (!draft || (draft.lastStepId === stepId && draft.visited.includes(stepId))) return;
      update((d) => ({
        ...d,
        lastStepId: stepId,
        visited: d.visited.includes(stepId) ? d.visited : [...d.visited, stepId],
      }));
    },
    updateSetup(patch) {
      update((d) => ({ ...d, setup: { ...d.setup, ...patch } }));
    },
    setScreening(id, answer) {
      update((d) => ({ ...d, setup: { ...d.setup, screening: { ...d.setup.screening, [id]: answer } } }));
    },
    setConfirmation(id, value) {
      update((d) => ({ ...d, confirmations: { ...d.confirmations, [id]: value } }));
    },
  };
}

/** Safely get localStorage; some browsers throw just for reading the property. */
export function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
