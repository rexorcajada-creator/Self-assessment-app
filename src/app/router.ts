import { useSyncExternalStore } from 'react';
import { isStepId, type StepId } from './steps.ts';

/**
 * Tiny hash router. Hash routes keep the app a static site (no server
 * rewrites needed), survive a page refresh and work with the browser's
 * Back/Forward buttons.
 *
 *   #/              Welcome
 *   #/restore       Restore backup (placeholder)
 *   #/step/<id>     One of the nine journey steps
 */
export type Route =
  | { readonly name: 'welcome' }
  | { readonly name: 'restore' }
  | { readonly name: 'step'; readonly stepId: StepId }
  | { readonly name: 'not-found'; readonly path: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '');
  if (path === '' || path === '/') return { name: 'welcome' };
  if (path === '/restore') return { name: 'restore' };
  const match = /^\/step\/([a-z-]+)$/.exec(path);
  if (match?.[1] !== undefined && isStepId(match[1])) {
    return { name: 'step', stepId: match[1] };
  }
  return { name: 'not-found', path };
}

export function routeHref(route: Route): string {
  switch (route.name) {
    case 'welcome':
      return '#/';
    case 'restore':
      return '#/restore';
    case 'step':
      return `#/step/${route.stepId}`;
    case 'not-found':
      return `#${route.path}`;
  }
}

export function stepHref(stepId: StepId): string {
  return routeHref({ name: 'step', stepId });
}

/** Navigate by adding a browser history entry, so the browser Back button works. */
export function navigate(route: Route): void {
  window.location.hash = routeHref(route);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
  };
}

function getHash(): string {
  return window.location.hash;
}

/** Current location hash; re-renders when it changes. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, getHash, () => '');
}
