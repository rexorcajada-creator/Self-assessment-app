// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readRepoFile } from './repoFiles.ts';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const pkg = JSON.parse(readRepoFile('package.json')) as PackageJson;
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

/**
 * Package-name patterns for analytics, telemetry, AI/model APIs, cloud OCR,
 * cloud storage and banking SDKs. None of these may be installed
 * (CLAUDE.md: no cloud storage, no analytics, no external OCR/AI, no bank API).
 */
const BANNED_PATTERNS: readonly RegExp[] = [
  /analytics/i,
  /telemetry/i,
  /^@?sentry/i,
  /posthog/i,
  /mixpanel/i,
  /amplitude/i,
  /segment/i,
  /datadog/i,
  /hotjar/i,
  /^@?openai/i,
  /^@anthropic-ai\//i,
  /^@google\/(generative-ai|genai)/i,
  /langchain/i,
  /^@aws-sdk\//i,
  /^aws-sdk$/i,
  /^@azure\//i,
  /^@google-cloud\//i,
  /^firebase/i,
  /supabase/i,
  /plaid/i,
  /truelayer/i,
  /yapily/i,
  /gocardless/i,
  /^axios$/i,
];

describe('dependency guardrails', () => {
  it('has no analytics, AI, cloud or banking SDKs installed', () => {
    const offenders = Object.keys(allDeps).filter((name) => BANNED_PATTERNS.some((re) => re.test(name)));
    expect(offenders).toEqual([]);
  });

  it('pins every dependency to an exact version', () => {
    const loose = Object.entries(allDeps).filter(([, version]) => !/^\d+\.\d+\.\d+$/.test(version));
    expect(loose).toEqual([]);
  });
});
