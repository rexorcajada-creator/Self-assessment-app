import { createContext, useContext, useSyncExternalStore } from 'react';
import type { DraftState, DraftStore } from './draftStore.ts';

export const DraftContext = createContext<DraftStore | null>(null);

/** Read the draft progress and get the store to change it. */
export function useDraft(): { readonly state: DraftState; readonly store: DraftStore } {
  const store = useContext(DraftContext);
  if (!store) throw new Error('useDraft must be used inside <DraftContext>');
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { state, store };
}
