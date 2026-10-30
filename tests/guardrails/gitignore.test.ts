// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { repoRoot } from './repoFiles.ts';

/** Returns true when git would ignore the given (possibly non-existent) path. */
function isIgnored(path: string): boolean {
  try {
    execFileSync('git', ['check-ignore', '--quiet', '--no-index', path], { cwd: repoRoot });
    return true;
  } catch {
    return false;
  }
}

describe('.gitignore protects personal data', () => {
  it.each([
    'P60-2026.pdf',
    'docs/my-p45.pdf',
    'receipt.jpg',
    'screenshot.PNG'.toLowerCase(),
    'IMG_0001.heic',
    'monzo-export.csv',
    'natwest statement.xlsx',
    'statement.ofx',
    'tax-return.sabackup',
    'my-return.enc',
    'return-backup.json',
    'filing-guide-2025-26.pdf',
    'private/anything.txt',
    'backups/2026-01-01.json',
    'exports/data.json',
    'uploads/p60.pdf',
    'records.zip',
    '.env',
    '.env.production',
    'public/p60.pdf',
    'public/statement.csv',
  ])('ignores %s', (path) => {
    expect(isIgnored(path)).toBe(true);
  });

  it.each([
    'src/test/fixtures/synthetic-p60.pdf',
    'src/test/fixtures/synthetic-monzo.csv',
    'e2e/fixtures/synthetic-receipt.png',
    'public/icons/icon-192.png',
    'src/app/App.tsx',
    'docs/MASTER_SPEC.md',
    'package-lock.json',
    '.env.example',
  ])('does not ignore %s', (path) => {
    expect(isIgnored(path)).toBe(false);
  });
});
