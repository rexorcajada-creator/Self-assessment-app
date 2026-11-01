// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY } from '../../vite.config.ts';

const directives = new Map(
  CONTENT_SECURITY_POLICY.split(';').map((d) => {
    const [name = '', ...values] = d.trim().split(/\s+/);
    return [name, values] as const;
  }),
);

describe('production Content-Security-Policy', () => {
  it('only allows same-origin scripts, styles, fonts and network requests', () => {
    for (const name of ['default-src', 'script-src', 'style-src', 'font-src', 'connect-src']) {
      expect(directives.get(name), name).toEqual(["'self'"]);
    }
  });

  it('never allows inline/eval scripts, remote hosts or wildcards', () => {
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-inline|unsafe-eval|https?:|\*/);
  });

  it('blocks plugins, base-tag hijacking and form posts', () => {
    expect(directives.get('object-src')).toEqual(["'none'"]);
    expect(directives.get('base-uri')).toEqual(["'none'"]);
    expect(directives.get('form-action')).toEqual(["'none'"]);
  });
});
