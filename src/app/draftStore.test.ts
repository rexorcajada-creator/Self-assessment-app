import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY, createDraftStore, parseDraft } from './draftStore.ts';

const NOW = () => '2026-01-15T10:00:00.000Z';

/** Storage whose every call throws, like some private-browsing modes. */
const throwingStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
} as unknown as Storage;

describe('draft store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with no draft', () => {
    expect(createDraftStore(window.localStorage, NOW).getSnapshot()).toEqual({ draft: null, storage: 'ok' });
  });

  it('saves progress and reloads it in a new store (page refresh)', () => {
    const store = createDraftStore(window.localStorage, NOW);
    store.start();
    store.markVisited('setup');
    store.updateSetup({ jurisdiction: 'wales', employment: 'yes', jobCount: 2 });
    store.setScreening('gift-aid', 'yes');
    store.markVisited('upload');
    store.setConfirmation('cash-basis', true);

    const reloaded = createDraftStore(window.localStorage, NOW).getSnapshot();
    expect(reloaded.storage).toBe('ok');
    expect(reloaded.draft).toMatchObject({
      taxYear: '2025-26',
      lastStepId: 'upload',
      visited: ['setup', 'upload'],
      setup: { jurisdiction: 'wales', employment: 'yes', jobCount: 2, screening: { 'gift-aid': 'yes' } },
      confirmations: { 'cash-basis': true },
    });
  });

  it('saves no money amounts or document content', () => {
    const store = createDraftStore(window.localStorage, NOW);
    store.start();
    store.markVisited('estimate');
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toMatch(/£|pence|amount/i);
  });

  it('notifies subscribers and returns a stable snapshot between changes', () => {
    const store = createDraftStore(window.localStorage, NOW);
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });
    const before = store.getSnapshot();
    expect(store.getSnapshot()).toBe(before);
    store.start();
    expect(calls).toBe(1);
    expect(store.getSnapshot()).not.toBe(before);
    unsubscribe();
    store.markVisited('setup');
    expect(calls).toBe(1);
  });

  it('does not change anything when visiting the same step twice', () => {
    const store = createDraftStore(window.localStorage, NOW);
    store.start();
    store.markVisited('setup');
    const snapshot = store.getSnapshot();
    store.markVisited('setup');
    expect(store.getSnapshot()).toBe(snapshot);
  });

  it('ignores changes when no draft has been started', () => {
    const store = createDraftStore(window.localStorage, NOW);
    store.markVisited('upload');
    store.updateSetup({ jurisdiction: 'england' });
    expect(store.getSnapshot().draft).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clear() removes the saved draft', () => {
    const store = createDraftStore(window.localStorage, NOW);
    store.start();
    store.clear();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(createDraftStore(window.localStorage, NOW).getSnapshot().draft).toBeNull();
  });

  it('discards unreadable saved data and reports a reset', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');
    const state = createDraftStore(window.localStorage, NOW).getSnapshot();
    expect(state).toEqual({ draft: null, storage: 'reset' });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('works in memory and reports when storage is unavailable', () => {
    const store = createDraftStore(throwingStorage, NOW);
    expect(store.getSnapshot().storage).toBe('unavailable');
    store.start();
    store.markVisited('upload');
    expect(store.getSnapshot().draft?.lastStepId).toBe('upload');
    expect(store.getSnapshot().storage).toBe('unavailable');
    expect(createDraftStore(null, NOW).getSnapshot()).toEqual({ draft: null, storage: 'unavailable' });
  });
});

describe('parseDraft validation', () => {
  const valid = {
    version: 1,
    taxYear: '2025-26',
    startedAt: 'x',
    updatedAt: 'y',
    lastStepId: 'upload',
    visited: ['setup', 'upload'],
    setup: {},
    confirmations: {},
  };

  it('accepts a valid draft', () => {
    expect(parseDraft(valid)?.lastStepId).toBe('upload');
  });

  it.each([
    ['wrong version', { ...valid, version: 2 }],
    ['wrong tax year', { ...valid, taxYear: '2026-27' }],
    ['missing visited list', { ...valid, visited: undefined }],
    ['not an object', 'hello'],
    ['null', null],
  ])('rejects %s', (_label, raw) => {
    expect(parseDraft(raw)).toBeNull();
  });

  it('drops unknown or invalid fields instead of trusting them', () => {
    const parsed = parseDraft({
      ...valid,
      lastStepId: 'nope',
      visited: ['setup', 'evil', 42, 'setup'],
      setup: { jurisdiction: 'mars', employment: 'maybe', jobCount: 99, screening: { 'gift-aid': 'yes', bogus: 'yes', cis: 'perhaps' } },
      confirmations: { 'cash-basis': 'true', 'p60-correct': true, other: true },
    });
    expect(parsed).toMatchObject({
      lastStepId: null,
      visited: ['setup'],
      setup: { jurisdiction: null, employment: null, jobCount: null, screening: { 'gift-aid': 'yes' } },
      confirmations: { 'p60-correct': true },
    });
  });
});
