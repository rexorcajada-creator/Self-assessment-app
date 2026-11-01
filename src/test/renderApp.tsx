import { render } from '@testing-library/react';
import { App } from '../app/App.tsx';
import { createDraftStore } from '../app/draftStore.ts';

/**
 * Render the whole app the way main.tsx does. Passing the same storage to a
 * second call simulates a page refresh (fresh store, same saved data, same URL).
 */
export function renderApp(storage: Storage | null = window.localStorage, options: { readonly started?: boolean } = {}) {
  const store = createDraftStore(storage, () => '2026-01-15T10:00:00.000Z');
  if (options.started) store.start();
  return { store, ...render(<App store={store} />) };
}

/** Reset URL (without firing hashchange) and saved progress between tests. */
export function resetBrowserState(): void {
  window.history.replaceState(null, '', '/');
  window.localStorage.clear();
}
