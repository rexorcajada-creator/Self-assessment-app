import { describe, expect, it } from 'vitest';
import { parseHash, routeHref } from './router.ts';
import { STEP_IDS } from './steps.ts';

describe('hash router', () => {
  it.each(['', '#', '#/', '#//'])('treats %j as Welcome', (hash) => {
    expect(parseHash(hash)).toEqual({ name: 'welcome' });
  });

  it('parses the restore route', () => {
    expect(parseHash('#/restore')).toEqual({ name: 'restore' });
  });

  it.each(STEP_IDS)('round-trips step %s', (stepId) => {
    const href = routeHref({ name: 'step', stepId });
    expect(parseHash(href)).toEqual({ name: 'step', stepId });
  });

  it.each(['#/step/unknown', '#/step/', '#/steps/upload', '#/step/upload/extra', '#upload'])('reports %s as not found', (hash) => {
    expect(parseHash(hash).name).toBe('not-found');
  });
});
